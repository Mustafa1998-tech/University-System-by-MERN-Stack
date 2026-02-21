const { validationResult } = require('express-validator');
const AppError = require('../utils/appError');

const validate = (req, res, next) => {
  const errors = validationResult(req);

  if (errors.isEmpty()) {
    return next();
  }

  const error = new AppError(
    {
      en: 'Validation failed. Please check your input.',
      ar: 'فشل التحقق من صحة البيانات. يرجى مراجعة الإدخال.'
    },
    400
  );

  error.validationErrors = errors.array();
  return next(error);
};

module.exports = validate;
