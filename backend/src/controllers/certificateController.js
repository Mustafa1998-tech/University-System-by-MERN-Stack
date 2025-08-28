const Student = require('../models/Student');
const Course = require('../models/Course');
const Enrollment = require('../models/Enrollment');
const Tuition = require('../models/Tuition');
const Faculty = require('../models/Faculty');
const Department = require('../models/Department');
const pdfGenerator = require('../utils/pdfGenerator');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const crypto = require('crypto');
const path = require('path');
const fs = require('fs');

// Generate verification code
const generateVerificationCode = () => {
  return crypto.randomBytes(16).toString('hex').toUpperCase();
};

// Get student data with populated fields
const getStudentData = async (studentId) => {
  const student = await Student.findById(studentId)
    .populate('userId', 'firstName lastName firstNameAr lastNameAr email')
    .populate('department', 'name nameAr')
    .populate('faculty', 'name nameAr')
    .populate('advisor', 'firstName lastName firstNameAr lastNameAr');

  if (!student) {
    throw new AppError({
      en: 'Student not found',
      ar: 'الطالب غير موجود'
    }, 404);
  }

  return {
    ...student.toObject(),
    fullName: `${student.userId.firstName} ${student.userId.lastName}`,
    fullNameAr: student.userId.firstNameAr && student.userId.lastNameAr ? 
      `${student.userId.firstNameAr} ${student.userId.lastNameAr}` : null,
    facultyName: student.faculty?.name,
    facultyNameAr: student.faculty?.nameAr,
    departmentName: student.department?.name,
    departmentNameAr: student.department?.nameAr,
    advisorName: student.advisor ? 
      `${student.advisor.firstName} ${student.advisor.lastName}` : null,
    advisorNameAr: student.advisor && student.advisor.firstNameAr ? 
      `${student.advisor.firstNameAr} ${student.advisor.lastNameAr}` : null
  };
};

// Generate graduation certificate
const generateGraduationCertificate = catchAsync(async (req, res, next) => {
  const { studentId } = req.params;
  const { language = 'en', format = 'pdf' } = req.query;

  // Check permissions
  if (req.user.role !== 'admin' && req.user.role !== 'staff' && 
      req.user.studentId?.toString() !== studentId) {
    return next(new AppError({
      en: 'You are not authorized to access this certificate',
      ar: 'غير مصرح لك بالوصول إلى هذه الشهادة'
    }, 403));
  }

  const studentData = await getStudentData(studentId);

  // Check if student has graduated
  if (studentData.status !== 'graduated') {
    return next(new AppError({
      en: 'Student has not graduated yet',
      ar: 'الطالب لم يتخرج بعد'
    }, 400));
  }

  // Generate verification code
  const verificationCode = generateVerificationCode();

  // Save certificate record
  const certificateData = {
    type: 'graduation',
    studentId,
    verificationCode,
    issuedBy: req.user.id,
    issuedAt: new Date(),
    language
  };

  // Add certificate to student record
  studentData.certificates = studentData.certificates || [];
  studentData.certificates.push(certificateData);
  await Student.findByIdAndUpdate(studentId, { certificates: studentData.certificates });

  // Generate PDF
  const doc = await pdfGenerator.generateGraduationCertificate({
    ...studentData,
    verificationCode,
    degree: studentData.program?.degree || 'Bachelor',
    degreeAr: studentData.program?.degreeAr || 'بكالوريوس',
    major: studentData.department?.name || studentData.major,
    majorAr: studentData.department?.nameAr || studentData.majorAr,
    graduationDate: studentData.graduationDate || new Date(),
    gpa: studentData.gpa?.cumulative || 0,
    classification: studentData.classification || 'Pass',
    classificationAr: studentData.classificationAr || 'نجح'
  }, {
    language,
    universityName: process.env.UNIVERSITY_NAME || 'University Name',
    universityNameAr: process.env.UNIVERSITY_NAME_AR || 'اسم الجامعة'
  });

  if (format === 'buffer') {
    const buffer = await pdfGenerator.generateBuffer(doc);
    return res.status(200).json({
      status: 'success',
      data: {
        pdf: buffer.toString('base64'),
        verificationCode
      }
    });
  }

  // Set response headers for PDF download
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader(
    'Content-Disposition',
    `attachment; filename="graduation-certificate-${studentData.studentId}.pdf"`
  );

  // Pipe PDF to response
  doc.pipe(res);
  doc.end();
});

// Generate transcript
const generateTranscript = catchAsync(async (req, res, next) => {
  const { studentId } = req.params;
  const { language = 'en', format = 'pdf' } = req.query;

  // Check permissions
  if (req.user.role !== 'admin' && req.user.role !== 'staff' && 
      req.user.studentId?.toString() !== studentId) {
    return next(new AppError({
      en: 'You are not authorized to access this transcript',
      ar: 'غير مصرح لك بالوصول إلى هذا الكشف'
    }, 403));
  }

  const studentData = await getStudentData(studentId);

  // Get student's course enrollments with grades
  const enrollments = await Enrollment.find({ 
    student: studentId,
    status: { $in: ['completed', 'passed', 'failed'] }
  })
  .populate('course', 'courseCode name nameAr credits')
  .populate('semester', 'name year')
  .sort({ 'semester.year': 1, 'semester.name': 1 });

  // Format courses for transcript
  const courses = enrollments.map(enrollment => ({
    courseCode: enrollment.course.courseCode,
    name: enrollment.course.name,
    nameAr: enrollment.course.nameAr,
    credits: enrollment.course.credits,
    grade: enrollment.finalGrade?.letter || 'IP',
    gradePoints: enrollment.finalGrade?.points || 0,
    semester: enrollment.semester.name,
    year: enrollment.semester.year
  }));

  // Generate verification code
  const verificationCode = generateVerificationCode();

  // Save transcript record
  const transcriptData = {
    type: 'transcript',
    studentId,
    verificationCode,
    issuedBy: req.user.id,
    issuedAt: new Date(),
    language
  };

  // Add transcript to student record
  studentData.transcripts = studentData.transcripts || [];
  studentData.transcripts.push(transcriptData);
  await Student.findByIdAndUpdate(studentId, { transcripts: studentData.transcripts });

  // Generate PDF
  const doc = await pdfGenerator.generateTranscript({
    ...studentData,
    verificationCode,
    major: studentData.department?.name || studentData.major,
    majorAr: studentData.department?.nameAr || studentData.majorAr
  }, courses, {
    language,
    universityName: process.env.UNIVERSITY_NAME || 'University Name',
    universityNameAr: process.env.UNIVERSITY_NAME_AR || 'اسم الجامعة'
  });

  if (format === 'buffer') {
    const buffer = await pdfGenerator.generateBuffer(doc);
    return res.status(200).json({
      status: 'success',
      data: {
        pdf: buffer.toString('base64'),
        verificationCode
      }
    });
  }

  // Set response headers for PDF download
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader(
    'Content-Disposition',
    `attachment; filename="transcript-${studentData.studentId}.pdf"`
  );

  // Pipe PDF to response
  doc.pipe(res);
  doc.end();
});

// Generate enrollment certificate
const generateEnrollmentCertificate = catchAsync(async (req, res, next) => {
  const { studentId } = req.params;
  const { language = 'en', format = 'pdf' } = req.query;

  // Check permissions
  if (req.user.role !== 'admin' && req.user.role !== 'staff' && 
      req.user.studentId?.toString() !== studentId) {
    return next(new AppError({
      en: 'You are not authorized to access this certificate',
      ar: 'غير مصرح لك بالوصول إلى هذه الشهادة'
    }, 403));
  }

  const studentData = await getStudentData(studentId);

  // Check if student is currently enrolled
  if (studentData.status !== 'active') {
    return next(new AppError({
      en: 'Student is not currently enrolled',
      ar: 'الطالب غير مقيد حالياً'
    }, 400));
  }

  // Generate verification code
  const verificationCode = generateVerificationCode();

  // Save certificate record
  const certificateData = {
    type: 'enrollment',
    studentId,
    verificationCode,
    issuedBy: req.user.id,
    issuedAt: new Date(),
    language
  };

  // Add certificate to student record
  studentData.certificates = studentData.certificates || [];
  studentData.certificates.push(certificateData);
  await Student.findByIdAndUpdate(studentId, { certificates: studentData.certificates });

  // Generate PDF
  const doc = await pdfGenerator.generateEnrollmentCertificate({
    ...studentData,
    verificationCode,
    major: studentData.department?.name || studentData.major,
    majorAr: studentData.department?.nameAr || studentData.majorAr,
    currentSemester: studentData.currentSemester || 'Fall 2024',
    academicYear: studentData.academicYear || '2024-2025',
    studyType: studentData.studyType || 'Full-time',
    studyTypeAr: studentData.studyTypeAr || 'دوام كامل',
    level: studentData.level || 'Undergraduate',
    levelAr: studentData.levelAr || 'مرحلة البكالوريوس'
  }, {
    language,
    universityName: process.env.UNIVERSITY_NAME || 'University Name',
    universityNameAr: process.env.UNIVERSITY_NAME_AR || 'اسم الجامعة'
  });

  if (format === 'buffer') {
    const buffer = await pdfGenerator.generateBuffer(doc);
    return res.status(200).json({
      status: 'success',
      data: {
        pdf: buffer.toString('base64'),
        verificationCode
      }
    });
  }

  // Set response headers for PDF download
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader(
    'Content-Disposition',
    `attachment; filename="enrollment-certificate-${studentData.studentId}.pdf"`
  );

  // Pipe PDF to response
  doc.pipe(res);
  doc.end();
});

// Generate financial report
const generateFinancialReport = catchAsync(async (req, res, next) => {
  const { studentId } = req.params;
  const { language = 'en', format = 'pdf', reportType = 'summary' } = req.query;

  // Check permissions
  if (req.user.role !== 'admin' && req.user.role !== 'staff' && 
      req.user.studentId?.toString() !== studentId) {
    return next(new AppError({
      en: 'You are not authorized to access this report',
      ar: 'غير مصرح لك بالوصول إلى هذا التقرير'
    }, 403));
  }

  const studentData = await getStudentData(studentId);

  // Get financial transactions
  const tuitionRecords = await Tuition.find({ student: studentId })
    .sort({ createdAt: -1 });

  // Format transactions
  const transactions = [];
  
  tuitionRecords.forEach(tuition => {
    // Add charges
    if (tuition.amountDue > 0) {
      transactions.push({
        date: tuition.dueDate,
        description: `Tuition Fee - ${tuition.semester}`,
        type: 'charge',
        amount: tuition.amountDue
      });
    }

    // Add payments
    tuition.payments.forEach(payment => {
      transactions.push({
        date: payment.paymentDate,
        description: `Payment - ${payment.method}`,
        type: 'payment',
        amount: payment.amount
      });
    });
  });

  // Sort transactions by date
  transactions.sort((a, b) => new Date(a.date) - new Date(b.date));

  // Generate verification code
  const verificationCode = generateVerificationCode();

  // Generate PDF
  const doc = await pdfGenerator.generateFinancialReport({
    ...studentData,
    verificationCode,
    currentSemester: studentData.currentSemester || 'Fall 2024'
  }, transactions, {
    language,
    reportType,
    universityName: process.env.UNIVERSITY_NAME || 'University Name',
    universityNameAr: process.env.UNIVERSITY_NAME_AR || 'اسم الجامعة'
  });

  if (format === 'buffer') {
    const buffer = await pdfGenerator.generateBuffer(doc);
    return res.status(200).json({
      status: 'success',
      data: {
        pdf: buffer.toString('base64'),
        verificationCode
      }
    });
  }

  // Set response headers for PDF download
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader(
    'Content-Disposition',
    `attachment; filename="financial-report-${studentData.studentId}.pdf"`
  );

  // Pipe PDF to response
  doc.pipe(res);
  doc.end();
});

// Verify certificate
const verifyCertificate = catchAsync(async (req, res, next) => {
  const { verificationCode } = req.params;

  // Find student with this verification code in their certificates
  const student = await Student.findOne({
    'certificates.verificationCode': verificationCode.toUpperCase()
  }).populate('userId', 'firstName lastName')
    .populate('department', 'name')
    .populate('faculty', 'name');

  if (!student) {
    // Also check transcripts
    const studentWithTranscript = await Student.findOne({
      'transcripts.verificationCode': verificationCode.toUpperCase()
    }).populate('userId', 'firstName lastName')
      .populate('department', 'name')
      .populate('faculty', 'name');

    if (!studentWithTranscript) {
      return next(new AppError({
        en: 'Invalid verification code',
        ar: 'رمز التحقق غير صالح'
      }, 404));
    }

    const transcript = studentWithTranscript.transcripts.find(
      t => t.verificationCode === verificationCode.toUpperCase()
    );

    return res.status(200).json({
      status: 'success',
      message: req.t ? req.t('certificate.verified') : 'Document verified successfully',
      messageAr: 'تم التحقق من الوثيقة بنجاح',
      data: {
        type: 'transcript',
        student: {
          name: `${studentWithTranscript.userId.firstName} ${studentWithTranscript.userId.lastName}`,
          studentId: studentWithTranscript.studentId,
          department: studentWithTranscript.department?.name,
          faculty: studentWithTranscript.faculty?.name
        },
        issuedAt: transcript.issuedAt,
        verificationCode: transcript.verificationCode
      }
    });
  }

  const certificate = student.certificates.find(
    cert => cert.verificationCode === verificationCode.toUpperCase()
  );

  res.status(200).json({
    status: 'success',
    message: req.t ? req.t('certificate.verified') : 'Certificate verified successfully',
    messageAr: 'تم التحقق من الشهادة بنجاح',
    data: {
      type: certificate.type,
      student: {
        name: `${student.userId.firstName} ${student.userId.lastName}`,
        studentId: student.studentId,
        department: student.department?.name,
        faculty: student.faculty?.name
      },
      issuedAt: certificate.issuedAt,
      verificationCode: certificate.verificationCode
    }
  });
});

// Get student certificates
const getStudentCertificates = catchAsync(async (req, res, next) => {
  const { studentId } = req.params;

  // Check permissions
  if (req.user.role !== 'admin' && req.user.role !== 'staff' && 
      req.user.studentId?.toString() !== studentId) {
    return next(new AppError({
      en: 'You are not authorized to access this information',
      ar: 'غير مصرح لك بالوصول إلى هذه المعلومات'
    }, 403));
  }

  const student = await Student.findById(studentId)
    .select('certificates transcripts')
    .populate('certificates.issuedBy', 'firstName lastName')
    .populate('transcripts.issuedBy', 'firstName lastName');

  if (!student) {
    return next(new AppError({
      en: 'Student not found',
      ar: 'الطالب غير موجود'
    }, 404));
  }

  const allDocuments = [
    ...(student.certificates || []).map(cert => ({ ...cert.toObject(), documentType: 'certificate' })),
    ...(student.transcripts || []).map(trans => ({ ...trans.toObject(), documentType: 'transcript' }))
  ].sort((a, b) => new Date(b.issuedAt) - new Date(a.issuedAt));

  res.status(200).json({
    status: 'success',
    results: allDocuments.length,
    data: {
      documents: allDocuments
    }
  });
});

module.exports = {
  generateGraduationCertificate,
  generateTranscript,
  generateEnrollmentCertificate,
  generateFinancialReport,
  verifyCertificate,
  getStudentCertificates
};