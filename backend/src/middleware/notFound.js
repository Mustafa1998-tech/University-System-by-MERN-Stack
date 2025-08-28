const AppError = require('../utils/appError');

const notFound = (req, res, next) => {
  const message = {
    en: `Can't find ${req.originalUrl} on this server!`,
    ar: `لا يمكن العثور على ${req.originalUrl} في هذا الخادم!`
  };
  
  next(new AppError(message, 404));
};

module.exports = notFound;