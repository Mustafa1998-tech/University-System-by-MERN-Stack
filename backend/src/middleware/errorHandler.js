const AppError = require('../utils/appError');
const logger = require('../utils/logger');

const handleCastErrorDB = (err, language = 'en') => {
  const message = {
    en: `Invalid ${err.path}: ${err.value}.`,
    ar: `قيمة غير صالحة ${err.path}: ${err.value}.`
  };
  return new AppError(message, 400);
};

const handleDuplicateFieldsDB = (err, language = 'en') => {
  const value = err.errmsg?.match(/(["'])(\\?.)*?\1/)?.[0];
  const message = {
    en: `Duplicate field value: ${value}. Please use another value!`,
    ar: `قيمة مكررة: ${value}. يرجى استخدام قيمة أخرى!`
  };
  return new AppError(message, 400);
};

const handleValidationErrorDB = (err, language = 'en') => {
  const errors = Object.values(err.errors).map(el => el.message);
  const message = {
    en: `Invalid input data. ${errors.join('. ')}`,
    ar: `بيانات إدخال غير صالحة. ${errors.join('. ')}`
  };
  return new AppError(message, 400);
};

const handleJWTError = (language = 'en') => {
  const message = {
    en: 'Invalid token. Please log in again!',
    ar: 'رمز مميز غير صالح. يرجى تسجيل الدخول مرة أخرى!'
  };
  return new AppError(message, 401);
};

const handleJWTExpiredError = (language = 'en') => {
  const message = {
    en: 'Your token has expired! Please log in again.',
    ar: 'انتهت صلاحية الرمز المميز! يرجى تسجيل الدخول مرة أخرى.'
  };
  return new AppError(message, 401);
};

const sendErrorDev = (err, req, res) => {
  // API
  if (req.originalUrl.startsWith('/api')) {
    return res.status(err.statusCode).json({
      status: err.status,
      error: err,
      message: err.getMessage(req.language),
      messageAr: err.getMessage('ar'),
      stack: err.stack,
      validationErrors: err.validationErrors
    });
  }

  // Rendered website
  logger.error('ERROR 💥', err);
  return res.status(err.statusCode).render('error', {
    title: 'Something went wrong!',
    msg: err.getMessage(req.language)
  });
};

const sendErrorProd = (err, req, res) => {
  // API
  if (req.originalUrl.startsWith('/api')) {
    // Operational, trusted error: send message to client
    if (err.isOperational) {
      return res.status(err.statusCode).json({
        status: err.status,
        message: err.getMessage(req.language),
        messageAr: err.getMessage('ar'),
        validationErrors: err.validationErrors
      });
    }
    
    // Programming or other unknown error: don't leak error details
    logger.error('ERROR 💥', err);
    return res.status(500).json({
      status: 'error',
      message: req.language === 'ar' ? 'حدث خطأ ما!' : 'Something went wrong!',
      messageAr: 'حدث خطأ ما!'
    });
  }

  // Rendered website
  if (err.isOperational) {
    return res.status(err.statusCode).render('error', {
      title: 'Something went wrong!',
      msg: err.getMessage(req.language)
    });
  }
  
  logger.error('ERROR 💥', err);
  return res.status(err.statusCode).render('error', {
    title: 'Something went wrong!',
    msg: req.language === 'ar' ? 'يرجى المحاولة لاحقاً.' : 'Please try again later.'
  });
};

const globalErrorHandler = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  // Get user's preferred language
  const language = req.language || req.user?.language || 'en';

  if (process.env.NODE_ENV === 'development') {
    sendErrorDev(err, req, res);
  } else {
    let error = { ...err };
    error.message = err.message;
    error.messages = err.messages;

    // Handle specific error types
    if (error.name === 'CastError') error = handleCastErrorDB(error, language);
    if (error.code === 11000) error = handleDuplicateFieldsDB(error, language);
    if (error.name === 'ValidationError') error = handleValidationErrorDB(error, language);
    if (error.name === 'JsonWebTokenError') error = handleJWTError(language);
    if (error.name === 'TokenExpiredError') error = handleJWTExpiredError(language);

    sendErrorProd(error, req, res);
  }
};

module.exports = globalErrorHandler;