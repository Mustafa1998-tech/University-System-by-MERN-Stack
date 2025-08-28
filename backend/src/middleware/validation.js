const { body, param, query, validationResult } = require('express-validator');
const AppError = require('../utils/appError');

// Helper function to handle validation errors
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const errorMessages = errors.array().map(error => ({
      field: error.path,
      message: error.msg,
      value: error.value
    }));
    
    return next(new AppError({
      en: 'Validation failed',
      ar: 'فشل في التحقق من صحة البيانات'
    }, 400, errorMessages));
  }
  next();
};

// Authentication validations
const validateSignup = [
  body('firstName')
    .notEmpty()
    .withMessage('First name is required')
    .isLength({ min: 2, max: 50 })
    .withMessage('First name must be between 2 and 50 characters')
    .matches(/^[a-zA-Z\s]+$/)
    .withMessage('First name can only contain letters and spaces'),
    
  body('lastName')
    .notEmpty()
    .withMessage('Last name is required')
    .isLength({ min: 2, max: 50 })
    .withMessage('Last name must be between 2 and 50 characters')
    .matches(/^[a-zA-Z\s]+$/)
    .withMessage('Last name can only contain letters and spaces'),
    
  body('firstNameAr')
    .optional()
    .isLength({ max: 50 })
    .withMessage('Arabic first name cannot exceed 50 characters'),
    
  body('lastNameAr')
    .optional()
    .isLength({ max: 50 })
    .withMessage('Arabic last name cannot exceed 50 characters'),
    
  body('email')
    .isEmail()
    .withMessage('Please provide a valid email address')
    .normalizeEmail(),
    
  body('password')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
    .withMessage('Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'),
    
  body('passwordConfirm')
    .custom((value, { req }) => {
      if (value !== req.body.password) {
        throw new Error('Passwords do not match');
      }
      return true;
    }),
    
  body('phone')
    .optional()
    .isMobilePhone()
    .withMessage('Please provide a valid phone number'),
    
  body('role')
    .isIn(['student', 'instructor', 'staff', 'admin', 'librarian', 'alumni'])
    .withMessage('Role must be one of: student, instructor, staff, admin, librarian, alumni'),
    
  body('dateOfBirth')
    .optional()
    .isISO8601()
    .withMessage('Please provide a valid date of birth'),
    
  body('gender')
    .optional()
    .isIn(['male', 'female', 'other'])
    .withMessage('Gender must be one of: male, female, other'),
    
  body('language')
    .optional()
    .isIn(['en', 'ar'])
    .withMessage('Language must be either en or ar'),
    
  handleValidationErrors
];

const validateLogin = [
  body('email')
    .isEmail()
    .withMessage('Please provide a valid email address')
    .normalizeEmail(),
    
  body('password')
    .notEmpty()
    .withMessage('Password is required'),
    
  handleValidationErrors
];

const validatePasswordReset = [
  body('password')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
    .withMessage('Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'),
    
  body('passwordConfirm')
    .custom((value, { req }) => {
      if (value !== req.body.password) {
        throw new Error('Passwords do not match');
      }
      return true;
    }),
    
  handleValidationErrors
];

// Student validations
const validateStudent = [
  body('studentId')
    .matches(/^STU\d{6}$/)
    .withMessage('Student ID must be in format STU123456'),
    
  body('department')
    .isMongoId()
    .withMessage('Please provide a valid department ID'),
    
  body('faculty')
    .isMongoId()
    .withMessage('Please provide a valid faculty ID'),
    
  body('program')
    .isMongoId()
    .withMessage('Please provide a valid program ID'),
    
  body('admissionDate')
    .optional()
    .isISO8601()
    .withMessage('Please provide a valid admission date'),
    
  body('academicYear')
    .matches(/^\d{4}-\d{4}$/)
    .withMessage('Academic year must be in format YYYY-YYYY'),
    
  body('status')
    .optional()
    .isIn(['active', 'inactive', 'suspended', 'graduated', 'transferred', 'withdrawn'])
    .withMessage('Status must be one of: active, inactive, suspended, graduated, transferred, withdrawn'),
    
  handleValidationErrors
];

// Course validations
const validateCourse = [
  body('courseCode')
    .matches(/^[A-Z]{2,4}\d{3,4}$/)
    .withMessage('Course code must be in format like CS101 or MATH1001'),
    
  body('title')
    .notEmpty()
    .withMessage('Course title is required')
    .isLength({ max: 200 })
    .withMessage('Course title cannot exceed 200 characters'),
    
  body('description')
    .notEmpty()
    .withMessage('Course description is required')
    .isLength({ max: 2000 })
    .withMessage('Course description cannot exceed 2000 characters'),
    
  body('department')
    .isMongoId()
    .withMessage('Please provide a valid department ID'),
    
  body('creditHours')
    .isInt({ min: 1, max: 6 })
    .withMessage('Credit hours must be between 1 and 6'),
    
  body('level')
    .optional()
    .isIn(['undergraduate', 'graduate', 'doctoral'])
    .withMessage('Level must be one of: undergraduate, graduate, doctoral'),
    
  body('courseType')
    .optional()
    .isIn(['core', 'elective', 'major', 'minor', 'general'])
    .withMessage('Course type must be one of: core, elective, major, minor, general'),
    
  handleValidationErrors
];

// Enrollment validations
const validateEnrollment = [
  body('student')
    .isMongoId()
    .withMessage('Please provide a valid student ID'),
    
  body('course')
    .isMongoId()
    .withMessage('Please provide a valid course ID'),
    
  body('instructor')
    .isMongoId()
    .withMessage('Please provide a valid instructor ID'),
    
  body('semester')
    .isMongoId()
    .withMessage('Please provide a valid semester ID'),
    
  body('section')
    .notEmpty()
    .withMessage('Section is required'),
    
  body('enrollmentType')
    .optional()
    .isIn(['regular', 'audit', 'credit', 'non_credit', 'retake'])
    .withMessage('Enrollment type must be one of: regular, audit, credit, non_credit, retake'),
    
  handleValidationErrors
];

// Tuition validations
const validateTuition = [
  body('student')
    .isMongoId()
    .withMessage('Please provide a valid student ID'),
    
  body('academicYear')
    .matches(/^\d{4}-\d{4}$/)
    .withMessage('Academic year must be in format YYYY-YYYY'),
    
  body('semester')
    .isMongoId()
    .withMessage('Please provide a valid semester ID'),
    
  body('tuitionType')
    .isIn(['undergraduate', 'graduate', 'doctoral', 'continuing_education', 'summer', 'international'])
    .withMessage('Tuition type must be one of: undergraduate, graduate, doctoral, continuing_education, summer, international'),
    
  body('fees.tuitionFee')
    .isFloat({ min: 0 })
    .withMessage('Tuition fee must be a positive number'),
    
  body('dueDate')
    .isISO8601()
    .withMessage('Please provide a valid due date'),
    
  handleValidationErrors
];

// Payroll validations
const validatePayroll = [
  body('employee')
    .isMongoId()
    .withMessage('Please provide a valid employee ID'),
    
  body('employeeType')
    .isIn(['Staff', 'Instructor'])
    .withMessage('Employee type must be either Staff or Instructor'),
    
  body('payPeriod.startDate')
    .isISO8601()
    .withMessage('Please provide a valid pay period start date'),
    
  body('payPeriod.endDate')
    .isISO8601()
    .withMessage('Please provide a valid pay period end date'),
    
  body('payPeriod.payFrequency')
    .isIn(['weekly', 'bi_weekly', 'monthly', 'quarterly', 'annual'])
    .withMessage('Pay frequency must be one of: weekly, bi_weekly, monthly, quarterly, annual'),
    
  body('baseSalary.amount')
    .isFloat({ min: 0 })
    .withMessage('Base salary must be a positive number'),
    
  handleValidationErrors
];

// Query parameter validations
const validatePagination = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
    
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),
    
  query('sort')
    .optional()
    .isLength({ max: 100 })
    .withMessage('Sort parameter is too long'),
    
  handleValidationErrors
];

const validateObjectId = (paramName) => [
  param(paramName)
    .isMongoId()
    .withMessage(`${paramName} must be a valid MongoDB ObjectId`),
    
  handleValidationErrors
];

// File upload validations
const validateFileUpload = [
  body('fileType')
    .optional()
    .isIn(['image', 'document', 'certificate', 'transcript', 'other'])
    .withMessage('File type must be one of: image, document, certificate, transcript, other'),
    
  handleValidationErrors
];

// Search validations
const validateSearch = [
  query('q')
    .optional()
    .isLength({ min: 1, max: 100 })
    .withMessage('Search query must be between 1 and 100 characters')
    .escape(),
    
  query('fields')
    .optional()
    .isLength({ max: 200 })
    .withMessage('Fields parameter is too long'),
    
  handleValidationErrors
];

// Date range validations
const validateDateRange = [
  query('startDate')
    .optional()
    .isISO8601()
    .withMessage('Start date must be a valid ISO date'),
    
  query('endDate')
    .optional()
    .isISO8601()
    .withMessage('End date must be a valid ISO date')
    .custom((value, { req }) => {
      if (req.query.startDate && value && new Date(value) <= new Date(req.query.startDate)) {
        throw new Error('End date must be after start date');
      }
      return true;
    }),
    
  handleValidationErrors
];

module.exports = {
  validateSignup,
  validateLogin,
  validatePasswordReset,
  validateStudent,
  validateCourse,
  validateEnrollment,
  validateTuition,
  validatePayroll,
  validatePagination,
  validateObjectId,
  validateFileUpload,
  validateSearch,
  validateDateRange,
  handleValidationErrors
};