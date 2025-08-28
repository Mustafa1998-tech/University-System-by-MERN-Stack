const jwt = require('jsonwebtoken');
const User = require('../models/User');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

// Protect routes - verify JWT token
const protect = catchAsync(async (req, res, next) => {
  // 1) Getting token and check if it's there
  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  } else if (req.cookies?.jwt) {
    token = req.cookies.jwt;
  }

  if (!token) {
    return next(new AppError({
      en: 'You are not logged in! Please log in to get access.',
      ar: 'لم تقم بتسجيل الدخول! يرجى تسجيل الدخول للحصول على الوصول.'
    }, 401));
  }

  // 2) Verification token
  let decoded;
  try {
    decoded = jwt.verify(token, process.env.JWT_SECRET);
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return next(new AppError({
        en: 'Your token has expired! Please log in again.',
        ar: 'انتهت صلاحية الرمز المميز! يرجى تسجيل الدخول مرة أخرى.'
      }, 401));
    } else if (error.name === 'JsonWebTokenError') {
      return next(new AppError({
        en: 'Invalid token! Please log in again.',
        ar: 'رمز مميز غير صالح! يرجى تسجيل الدخول مرة أخرى.'
      }, 401));
    }
    return next(new AppError({
      en: 'Authentication failed! Please log in again.',
      ar: 'فشل التحقق من الهوية! يرجى تسجيل الدخول مرة أخرى.'
    }, 401));
  }

  // 3) Check if user still exists
  const currentUser = await User.findById(decoded.id).select('+isActive');
  if (!currentUser) {
    return next(new AppError({
      en: 'The user belonging to this token does no longer exist.',
      ar: 'المستخدم الذي ينتمي إليه هذا الرمز المميز لم يعد موجوداً.'
    }, 401));
  }

  // 4) Check if user is active
  if (!currentUser.isActive) {
    return next(new AppError({
      en: 'Your account has been deactivated! Please contact administrator.',
      ar: 'تم إلغاء تفعيل حسابك! يرجى الاتصال بالإدارة.'
    }, 401));
  }

  // 5) Check if user changed password after the token was issued
  if (currentUser.changedPasswordAfter(decoded.iat)) {
    return next(new AppError({
      en: 'User recently changed password! Please log in again.',
      ar: 'قام المستخدم بتغيير كلمة المرور مؤخراً! يرجى تسجيل الدخول مرة أخرى.'
    }, 401));
  }

  // Grant access to protected route
  req.user = currentUser;
  next();
});

// Authorization - restrict to certain roles
const restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(new AppError({
        en: 'You do not have permission to perform this action.',
        ar: 'ليس لديك صلاحية لتنفيذ هذا الإجراء.'
      }, 403));
    }
    next();
  };
};

// Optional authentication - don't throw error if no token
const optionalAuth = catchAsync(async (req, res, next) => {
  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  } else if (req.cookies?.jwt) {
    token = req.cookies.jwt;
  }

  if (token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const currentUser = await User.findById(decoded.id).select('+isActive');
      
      if (currentUser && currentUser.isActive && !currentUser.changedPasswordAfter(decoded.iat)) {
        req.user = currentUser;
      }
    } catch (error) {
      // Silently fail for optional auth
    }
  }
  
  next();
});

// Check if user owns resource or has admin privileges
const restrictToOwnerOrAdmin = (resourceUserField = 'user') => {
  return (req, res, next) => {
    const isAdmin = ['admin', 'staff'].includes(req.user.role);
    const isOwner = req.resource && req.resource[resourceUserField] && 
                   req.resource[resourceUserField].toString() === req.user.id;
    
    if (!isAdmin && !isOwner) {
      return next(new AppError({
        en: 'You can only access your own resources.',
        ar: 'يمكنك الوصول إلى مواردك الخاصة فقط.'
      }, 403));
    }
    
    next();
  };
};

// Role-based middleware for different user types
const requireRole = (role) => {
  return (req, res, next) => {
    if (req.user.role !== role) {
      return next(new AppError({
        en: `Access restricted to ${role}s only.`,
        ar: `الوصول مقصور على ${role === 'student' ? 'الطلاب' : role === 'instructor' ? 'المدرسين' : role === 'staff' ? 'الموظفين' : 'المسؤولين'} فقط.`
      }, 403));
    }
    next();
  };
};

// Check if user has specific permissions
const hasPermission = (permission) => {
  return (req, res, next) => {
    // Define role-based permissions
    const rolePermissions = {
      admin: ['*'], // Admin has all permissions
      staff: [
        'read:students', 'write:students', 'read:courses', 'write:courses',
        'read:enrollments', 'write:enrollments', 'read:grades', 'write:grades',
        'read:tuition', 'write:tuition', 'read:reports'
      ],
      instructor: [
        'read:courses', 'write:own_courses', 'read:enrollments', 'write:own_enrollments',
        'read:grades', 'write:own_grades', 'read:students', 'read:attendance', 'write:attendance'
      ],
      student: [
        'read:own_profile', 'write:own_profile', 'read:own_courses', 'read:own_grades',
        'read:own_tuition', 'read:own_attendance'
      ],
      librarian: [
        'read:library', 'write:library', 'read:students'
      ],
      alumni: [
        'read:own_profile', 'write:own_profile', 'read:events', 'read:alumni'
      ]
    };

    const userPermissions = rolePermissions[req.user.role] || [];
    const hasWildcard = userPermissions.includes('*');
    const hasSpecificPermission = userPermissions.includes(permission);

    if (!hasWildcard && !hasSpecificPermission) {
      return next(new AppError({
        en: 'You do not have the required permission for this action.',
        ar: 'ليس لديك الصلاحية المطلوبة لهذا الإجراء.'
      }, 403));
    }

    next();
  };
};

// Check if user can access specific department/faculty resources
const departmentAccess = catchAsync(async (req, res, next) => {
  if (req.user.role === 'admin') {
    return next(); // Admin can access all departments
  }

  let userDepartment, userFaculty;

  // Get user's department and faculty based on role
  if (req.user.role === 'student') {
    const Student = require('../models/Student');
    const student = await Student.findOne({ userId: req.user.id });
    if (student) {
      userDepartment = student.department;
      userFaculty = student.faculty;
    }
  } else if (req.user.role === 'instructor') {
    const Instructor = require('../models/Instructor');
    const instructor = await Instructor.findOne({ userId: req.user.id });
    if (instructor) {
      userDepartment = instructor.department;
      userFaculty = instructor.faculty;
    }
  } else if (req.user.role === 'staff') {
    const Staff = require('../models/Staff');
    const staff = await Staff.findOne({ userId: req.user.id });
    if (staff) {
      userDepartment = staff.department;
      userFaculty = staff.faculty;
    }
  }

  // Store user's department and faculty in request for use in routes
  req.userDepartment = userDepartment;
  req.userFaculty = userFaculty;

  next();
});

// Rate limiting for sensitive operations
const sensitiveOpRateLimit = (maxAttempts = 5, windowMs = 15 * 60 * 1000) => {
  const attempts = new Map();

  return (req, res, next) => {
    const key = `${req.user.id}-${req.route.path}`;
    const now = Date.now();
    const userAttempts = attempts.get(key) || { count: 0, resetTime: now + windowMs };

    // Reset if time window has passed
    if (now > userAttempts.resetTime) {
      userAttempts.count = 0;
      userAttempts.resetTime = now + windowMs;
    }

    userAttempts.count++;
    attempts.set(key, userAttempts);

    if (userAttempts.count > maxAttempts) {
      return next(new AppError({
        en: 'Too many attempts. Please try again later.',
        ar: 'محاولات كثيرة جداً. يرجى المحاولة لاحقاً.'
      }, 429));
    }

    next();
  };
};

module.exports = {
  protect,
  restrictTo,
  optionalAuth,
  restrictToOwnerOrAdmin,
  requireRole,
  hasPermission,
  departmentAccess,
  sensitiveOpRateLimit
};