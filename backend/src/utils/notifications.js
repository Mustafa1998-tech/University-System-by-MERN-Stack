const nodemailer = require('nodemailer');
const twilio = require('twilio');
const logger = require('./logger');

// Email configuration
const createEmailTransporter = () => {
  const emailEnabled = process.env.ENABLE_EMAIL_NOTIFICATIONS !== 'false';
  const hasCredentials = Boolean(process.env.EMAIL_USERNAME && process.env.EMAIL_PASSWORD);

  if (!emailEnabled) {
    logger.info('Email notifications are disabled by configuration.');
    return null;
  }

  if (!hasCredentials) {
    logger.warn('Email credentials are missing. Email notifications disabled.');
    return null;
  }

  const config = {
    host: process.env.EMAIL_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.EMAIL_PORT, 10) || 587,
    secure: false, // true for 465, false for other ports
    auth: {
      user: process.env.EMAIL_USERNAME,
      pass: process.env.EMAIL_PASSWORD
    }
  };

  return nodemailer.createTransport(config);
};

// SMS configuration (Twilio)
const createSMSClient = () => {
  const sid = process.env.TWILIO_ACCOUNT_SID;
  const token = process.env.TWILIO_AUTH_TOKEN;

  if (
    !sid ||
    !token ||
    sid.startsWith('your-') ||
    token.startsWith('your-')
  ) {
    logger.warn('Twilio credentials not configured. SMS notifications disabled.');
    return null;
  }

  try {
    return twilio(sid, token);
  } catch (error) {
    logger.warn(`Invalid Twilio configuration. SMS notifications disabled: ${error.message}`);
    return null;
  }
};

const emailTransporter = createEmailTransporter();
const smsClient = createSMSClient();

// Notification templates
const templates = {
  // Authentication templates
  welcome: {
    subject: {
      en: 'Welcome to University SIS',
      ar: 'مرحباً بك في نظام معلومات الطلاب الجامعي'
    },
    body: {
      en: `Dear {{name}},\n\nWelcome to the University Student Information System! Your account has been created successfully.\n\nLogin Details:\nEmail: {{email}}\nRole: {{role}}\n\nPlease change your password after first login.\n\nBest regards,\nUniversity Administration`,
      ar: `عزيزي {{name}}،\n\nمرحباً بك في نظام معلومات الطلاب الجامعي! تم إنشاء حسابك بنجاح.\n\nتفاصيل تسجيل الدخول:\nالبريد الإلكتروني: {{email}}\nالدور: {{role}}\n\nيرجى تغيير كلمة المرور بعد أول تسجيل دخول.\n\nمع أطيب التحيات،\nإدارة الجامعة`
    }
  },

  passwordReset: {
    subject: {
      en: 'Password Reset Request',
      ar: 'طلب إعادة تعيين كلمة المرور'
    },
    body: {
      en: `Dear {{name}},\n\nYou have requested to reset your password. Click the link below to reset it:\n\n{{resetLink}}\n\nThis link will expire in 10 minutes.\n\nIf you didn't request this, please ignore this email.\n\nBest regards,\nUniversity Administration`,
      ar: `عزيزي {{name}}،\n\nلقد طلبت إعادة تعيين كلمة المرور. انقر على الرابط أدناه لإعادة تعيينها:\n\n{{resetLink}}\n\nستنتهي صلاحية هذا الرابط خلال 10 دقائق.\n\nإذا لم تطلب هذا، يرجى تجاهل هذا البريد الإلكتروني.\n\nمع أطيب التحيات،\nإدارة الجامعة`
    }
  },

  // Academic notifications
  enrollmentConfirmation: {
    subject: {
      en: 'Course Enrollment Confirmation',
      ar: 'تأكيد التسجيل في المقرر'
    },
    body: {
      en: `Dear {{studentName}},\n\nYou have been successfully enrolled in:\n\nCourse: {{courseName}} ({{courseCode}})\nInstructor: {{instructorName}}\nSection: {{section}}\nSchedule: {{schedule}}\n\nPlease check your academic portal for more details.\n\nBest regards,\nAcademic Affairs`,
      ar: `عزيزي {{studentName}}،\n\nتم تسجيلك بنجاح في:\n\nالمقرر: {{courseName}} ({{courseCode}})\nالمدرس: {{instructorName}}\nالشعبة: {{section}}\nالجدول: {{schedule}}\n\nيرجى مراجعة البوابة الأكاديمية لمزيد من التفاصيل.\n\nمع أطيب التحيات،\nالشؤون الأكاديمية`
    }
  },

  gradeNotification: {
    subject: {
      en: 'Grade Posted',
      ar: 'تم نشر الدرجة'
    },
    body: {
      en: `Dear {{studentName}},\n\nYour grade for {{courseName}} ({{courseCode}}) has been posted:\n\nGrade: {{grade}}\nGPA Impact: {{gpaImpact}}\n\nYou can view detailed breakdown in your academic portal.\n\nBest regards,\nAcademic Affairs`,
      ar: `عزيزي {{studentName}}،\n\nتم نشر درجتك لمقرر {{courseName}} ({{courseCode}}):\n\nالدرجة: {{grade}}\nتأثير على المعدل: {{gpaImpact}}\n\nيمكنك عرض التفاصيل في البوابة الأكاديمية.\n\nمع أطيب التحيات،\nالشؤون الأكاديمية`
    }
  },

  // Financial notifications
  tuitionDue: {
    subject: {
      en: 'Tuition Payment Due',
      ar: 'استحقاق دفع الرسوم الدراسية'
    },
    body: {
      en: `Dear {{studentName}},\n\nThis is a reminder that your tuition payment is due:\n\nAmount Due: {{amount}} {{currency}}\nDue Date: {{dueDate}}\nPayment Reference: {{reference}}\n\nPlease make your payment to avoid any late fees.\n\nBest regards,\nFinancial Affairs`,
      ar: `عزيزي {{studentName}}،\n\nهذا تذكير بأن دفع الرسوم الدراسية مستحق:\n\nالمبلغ المستحق: {{amount}} {{currency}}\nتاريخ الاستحقاق: {{dueDate}}\nمرجع الدفع: {{reference}}\n\nيرجى القيام بالدفع لتجنب أي رسوم تأخير.\n\nمع أطيب التحيات،\nالشؤون المالية`
    }
  },

  paymentConfirmation: {
    subject: {
      en: 'Payment Confirmation',
      ar: 'تأكيد الدفع'
    },
    body: {
      en: `Dear {{studentName}},\n\nYour payment has been processed successfully:\n\nAmount Paid: {{amount}} {{currency}}\nPayment Method: {{paymentMethod}}\nTransaction ID: {{transactionId}}\nDate: {{paymentDate}}\n\nThank you for your payment.\n\nBest regards,\nFinancial Affairs`,
      ar: `عزيزي {{studentName}}،\n\nتم معالجة دفعتك بنجاح:\n\nالمبلغ المدفوع: {{amount}} {{currency}}\nطريقة الدفع: {{paymentMethod}}\nرقم المعاملة: {{transactionId}}\nالتاريخ: {{paymentDate}}\n\nشكراً لك على الدفع.\n\nمع أطيب التحيات،\nالشؤون المالية`
    }
  },

  // General notifications
  eventReminder: {
    subject: {
      en: 'Event Reminder: {{eventName}}',
      ar: 'تذكير بالفعالية: {{eventName}}'
    },
    body: {
      en: `Dear {{name}},\n\nThis is a reminder about the upcoming event:\n\nEvent: {{eventName}}\nDate: {{eventDate}}\nTime: {{eventTime}}\nLocation: {{eventLocation}}\n\nWe look forward to seeing you there!\n\nBest regards,\nEvent Organizers`,
      ar: `عزيزي {{name}}،\n\nهذا تذكير بالفعالية القادمة:\n\nالفعالية: {{eventName}}\nالتاريخ: {{eventDate}}\nالوقت: {{eventTime}}\nالمكان: {{eventLocation}}\n\nنتطلع لرؤيتك هناك!\n\nمع أطيب التحيات،\nمنظمو الفعالية`
    }
  }
};

// Template processing function
function processTemplate(templateName, language, variables) {
  const template = templates[templateName];
  if (!template) {
    throw new Error(`Template '${templateName}' not found`);
  }

  const subject = template.subject[language] || template.subject.en;
  const body = template.body[language] || template.body.en;

  // Replace variables in template
  let processedSubject = subject;
  let processedBody = body;

  for (const [key, value] of Object.entries(variables)) {
    const regex = new RegExp(`{{${key}}}`, 'g');
    processedSubject = processedSubject.replace(regex, value);
    processedBody = processedBody.replace(regex, value);
  }

  return { subject: processedSubject, body: processedBody };
}

// Send email notification
async function sendEmail(options) {
  if (!emailTransporter) {
    logger.warn('Email transporter not configured. Skipping email notification.');
    return { success: false, reason: 'Email not configured' };
  }

  try {
    const {
      to,
      subject,
      body,
      html,
      attachments = [],
      template,
      templateVariables = {},
      language = 'en'
    } = options;

    let emailSubject = subject;
    let emailBody = body;
    let emailHtml = html;

    // Use template if provided
    if (template) {
      const processed = processTemplate(template, language, templateVariables);
      emailSubject = processed.subject;
      emailBody = processed.body;
      emailHtml = emailBody.replace(/\n/g, '<br>');
    }

    const mailOptions = {
      from: `"University SIS" <${process.env.EMAIL_FROM || process.env.EMAIL_USERNAME}>`,
      to: Array.isArray(to) ? to.join(', ') : to,
      subject: emailSubject,
      text: emailBody,
      html: emailHtml,
      attachments
    };

    const result = await emailTransporter.sendMail(mailOptions);
    
    logger.info('Email sent successfully', {
      to: mailOptions.to,
      subject: emailSubject,
      messageId: result.messageId
    });

    return {
      success: true,
      messageId: result.messageId,
      to: mailOptions.to
    };
  } catch (error) {
    logger.logError('Email sending failed', {
      to: options.to,
      subject: options.subject,
      error: error.message
    });
    throw error;
  }
}

// Send SMS notification
async function sendSMS(options) {
  if (!smsClient) {
    logger.warn('SMS client not configured. Skipping SMS notification.');
    return { success: false, reason: 'SMS not configured' };
  }

  try {
    const {
      to,
      message,
      template,
      templateVariables = {},
      language = 'en'
    } = options;

    let smsMessage = message;

    // Use template if provided (simplified for SMS)
    if (template && templates[template]) {
      const templateBody = templates[template].body[language] || templates[template].body.en;
      smsMessage = templateBody;
      
      // Replace variables
      for (const [key, value] of Object.entries(templateVariables)) {
        const regex = new RegExp(`{{${key}}}`, 'g');
        smsMessage = smsMessage.replace(regex, value);
      }
      
      // Truncate for SMS (160 characters limit)
      if (smsMessage.length > 160) {
        smsMessage = smsMessage.substring(0, 157) + '...';
      }
    }

    const result = await smsClient.messages.create({
      body: smsMessage,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: to
    });

    logger.info('SMS sent successfully', {
      to: to,
      sid: result.sid,
      status: result.status
    });

    return {
      success: true,
      sid: result.sid,
      to: to,
      status: result.status
    };
  } catch (error) {
    logger.logError('SMS sending failed', {
      to: options.to,
      error: error.message
    });
    throw error;
  }
}

// Send notification (email and/or SMS)
async function sendNotification(options) {
  const {
    userId,
    channels = ['email'], // 'email', 'sms', or both
    ...notificationData
  } = options;

  const results = {};

  // Get user preferences if userId provided
  let userPreferences = { email: true, sms: false };
  if (userId) {
    try {
      const User = require('../models/User');
      const user = await User.findById(userId);
      if (user && user.notificationPreferences) {
        userPreferences = user.notificationPreferences;
      }
    } catch (error) {
      logger.warn('Could not fetch user notification preferences', { userId, error: error.message });
    }
  }

  // Send email if requested and enabled
  if (channels.includes('email') && userPreferences.email) {
    try {
      results.email = await sendEmail(notificationData);
    } catch (error) {
      results.email = { success: false, error: error.message };
    }
  }

  // Send SMS if requested and enabled
  if (channels.includes('sms') && userPreferences.sms && notificationData.phone) {
    try {
      results.sms = await sendSMS({
        to: notificationData.phone,
        ...notificationData
      });
    } catch (error) {
      results.sms = { success: false, error: error.message };
    }
  }

  // Log notification attempt
  logger.logBusinessEvent(
    'NOTIFICATION_SENT',
    userId,
    'Notification',
    notificationData.template || 'custom',
    {
      channels,
      results,
      to: notificationData.to || notificationData.phone
    }
  );

  return results;
}

// Bulk notification sender
async function sendBulkNotification(recipients, notificationData) {
  const results = [];
  const batchSize = 10; // Process in batches to avoid overwhelming the service

  for (let i = 0; i < recipients.length; i += batchSize) {
    const batch = recipients.slice(i, i + batchSize);
    
    const batchPromises = batch.map(async (recipient) => {
      try {
        const result = await sendNotification({
          ...notificationData,
          ...recipient
        });
        return { recipient, result, success: true };
      } catch (error) {
        return { recipient, error: error.message, success: false };
      }
    });

    const batchResults = await Promise.allSettled(batchPromises);
    results.push(...batchResults.map(r => r.value || r.reason));

    // Small delay between batches
    if (i + batchSize < recipients.length) {
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }

  logger.info('Bulk notification completed', {
    totalRecipients: recipients.length,
    successful: results.filter(r => r.success).length,
    failed: results.filter(r => !r.success).length
  });

  return results;
}

// Scheduled notification system
class NotificationScheduler {
  constructor() {
    this.scheduledJobs = new Map();
  }

  scheduleNotification(id, scheduledTime, notificationData) {
    const delay = scheduledTime.getTime() - Date.now();
    
    if (delay <= 0) {
      // Send immediately if scheduled time has passed
      return sendNotification(notificationData);
    }

    const timeoutId = setTimeout(async () => {
      try {
        await sendNotification(notificationData);
        this.scheduledJobs.delete(id);
        logger.info('Scheduled notification sent', { id, scheduledTime });
      } catch (error) {
        logger.logError('Scheduled notification failed', { id, error: error.message });
      }
    }, delay);

    this.scheduledJobs.set(id, timeoutId);
    logger.info('Notification scheduled', { id, scheduledTime, delay });
  }

  cancelScheduledNotification(id) {
    const timeoutId = this.scheduledJobs.get(id);
    if (timeoutId) {
      clearTimeout(timeoutId);
      this.scheduledJobs.delete(id);
      logger.info('Scheduled notification cancelled', { id });
      return true;
    }
    return false;
  }

  getScheduledCount() {
    return this.scheduledJobs.size;
  }
}

const scheduler = new NotificationScheduler();

// Predefined notification functions for common scenarios
const notifications = {
  // Authentication
  sendWelcomeEmail: (user) => sendNotification({
    to: user.email,
    template: 'welcome',
    templateVariables: {
      name: user.fullName || `${user.firstName} ${user.lastName}`,
      email: user.email,
      role: user.role
    },
    language: user.language || 'en'
  }),

  sendPasswordResetEmail: (user, resetLink) => sendNotification({
    to: user.email,
    template: 'passwordReset',
    templateVariables: {
      name: user.fullName || `${user.firstName} ${user.lastName}`,
      resetLink
    },
    language: user.language || 'en'
  }),

  // Academic
  sendEnrollmentConfirmation: (student, course, instructor, section, schedule) => sendNotification({
    userId: student.userId,
    to: student.email,
    template: 'enrollmentConfirmation',
    templateVariables: {
      studentName: student.fullName,
      courseName: course.title,
      courseCode: course.courseCode,
      instructorName: instructor.fullName,
      section,
      schedule
    },
    language: student.language || 'en'
  }),

  sendGradeNotification: (student, course, grade, gpaImpact) => sendNotification({
    userId: student.userId,
    to: student.email,
    template: 'gradeNotification',
    templateVariables: {
      studentName: student.fullName,
      courseName: course.title,
      courseCode: course.courseCode,
      grade,
      gpaImpact
    },
    language: student.language || 'en'
  }),

  // Financial
  sendTuitionReminder: (student, amount, currency, dueDate, reference) => sendNotification({
    userId: student.userId,
    to: student.email,
    channels: ['email', 'sms'],
    phone: student.phone,
    template: 'tuitionDue',
    templateVariables: {
      studentName: student.fullName,
      amount,
      currency,
      dueDate: dueDate.toLocaleDateString(student.language === 'ar' ? 'ar-SA' : 'en-US'),
      reference
    },
    language: student.language || 'en'
  }),

  sendPaymentConfirmation: (student, payment) => sendNotification({
    userId: student.userId,
    to: student.email,
    template: 'paymentConfirmation',
    templateVariables: {
      studentName: student.fullName,
      amount: payment.amount,
      currency: payment.currency || 'USD',
      paymentMethod: payment.paymentMethod,
      transactionId: payment.transactionId,
      paymentDate: payment.paymentDate.toLocaleDateString(student.language === 'ar' ? 'ar-SA' : 'en-US')
    },
    language: student.language || 'en'
  }),

  // Events
  sendEventReminder: (user, event) => sendNotification({
    userId: user._id,
    to: user.email,
    template: 'eventReminder',
    templateVariables: {
      name: user.fullName || `${user.firstName} ${user.lastName}`,
      eventName: event.title,
      eventDate: event.date.toLocaleDateString(user.language === 'ar' ? 'ar-SA' : 'en-US'),
      eventTime: event.time,
      eventLocation: event.location
    },
    language: user.language || 'en'
  })
};

module.exports = {
  sendEmail,
  sendSMS,
  sendNotification,
  sendBulkNotification,
  scheduler,
  notifications,
  templates,
  processTemplate
};
