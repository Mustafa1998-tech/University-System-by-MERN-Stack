const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const fs = require('fs');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');
const rateLimit = require('express-rate-limit');
require('express-async-errors');
require('dotenv').config();

// Import middleware
const errorHandler = require('./middleware/errorHandler');
const notFound = require('./middleware/notFound');
const { i18nMiddleware } = require('./middleware/i18n');
const logger = require('./utils/logger');

const app = express();
const apiVersion = process.env.API_VERSION || 'v1';
const routesDirectory = path.join(__dirname, 'routes');

const routeRegistry = [
  { mountPath: '/auth', file: 'auth.js' },
  { mountPath: '/students', file: 'students.js' },
  { mountPath: '/courses', file: 'courses.js' },
  { mountPath: '/enrollments', file: 'enrollments.js' },
  { mountPath: '/instructors', file: 'instructors.js' },
  { mountPath: '/staff', file: 'staff.js' },
  { mountPath: '/departments', file: 'departments.js' },
  { mountPath: '/faculties', file: 'faculties.js' },
  { mountPath: '/grades', file: 'grades.js' },
  { mountPath: '/transcripts', file: 'transcripts.js' },
  { mountPath: '/attendance', file: 'attendance.js' },
  { mountPath: '/tuition', file: 'tuition.js' },
  { mountPath: '/payroll', file: 'payroll.js' },
  { mountPath: '/scholarships', file: 'scholarships.js' },
  { mountPath: '/library', file: 'library.js' },
  { mountPath: '/events', file: 'events.js' },
  { mountPath: '/alumni', file: 'alumni.js' },
  { mountPath: '/housing', file: 'housing.js' },
  { mountPath: '/health', file: 'health.js' },
  { mountPath: '/transportation', file: 'transportation.js' },
  { mountPath: '/research', file: 'research.js' },
  { mountPath: '/publications', file: 'publications.js' },
  { mountPath: '/internships', file: 'internships.js' },
  { mountPath: '/notifications', file: 'notifications.js' },
  { mountPath: '/reports', file: 'reports.js' },
  { mountPath: '/audit', file: 'audit.js' },
  { mountPath: '/certificates', file: 'certificateRoutes.js' },
  { mountPath: '/files', file: 'files.js' }
];

function registerAvailableRoutes(router) {
  const loadedRoutes = [];
  const missingRoutes = [];

  routeRegistry.forEach((route) => {
    const routeFilePath = path.join(routesDirectory, route.file);

    if (!fs.existsSync(routeFilePath)) {
      missingRoutes.push(route.mountPath);
      return;
    }

    try {
      const routeModule = require(routeFilePath);
      router.use(route.mountPath, routeModule);
      loadedRoutes.push(route.mountPath);
    } catch (error) {
      missingRoutes.push(route.mountPath);
      logger.warn(`Failed to load route module ${route.file}: ${error.message}`);
    }
  });

  return { loadedRoutes, missingRoutes };
}

// Trust proxy for accurate IP addresses
app.set('trust proxy', 1);

// Security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes
  max: parseInt(process.env.RATE_LIMIT_MAX) || 100,
  message: {
    error: 'Too many requests from this IP, please try again later.',
    errorAr: 'طلبات كثيرة جداً من هذا العنوان، يرجى المحاولة لاحقاً.'
  },
  standardHeaders: true,
  legacyHeaders: false,
});
app.use(limiter);

// CORS configuration
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept-Language'],
}));

// Compression
app.use(compression());

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Security middleware
app.use(mongoSanitize());
app.use(xss());
app.use(hpp());

// Logging
if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('combined', { stream: { write: message => logger.info(message.trim()) } }));
}

// Internationalization
app.use(i18nMiddleware);

// Static files
app.use('/uploads', express.static('uploads'));

// Health check endpoint
app.get(`/api/${apiVersion}/health`, (req, res) => {
  res.status(200).json({
    status: 'success',
    message: 'SIS API is running smoothly',
    messageAr: 'واجهة برمجة تطبيقات نظام معلومات الطلاب تعمل بسلاسة',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    version: '1.0.0',
    services: {
      database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
      redis: 'connected', // TODO: Add actual Redis health check
    }
  });
});

// API routes
const apiRouter = express.Router();
const routeStatus = registerAvailableRoutes(apiRouter);

apiRouter.get('/system/info', (req, res) => {
  res.status(200).json({
    status: 'success',
    service: 'SIS Backend API',
    apiVersion,
    environment: process.env.NODE_ENV || 'development',
    uptimeSeconds: Math.floor(process.uptime()),
    nodeVersion: process.version,
    loadedRoutes: routeStatus.loadedRoutes,
    missingRoutes: routeStatus.missingRoutes
  });
});

if (routeStatus.missingRoutes.length > 0) {
  logger.warn(`Skipping unavailable route modules: ${routeStatus.missingRoutes.join(', ')}`);
}

app.use(`/api/${apiVersion}`, apiRouter);

// Swagger documentation
if (process.env.ENABLE_SWAGGER === 'true') {
  const swaggerJsdoc = require('swagger-jsdoc');
  const swaggerUi = require('swagger-ui-express');
  
  const options = {
    definition: {
      openapi: '3.0.0',
      info: {
        title: 'SIS University API',
        version: '1.0.0',
        description: 'Student Information System API Documentation',
      },
      servers: [
        {
          url: `http://localhost:${process.env.PORT || 5000}/api/${apiVersion}`,
          description: 'Development server',
        },
      ],
    },
    apis: ['./src/routes/*.js'],
  };
  
  const specs = swaggerJsdoc(options);
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs));
}

// Error handling middleware
app.use(notFound);
app.use(errorHandler);

// Database connection
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/sis_university', {
      serverSelectionTimeoutMS: 10000
    });
    
    logger.info(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    logger.error('MongoDB connection failed:', error);
    process.exit(1);
  }
};

// Start server
const PORT = process.env.PORT || 5000;

if (process.env.NODE_ENV !== 'test') {
  connectDB().then(() => {
    app.listen(PORT, () => {
      logger.info(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
      logger.info(`Health check available at: http://localhost:${PORT}/api/${apiVersion}/health`);
      logger.info(`System info available at: http://localhost:${PORT}/api/${apiVersion}/system/info`);
      if (process.env.ENABLE_SWAGGER === 'true') {
        logger.info(`API Documentation available at: http://localhost:${PORT}/api-docs`);
      }
    });
  });
}

module.exports = app;
