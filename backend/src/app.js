const express = require('express');
const mongoose = require('mongoose');
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

// Import routes
const authRoutes = require('./routes/auth');
const studentRoutes = require('./routes/students');
const courseRoutes = require('./routes/courses');
const enrollmentRoutes = require('./routes/enrollments');
const instructorRoutes = require('./routes/instructors');
const staffRoutes = require('./routes/staff');
const departmentRoutes = require('./routes/departments');
const facultyRoutes = require('./routes/faculties');
const gradeRoutes = require('./routes/grades');
const transcriptRoutes = require('./routes/transcripts');
const attendanceRoutes = require('./routes/attendance');
const tuitionRoutes = require('./routes/tuition');
const payrollRoutes = require('./routes/payroll');
const scholarshipRoutes = require('./routes/scholarships');
const libraryRoutes = require('./routes/library');
const eventRoutes = require('./routes/events');
const alumniRoutes = require('./routes/alumni');
const housingRoutes = require('./routes/housing');
const healthRoutes = require('./routes/health');
const transportationRoutes = require('./routes/transportation');
const researchRoutes = require('./routes/research');
const publicationRoutes = require('./routes/publications');
const internshipRoutes = require('./routes/internships');
const notificationRoutes = require('./routes/notifications');
const reportRoutes = require('./routes/reports');
const auditRoutes = require('./routes/audit');
const certificateRoutes = require('./routes/certificateRoutes');

// Import middleware
const errorHandler = require('./middleware/errorHandler');
const notFound = require('./middleware/notFound');
const i18n = require('./middleware/i18n');
const logger = require('./utils/logger');

const app = express();

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
app.use(i18n);

// Static files
app.use('/uploads', express.static('uploads'));

// Health check endpoint
app.get('/api/v1/health', (req, res) => {
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

apiRouter.use('/auth', authRoutes);
apiRouter.use('/students', studentRoutes);
apiRouter.use('/courses', courseRoutes);
apiRouter.use('/enrollments', enrollmentRoutes);
apiRouter.use('/instructors', instructorRoutes);
apiRouter.use('/staff', staffRoutes);
apiRouter.use('/departments', departmentRoutes);
apiRouter.use('/faculties', facultyRoutes);
apiRouter.use('/grades', gradeRoutes);
apiRouter.use('/transcripts', transcriptRoutes);
apiRouter.use('/attendance', attendanceRoutes);
apiRouter.use('/tuition', tuitionRoutes);
apiRouter.use('/payroll', payrollRoutes);
apiRouter.use('/scholarships', scholarshipRoutes);
apiRouter.use('/library', libraryRoutes);
apiRouter.use('/events', eventRoutes);
apiRouter.use('/alumni', alumniRoutes);
apiRouter.use('/housing', housingRoutes);
apiRouter.use('/health', healthRoutes);
apiRouter.use('/transportation', transportationRoutes);
apiRouter.use('/research', researchRoutes);
apiRouter.use('/publications', publicationRoutes);
apiRouter.use('/internships', internshipRoutes);
apiRouter.use('/notifications', notificationRoutes);
apiRouter.use('/reports', reportRoutes);
apiRouter.use('/audit', auditRoutes);
apiRouter.use('/certificates', certificateRoutes);

app.use(`/api/${process.env.API_VERSION || 'v1'}`, apiRouter);

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
          url: `http://localhost:${process.env.PORT || 5000}/api/v1`,
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
      useNewUrlParser: true,
      useUnifiedTopology: true,
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
      logger.info(`Health check available at: http://localhost:${PORT}/api/v1/health`);
      if (process.env.ENABLE_SWAGGER === 'true') {
        logger.info(`API Documentation available at: http://localhost:${PORT}/api-docs`);
      }
    });
  });
}

module.exports = app;