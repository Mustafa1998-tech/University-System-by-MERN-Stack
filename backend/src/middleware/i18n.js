const i18next = require('i18next');
const Backend = require('i18next-fs-backend');
const path = require('path');

// Initialize i18next
i18next
  .use(Backend)
  .init({
    lng: 'en', // default language
    fallbackLng: 'en',
    supportedLngs: ['en', 'ar'],
    
    backend: {
      loadPath: path.join(__dirname, '../locales/{{lng}}/{{ns}}.json')
    },
    
    interpolation: {
      escapeValue: false // React already escapes values
    },
    
    detection: {
      order: ['header', 'cookie', 'querystring'],
      caches: ['cookie']
    },
    
    resources: {
      en: {
        translation: {
          // Authentication messages
          auth: {
            loginSuccess: 'Logged in successfully',
            logoutSuccess: 'Logged out successfully',
            signupSuccess: 'User registered successfully. Please check your email for verification.',
            passwordResetSent: 'Password reset link sent to email',
            emailVerified: 'Email verified successfully',
            verificationResent: 'Verification email sent'
          },
          
          // Validation messages
          validation: {
            required: 'This field is required',
            email: 'Please provide a valid email address',
            password: 'Password must be at least 8 characters long',
            passwordMatch: 'Passwords do not match',
            phoneNumber: 'Please provide a valid phone number'
          },
          
          // Error messages
          errors: {
            notFound: 'Resource not found',
            unauthorized: 'You are not authorized to access this resource',
            forbidden: 'You do not have permission to perform this action',
            serverError: 'Internal server error',
            validationFailed: 'Validation failed'
          },
          
          // Success messages
          success: {
            created: 'Resource created successfully',
            updated: 'Resource updated successfully',
            deleted: 'Resource deleted successfully',
            retrieved: 'Resource retrieved successfully'
          },
          
          // Student-related messages
          student: {
            enrolled: 'Student enrolled successfully',
            dropped: 'Student dropped from course',
            graduated: 'Student graduated successfully',
            suspended: 'Student account suspended',
            profileUpdated: 'Student profile updated successfully'
          },
          
          // Course-related messages
          course: {
            created: 'Course created successfully',
            updated: 'Course updated successfully',
            deleted: 'Course deleted successfully',
            prerequisitesMet: 'All prerequisites met',
            prerequisitesNotMet: 'Prerequisites not met'
          },
          
          // Financial messages
          financial: {
            paymentReceived: 'Payment received successfully',
            invoiceGenerated: 'Invoice generated successfully',
            balancePaid: 'Balance paid in full',
            refundProcessed: 'Refund processed successfully'
          },
          
          // Academic messages
          academic: {
            gradeSubmitted: 'Grade submitted successfully',
            attendanceRecorded: 'Attendance recorded successfully',
            transcriptGenerated: 'Transcript generated successfully',
            certificateIssued: 'Certificate issued successfully'
          }
        }
      },
      
      ar: {
        translation: {
          // Authentication messages
          auth: {
            loginSuccess: 'تم تسجيل الدخول بنجاح',
            logoutSuccess: 'تم تسجيل الخروج بنجاح',
            signupSuccess: 'تم تسجيل المستخدم بنجاح. يرجى التحقق من بريدك الإلكتروني للتأكيد.',
            passwordResetSent: 'تم إرسال رابط إعادة تعيين كلمة المرور إلى البريد الإلكتروني',
            emailVerified: 'تم التحقق من البريد الإلكتروني بنجاح',
            verificationResent: 'تم إرسال بريد التحقق'
          },
          
          // Validation messages
          validation: {
            required: 'هذا الحقل مطلوب',
            email: 'يرجى إدخال عنوان بريد إلكتروني صالح',
            password: 'يجب أن تكون كلمة المرور 8 أحرف على الأقل',
            passwordMatch: 'كلمات المرور غير متطابقة',
            phoneNumber: 'يرجى إدخال رقم هاتف صالح'
          },
          
          // Error messages
          errors: {
            notFound: 'المورد غير موجود',
            unauthorized: 'غير مخول للوصول إلى هذا المورد',
            forbidden: 'ليس لديك صلاحية لتنفيذ هذا الإجراء',
            serverError: 'خطأ في الخادم الداخلي',
            validationFailed: 'فشل في التحقق من صحة البيانات'
          },
          
          // Success messages
          success: {
            created: 'تم إنشاء المورد بنجاح',
            updated: 'تم تحديث المورد بنجاح',
            deleted: 'تم حذف المورد بنجاح',
            retrieved: 'تم استرداد المورد بنجاح'
          },
          
          // Student-related messages
          student: {
            enrolled: 'تم تسجيل الطالب بنجاح',
            dropped: 'تم سحب الطالب من المقرر',
            graduated: 'تخرج الطالب بنجاح',
            suspended: 'تم تعليق حساب الطالب',
            profileUpdated: 'تم تحديث ملف الطالب بنجاح'
          },
          
          // Course-related messages
          course: {
            created: 'تم إنشاء المقرر بنجاح',
            updated: 'تم تحديث المقرر بنجاح',
            deleted: 'تم حذف المقرر بنجاح',
            prerequisitesMet: 'تم استيفاء جميع المتطلبات السابقة',
            prerequisitesNotMet: 'لم يتم استيفاء المتطلبات السابقة'
          },
          
          // Financial messages
          financial: {
            paymentReceived: 'تم استلام الدفعة بنجاح',
            invoiceGenerated: 'تم إنشاء الفاتورة بنجاح',
            balancePaid: 'تم دفع الرصيد بالكامل',
            refundProcessed: 'تم معالجة المبلغ المسترد بنجاح'
          },
          
          // Academic messages
          academic: {
            gradeSubmitted: 'تم تقديم الدرجة بنجاح',
            attendanceRecorded: 'تم تسجيل الحضور بنجاح',
            transcriptGenerated: 'تم إنشاء كشف الدرجات بنجاح',
            certificateIssued: 'تم إصدار الشهادة بنجاح'
          }
        }
      }
    }
  });

// Middleware to detect and set language
const i18nMiddleware = (req, res, next) => {
  // Detect language from various sources
  let language = 'en'; // default
  
  // 1. Check Accept-Language header
  const acceptLanguage = req.headers['accept-language'];
  if (acceptLanguage) {
    if (acceptLanguage.includes('ar')) {
      language = 'ar';
    } else if (acceptLanguage.includes('en')) {
      language = 'en';
    }
  }
  
  // 2. Check query parameter
  if (req.query.lang && ['en', 'ar'].includes(req.query.lang)) {
    language = req.query.lang;
  }
  
  // 3. Check user preference if authenticated
  if (req.user?.language && ['en', 'ar'].includes(req.user.language)) {
    language = req.user.language;
  }
  
  // 4. Check cookie
  if (req.cookies?.language && ['en', 'ar'].includes(req.cookies.language)) {
    language = req.cookies.language;
  }
  
  // Set language for this request
  req.language = language;
  i18next.changeLanguage(language);
  
  // Set translation function
  req.t = (key, options) => i18next.t(key, { ...options, lng: language });
  
  // Set cookie for future requests
  res.cookie('language', language, {
    maxAge: 365 * 24 * 60 * 60 * 1000, // 1 year
    httpOnly: false, // Allow frontend to read this cookie
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict'
  });
  
  // Set response header for client apps
  res.set('Content-Language', language);
  
  next();
};

// Helper function to get translated message
const getMessage = (messages, language = 'en') => {
  if (typeof messages === 'string') return messages;
  if (typeof messages === 'object' && messages[language]) {
    return messages[language];
  }
  return messages.en || messages;
};

// Helper function to format responses with i18n
const formatResponse = (req, status, messageKey, data = null, meta = null) => {
  const response = {
    status,
    message: req.t(messageKey),
    messageAr: req.t(messageKey, { lng: 'ar' }),
    timestamp: new Date().toISOString(),
    language: req.language
  };
  
  if (data !== null) {
    response.data = data;
  }
  
  if (meta !== null) {
    response.meta = meta;
  }
  
  return response;
};

// Helper function to create multilingual error messages
const createMultilingualError = (enMessage, arMessage, statusCode = 400) => {
  return new (require('../utils/appError'))({
    en: enMessage,
    ar: arMessage
  }, statusCode);
};

// Direction helper for RTL/LTR
const getTextDirection = (language) => {
  return language === 'ar' ? 'rtl' : 'ltr';
};

// Number and date formatting helpers
const formatNumber = (number, language = 'en') => {
  return new Intl.NumberFormat(language === 'ar' ? 'ar-SA' : 'en-US').format(number);
};

const formatDate = (date, language = 'en', options = {}) => {
  const defaultOptions = {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  };
  
  const formatOptions = { ...defaultOptions, ...options };
  
  return new Intl.DateTimeFormat(
    language === 'ar' ? 'ar-SA' : 'en-US',
    formatOptions
  ).format(new Date(date));
};

const formatCurrency = (amount, currency = 'USD', language = 'en') => {
  return new Intl.NumberFormat(
    language === 'ar' ? 'ar-SA' : 'en-US',
    {
      style: 'currency',
      currency: currency
    }
  ).format(amount);
};

module.exports = {
  i18nMiddleware,
  getMessage,
  formatResponse,
  createMultilingualError,
  getTextDirection,
  formatNumber,
  formatDate,
  formatCurrency,
  i18next
};