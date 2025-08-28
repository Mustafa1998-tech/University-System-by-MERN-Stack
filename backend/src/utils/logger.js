const winston = require('winston');
const DailyRotateFile = require('winston-daily-rotate-file');
const path = require('path');

// Create logs directory if it doesn't exist
const fs = require('fs');
const logDir = path.join(__dirname, '../../logs');
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir, { recursive: true });
}

// Define log levels
const levels = {
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  debug: 4,
};

// Define log colors
const colors = {
  error: 'red',
  warn: 'yellow',
  info: 'green',
  http: 'magenta',
  debug: 'white',
};

winston.addColors(colors);

// Custom format for better readability
const format = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss:ms' }),
  winston.format.colorize({ all: true }),
  winston.format.printf(
    (info) => `${info.timestamp} ${info.level}: ${info.message}`,
  ),
);

// Define different transports
const transports = [
  // Console transport for development
  new winston.transports.Console({
    format,
    level: process.env.NODE_ENV === 'production' ? 'warn' : 'debug'
  }),
  
  // File transport for all logs
  new DailyRotateFile({
    filename: path.join(logDir, 'application-%DATE%.log'),
    datePattern: 'YYYY-MM-DD',
    zippedArchive: true,
    maxSize: '20m',
    maxFiles: '14d',
    format: winston.format.combine(
      winston.format.timestamp(),
      winston.format.json()
    )
  }),
  
  // File transport for error logs
  new DailyRotateFile({
    filename: path.join(logDir, 'error-%DATE%.log'),
    datePattern: 'YYYY-MM-DD',
    zippedArchive: true,
    maxSize: '20m',
    maxFiles: '30d',
    level: 'error',
    format: winston.format.combine(
      winston.format.timestamp(),
      winston.format.json()
    )
  }),
  
  // File transport for HTTP requests
  new DailyRotateFile({
    filename: path.join(logDir, 'http-%DATE%.log'),
    datePattern: 'YYYY-MM-DD',
    zippedArchive: true,
    maxSize: '20m',
    maxFiles: '7d',
    level: 'http',
    format: winston.format.combine(
      winston.format.timestamp(),
      winston.format.json()
    )
  })
];

// Create the logger
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  levels,
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  transports,
  exitOnError: false
});

// Custom logging methods for different use cases
logger.logRequest = (req, res, responseTime) => {
  const { method, url, ip, headers } = req;
  const { statusCode } = res;
  const userAgent = headers['user-agent'] || '';
  const userId = req.user?.id || 'anonymous';
  const language = req.language || 'en';
  
  logger.http('HTTP Request', {
    method,
    url,
    statusCode,
    responseTime: `${responseTime}ms`,
    ip,
    userAgent,
    userId,
    language,
    timestamp: new Date().toISOString()
  });
};

logger.logAuthentication = (action, userId, email, ip, success = true, reason = null) => {
  const level = success ? 'info' : 'warn';
  
  logger.log(level, `Authentication: ${action}`, {
    action,
    userId,
    email,
    ip,
    success,
    reason,
    timestamp: new Date().toISOString()
  });
};

logger.logDatabaseOperation = (operation, collection, userId, documentId = null, changes = null) => {
  logger.info(`Database: ${operation}`, {
    operation,
    collection,
    userId,
    documentId,
    changes,
    timestamp: new Date().toISOString()
  });
};

logger.logSecurityEvent = (event, userId = null, ip = null, details = null, severity = 'medium') => {
  const level = severity === 'high' ? 'error' : severity === 'medium' ? 'warn' : 'info';
  
  logger.log(level, `Security: ${event}`, {
    event,
    userId,
    ip,
    details,
    severity,
    timestamp: new Date().toISOString()
  });
};

logger.logBusinessEvent = (event, userId, entityType, entityId, details = null) => {
  logger.info(`Business: ${event}`, {
    event,
    userId,
    entityType,
    entityId,
    details,
    timestamp: new Date().toISOString()
  });
};

logger.logPayment = (action, studentId, amount, currency, paymentMethod, transactionId, status) => {
  logger.info(`Payment: ${action}`, {
    action,
    studentId,
    amount,
    currency,
    paymentMethod,
    transactionId,
    status,
    timestamp: new Date().toISOString()
  });
};

logger.logAcademicEvent = (event, studentId, courseId, instructorId, details = null) => {
  logger.info(`Academic: ${event}`, {
    event,
    studentId,
    courseId,
    instructorId,
    details,
    timestamp: new Date().toISOString()
  });
};

logger.logSystemEvent = (event, component, status, details = null) => {
  const level = status === 'error' ? 'error' : status === 'warning' ? 'warn' : 'info';
  
  logger.log(level, `System: ${event}`, {
    event,
    component,
    status,
    details,
    timestamp: new Date().toISOString()
  });
};

logger.logPerformance = (operation, duration, details = null) => {
  logger.info(`Performance: ${operation}`, {
    operation,
    duration: `${duration}ms`,
    details,
    timestamp: new Date().toISOString()
  });
};

// Middleware for automatic request logging
logger.requestMiddleware = () => {
  return (req, res, next) => {
    const start = Date.now();
    
    res.on('finish', () => {
      const duration = Date.now() - start;
      logger.logRequest(req, res, duration);
    });
    
    next();
  };
};

// Error logging with context
logger.logError = (error, context = {}) => {
  logger.error('Application Error', {
    message: error.message,
    stack: error.stack,
    ...context,
    timestamp: new Date().toISOString()
  });
};

// Log application startup
logger.logStartup = (port, environment) => {
  logger.info('Application Started', {
    port,
    environment,
    nodeVersion: process.version,
    timestamp: new Date().toISOString()
  });
};

// Log application shutdown
logger.logShutdown = (reason) => {
  logger.info('Application Shutdown', {
    reason,
    timestamp: new Date().toISOString()
  });
};

// Handle uncaught exceptions and unhandled rejections
if (process.env.NODE_ENV === 'production') {
  process.on('uncaughtException', (error) => {
    logger.error('Uncaught Exception', {
      message: error.message,
      stack: error.stack,
      timestamp: new Date().toISOString()
    });
    process.exit(1);
  });
  
  process.on('unhandledRejection', (reason, promise) => {
    logger.error('Unhandled Rejection', {
      reason: reason.toString(),
      promise: promise.toString(),
      timestamp: new Date().toISOString()
    });
  });
}

module.exports = logger;