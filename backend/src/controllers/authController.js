const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Student = require('../models/Student');
const Instructor = require('../models/Instructor');
const Staff = require('../models/Staff');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const sendEmail = require('../utils/email');
const sendSMS = require('../utils/sms');

// Generate JWT token
const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE,
  });
};

// Create and send JWT token
const createSendToken = (user, statusCode, req, res) => {
  const token = signToken(user._id);
  const refreshToken = user.generateRefreshToken();

  const cookieOptions = {
    expires: new Date(
      Date.now() + (process.env.JWT_COOKIE_EXPIRES_IN || 7) * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
    secure: req.secure || req.headers['x-forwarded-proto'] === 'https',
    sameSite: 'strict'
  };

  res.cookie('jwt', token, cookieOptions);
  res.cookie('refreshToken', refreshToken, {
    ...cookieOptions,
    expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days
  });

  // Remove password from output
  user.password = undefined;

  // Update last login
  user.lastLogin = new Date();
  user.loginAttempts = 0;
  user.save({ validateBeforeSave: false });

  res.status(statusCode).json({
    status: 'success',
    message: req.t ? req.t('auth.loginSuccess') : 'Logged in successfully',
    messageAr: 'تم تسجيل الدخول بنجاح',
    token,
    refreshToken,
    data: {
      user
    }
  });
};

// User registration
const signup = catchAsync(async (req, res, next) => {
  const {
    firstName,
    lastName,
    firstNameAr,
    lastNameAr,
    email,
    password,
    passwordConfirm,
    phone,
    role,
    dateOfBirth,
    gender,
    nationality,
    address,
    emergencyContact,
    language
  } = req.body;

  // Check if passwords match
  if (password !== passwordConfirm) {
    return next(new AppError({
      en: 'Passwords do not match',
      ar: 'كلمات المرور غير متطابقة'
    }, 400));
  }

  // Check if user already exists
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return next(new AppError({
      en: 'User with this email already exists',
      ar: 'يوجد مستخدم بهذا البريد الإلكتروني مسبقاً'
    }, 400));
  }

  // Create new user
  const newUser = await User.create({
    firstName,
    lastName,
    firstNameAr,
    lastNameAr,
    email,
    password,
    phone,
    role,
    dateOfBirth,
    gender,
    nationality,
    address,
    emergencyContact,
    language: language || 'en',
    isEmailVerified: false,
    createdBy: req.user?.id
  });

  // Generate email verification token
  const verifyToken = newUser.createEmailVerificationToken();
  await newUser.save({ validateBeforeSave: false });

  // Send verification email
  try {
    const verifyURL = `${req.protocol}://${req.get('host')}/api/v1/auth/verify-email/${verifyToken}`;
    
    await sendEmail({
      email: newUser.email,
      subject: 'Email Verification - University SIS',
      message: `Please click on the following link to verify your email: ${verifyURL}`,
      language: newUser.language
    });

    res.status(201).json({
      status: 'success',
      message: req.t ? req.t('auth.signupSuccess') : 'User registered successfully. Please check your email for verification.',
      messageAr: 'تم تسجيل المستخدم بنجاح. يرجى التحقق من بريدك الإلكتروني للتأكيد.',
      data: {
        user: {
          id: newUser._id,
          firstName: newUser.firstName,
          lastName: newUser.lastName,
          email: newUser.email,
          role: newUser.role
        }
      }
    });
  } catch (err) {
    newUser.emailVerificationToken = undefined;
    newUser.emailVerificationExpires = undefined;
    await newUser.save({ validateBeforeSave: false });

    return next(new AppError({
      en: 'There was an error sending the email. Please try again later.',
      ar: 'حدث خطأ في إرسال البريد الإلكتروني. يرجى المحاولة لاحقاً.'
    }, 500));
  }
});

// User login
const login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  // Check if email and password exist
  if (!email || !password) {
    return next(new AppError({
      en: 'Please provide email and password',
      ar: 'يرجى إدخال البريد الإلكتروني وكلمة المرور'
    }, 400));
  }

  // Check if user exists and password is correct
  const user = await User.findOne({ email }).select('+password +loginAttempts +lockUntil');

  if (!user) {
    return next(new AppError({
      en: 'Incorrect email or password',
      ar: 'البريد الإلكتروني أو كلمة المرور غير صحيحة'
    }, 401));
  }

  // Check if account is locked
  if (user.isLocked) {
    return next(new AppError({
      en: 'Account is temporarily locked due to multiple failed login attempts. Please try again later.',
      ar: 'الحساب مؤقتاً مقفل بسبب محاولات تسجيل دخول فاشلة متعددة. يرجى المحاولة لاحقاً.'
    }, 423));
  }

  // Check if user is active
  if (!user.isActive) {
    return next(new AppError({
      en: 'Your account has been deactivated. Please contact administrator.',
      ar: 'تم إلغاء تفعيل حسابك. يرجى الاتصال بالإدارة.'
    }, 401));
  }

  // Verify password
  const isPasswordCorrect = await user.correctPassword(password);

  if (!isPasswordCorrect) {
    // Increment login attempts
    user.loginAttempts = (user.loginAttempts || 0) + 1;
    
    // Lock account after 5 failed attempts
    if (user.loginAttempts >= 5) {
      user.lockUntil = Date.now() + 30 * 60 * 1000; // 30 minutes
    }
    
    await user.save({ validateBeforeSave: false });

    return next(new AppError({
      en: 'Incorrect email or password',
      ar: 'البريد الإلكتروني أو كلمة المرور غير صحيحة'
    }, 401));
  }

  // If we got here, the login was successful
  createSendToken(user, 200, req, res);
});

// Logout
const logout = (req, res) => {
  res.cookie('jwt', 'loggedout', {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true
  });
  res.cookie('refreshToken', 'loggedout', {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true
  });

  res.status(200).json({
    status: 'success',
    message: req.t ? req.t('auth.logoutSuccess') : 'Logged out successfully',
    messageAr: 'تم تسجيل الخروج بنجاح'
  });
};

// Refresh token
const refreshToken = catchAsync(async (req, res, next) => {
  let token = req.cookies.refreshToken || req.body.refreshToken;

  if (!token) {
    return next(new AppError({
      en: 'No refresh token provided',
      ar: 'لم يتم توفير رمز التحديث'
    }, 401));
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET);
    
    if (decoded.type !== 'refresh') {
      return next(new AppError({
        en: 'Invalid refresh token',
        ar: 'رمز التحديث غير صالح'
      }, 401));
    }

    const user = await User.findById(decoded.id);
    if (!user || !user.isActive) {
      return next(new AppError({
        en: 'User no longer exists or is inactive',
        ar: 'المستخدم غير موجود أو غير نشط'
      }, 401));
    }

    createSendToken(user, 200, req, res);
  } catch (error) {
    return next(new AppError({
      en: 'Invalid refresh token',
      ar: 'رمز التحديث غير صالح'
    }, 401));
  }
});

// Forgot password
const forgotPassword = catchAsync(async (req, res, next) => {
  // Get user based on POSTed email
  const user = await User.findOne({ email: req.body.email });
  if (!user) {
    return next(new AppError({
      en: 'There is no user with that email address.',
      ar: 'لا يوجد مستخدم بهذا البريد الإلكتروني.'
    }, 404));
  }

  // Generate the random reset token
  const resetToken = user.createPasswordResetToken();
  await user.save({ validateBeforeSave: false });

  // Send it to user's email
  try {
    const resetURL = `${req.protocol}://${req.get('host')}/api/v1/auth/reset-password/${resetToken}`;

    await sendEmail({
      email: user.email,
      subject: 'Password Reset Request - University SIS',
      message: `You have requested a password reset. Please click on the following link to reset your password: ${resetURL}\n\nIf you didn't request this, please ignore this email.`,
      language: user.language
    });

    res.status(200).json({
      status: 'success',
      message: req.t ? req.t('auth.passwordResetSent') : 'Password reset link sent to email',
      messageAr: 'تم إرسال رابط إعادة تعيين كلمة المرور إلى البريد الإلكتروني'
    });
  } catch (err) {
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save({ validateBeforeSave: false });

    return next(new AppError({
      en: 'There was an error sending the email. Try again later.',
      ar: 'حدث خطأ في إرسال البريد الإلكتروني. حاول مرة أخرى لاحقاً.'
    }, 500));
  }
});

// Reset password
const resetPassword = catchAsync(async (req, res, next) => {
  // Get user based on the token
  const hashedToken = crypto
    .createHash('sha256')
    .update(req.params.token)
    .digest('hex');

  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() }
  });

  // If token has not expired, and there is user, set the new password
  if (!user) {
    return next(new AppError({
      en: 'Token is invalid or has expired',
      ar: 'الرمز المميز غير صالح أو انتهت صلاحيته'
    }, 400));
  }

  const { password, passwordConfirm } = req.body;

  if (password !== passwordConfirm) {
    return next(new AppError({
      en: 'Passwords do not match',
      ar: 'كلمات المرور غير متطابقة'
    }, 400));
  }

  user.password = password;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  user.loginAttempts = 0;
  user.lockUntil = undefined;
  await user.save();

  // Log the user in, send JWT
  createSendToken(user, 200, req, res);
});

// Update password (for logged in users)
const updatePassword = catchAsync(async (req, res, next) => {
  // Get user from collection
  const user = await User.findById(req.user.id).select('+password');

  // Check if POSTed current password is correct
  if (!(await user.correctPassword(req.body.passwordCurrent))) {
    return next(new AppError({
      en: 'Your current password is incorrect.',
      ar: 'كلمة المرور الحالية غير صحيحة.'
    }, 401));
  }

  const { password, passwordConfirm } = req.body;

  if (password !== passwordConfirm) {
    return next(new AppError({
      en: 'Passwords do not match',
      ar: 'كلمات المرور غير متطابقة'
    }, 400));
  }

  // Update password
  user.password = password;
  await user.save();

  // Log user in, send JWT
  createSendToken(user, 200, req, res);
});

// Verify email
const verifyEmail = catchAsync(async (req, res, next) => {
  const hashedToken = crypto
    .createHash('sha256')
    .update(req.params.token)
    .digest('hex');

  const user = await User.findOne({
    emailVerificationToken: hashedToken,
    emailVerificationExpires: { $gt: Date.now() }
  });

  if (!user) {
    return next(new AppError({
      en: 'Token is invalid or has expired',
      ar: 'الرمز المميز غير صالح أو انتهت صلاحيته'
    }, 400));
  }

  user.isEmailVerified = true;
  user.emailVerificationToken = undefined;
  user.emailVerificationExpires = undefined;
  await user.save({ validateBeforeSave: false });

  res.status(200).json({
    status: 'success',
    message: req.t ? req.t('auth.emailVerified') : 'Email verified successfully',
    messageAr: 'تم التحقق من البريد الإلكتروني بنجاح'
  });
});

// Resend verification email
const resendVerification = catchAsync(async (req, res, next) => {
  const user = await User.findOne({ email: req.body.email });
  
  if (!user) {
    return next(new AppError({
      en: 'No user found with that email address',
      ar: 'لم يتم العثور على مستخدم بهذا البريد الإلكتروني'
    }, 404));
  }

  if (user.isEmailVerified) {
    return next(new AppError({
      en: 'Email is already verified',
      ar: 'البريد الإلكتروني محقق بالفعل'
    }, 400));
  }

  const verifyToken = user.createEmailVerificationToken();
  await user.save({ validateBeforeSave: false });

  try {
    const verifyURL = `${req.protocol}://${req.get('host')}/api/v1/auth/verify-email/${verifyToken}`;
    
    await sendEmail({
      email: user.email,
      subject: 'Email Verification - University SIS',
      message: `Please click on the following link to verify your email: ${verifyURL}`,
      language: user.language
    });

    res.status(200).json({
      status: 'success',
      message: req.t ? req.t('auth.verificationResent') : 'Verification email sent',
      messageAr: 'تم إرسال بريد التحقق'
    });
  } catch (err) {
    user.emailVerificationToken = undefined;
    user.emailVerificationExpires = undefined;
    await user.save({ validateBeforeSave: false });

    return next(new AppError({
      en: 'There was an error sending the email. Try again later.',
      ar: 'حدث خطأ في إرسال البريد الإلكتروني. حاول مرة أخرى لاحقاً.'
    }, 500));
  }
});

// Get current user profile
const getMe = catchAsync(async (req, res, next) => {
  let userProfile = null;

  // Get additional profile data based on role
  if (req.user.role === 'student') {
    userProfile = await Student.findOne({ userId: req.user.id })
      .populate('department', 'name nameAr')
      .populate('faculty', 'name nameAr')
      .populate('advisor', 'firstName lastName firstNameAr lastNameAr');
  } else if (req.user.role === 'instructor') {
    userProfile = await Instructor.findOne({ userId: req.user.id })
      .populate('department', 'name nameAr')
      .populate('faculty', 'name nameAr');
  } else if (req.user.role === 'staff') {
    userProfile = await Staff.findOne({ userId: req.user.id })
      .populate('department', 'name nameAr')
      .populate('supervisor', 'firstName lastName firstNameAr lastNameAr');
  }

  res.status(200).json({
    status: 'success',
    data: {
      user: req.user,
      profile: userProfile
    }
  });
});

module.exports = {
  signup,
  login,
  logout,
  refreshToken,
  forgotPassword,
  resetPassword,
  updatePassword,
  verifyEmail,
  resendVerification,
  getMe
};