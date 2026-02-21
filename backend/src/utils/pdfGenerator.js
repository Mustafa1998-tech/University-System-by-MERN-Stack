const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');
const QRCode = require('qrcode');
const moment = require('moment');

class PDFGenerator {
  constructor() {
    this.defaultFont = 'Helvetica';
    this.arabicFont = path.join(__dirname, '../assets/fonts/NotoSansArabic-Regular.ttf');
    this.boldFont = 'Helvetica-Bold';
    this.italicFont = 'Helvetica-Oblique';
    this.hasArabicFont = false;
    
    // University branding colors
    this.colors = {
      primary: '#1e40af',
      secondary: '#64748b',
      accent: '#f59e0b',
      success: '#059669',
      text: '#1f2937',
      lightGray: '#f3f4f6',
      darkGray: '#6b7280'
    };
  }

  // Create a new PDF document with standard settings
  createDocument(options = {}) {
    const doc = new PDFDocument({
      size: options.size || 'A4',
      margins: options.margins || { top: 50, bottom: 50, left: 50, right: 50 },
      info: {
        Title: options.title || 'University Document',
        Author: 'University Student Information System',
        Subject: options.subject || 'Official Document',
        Keywords: options.keywords || 'university, certificate, official',
        Creator: 'SIS PDF Generator',
        Producer: 'University SIS v1.0'
      }
    });

    // Register Arabic font if available
    try {
      if (fs.existsSync(this.arabicFont)) {
        doc.registerFont('Arabic', this.arabicFont);
        this.hasArabicFont = true;
      } else {
        console.warn('Arabic font not found, using default font for Arabic text');
        this.hasArabicFont = false;
      }
    } catch (error) {
      console.warn('Arabic font registration failed, using default font:', error.message);
      this.hasArabicFont = false;
    }

    return doc;
  }

  // Add university header to document
  addHeader(doc, options = {}) {
    const { 
      universityName = 'University Name',
      universityNameAr = 'اسم الجامعة',
      logoPath = null,
      language = 'en'
    } = options;

    // Add logo if provided
    if (logoPath && fs.existsSync(logoPath)) {
      doc.image(logoPath, 50, 30, { width: 60 });
    }

    // University name
    doc.font(language === 'ar' && this.hasArabicFont ? 'Arabic' : this.boldFont)
       .fontSize(20)
       .fillColor(this.colors.primary);

    if (language === 'ar') {
      doc.text(universityNameAr, 50, 50, { align: 'right', width: 500 });
      doc.text(universityName, 50, 75, { align: 'right', width: 500 });
    } else {
      doc.text(universityName, logoPath ? 120 : 50, 50);
      if (universityNameAr) {
        doc.font(this.hasArabicFont ? 'Arabic' : this.defaultFont).text(universityNameAr, logoPath ? 120 : 50, 75);
      }
    }

    // Add line separator
    doc.strokeColor(this.colors.primary)
       .lineWidth(2)
       .moveTo(50, 110)
       .lineTo(550, 110)
       .stroke();

    return 130; // Return Y position after header
  }

  // Add footer with page numbers and verification
  async addFooter(doc, options = {}) {
    const { 
      issueDate = new Date(),
      language = 'en',
      verificationCode = null,
      qrData = null
    } = options;

    const pageHeight = doc.page.height;
    let yPos = pageHeight - 100;

    // Verification section
    if (verificationCode || qrData) {
      yPos -= 30;
      
      doc.font(this.defaultFont)
         .fontSize(8)
         .fillColor(this.colors.darkGray);

      if (language === 'ar') {
        doc.text('رمز التحقق:', 50, yPos, { align: 'right' });
        if (verificationCode) {
          doc.text(verificationCode, 50, yPos + 12, { align: 'right' });
        }
      } else {
        doc.text('Verification Code:', 50, yPos);
        if (verificationCode) {
          doc.text(verificationCode, 50, yPos + 12);
        }
      }

      // Add QR code if data provided
      if (qrData) {
        try {
          const qrBuffer = await QRCode.toBuffer(qrData, { width: 60 });
          doc.image(qrBuffer, 450, yPos - 10, { width: 60 });
        } catch (error) {
          console.warn('QR code generation failed:', error.message);
        }
      }
    }

    // Issue date
    yPos = pageHeight - 50;
    doc.font(this.defaultFont)
       .fontSize(8)
       .fillColor(this.colors.darkGray);

    const dateText = language === 'ar' ? 
      `تاريخ الإصدار: ${moment(issueDate).format('YYYY/MM/DD')}` :
      `Issue Date: ${moment(issueDate).format('MMMM DD, YYYY')}`;

    doc.text(dateText, 50, yPos, { 
      align: language === 'ar' ? 'right' : 'left',
      width: 450
    });

    // Page number
    const pageNum = language === 'ar' ? 
      `صفحة ${doc.bufferedPageRange().count}` :
      `Page ${doc.bufferedPageRange().count}`;
    
    doc.text(pageNum, 50, yPos, { 
      align: language === 'ar' ? 'left' : 'right',
      width: 450
    });
  }

  // Generate graduation certificate
  async generateGraduationCertificate(studentData, options = {}) {
    const {
      language = 'en',
      includeGrades = false,
      templateStyle = 'formal'
    } = options;

    const doc = this.createDocument({
      title: `Graduation Certificate - ${studentData.fullName}`,
      subject: 'Official Graduation Certificate'
    });

    let yPos = this.addHeader(doc, { language, ...options });
    yPos += 50;

    // Certificate title
    doc.font(this.boldFont)
       .fontSize(24)
       .fillColor(this.colors.primary)
       .text(
         language === 'ar' ? 'شهادة التخرج' : 'GRADUATION CERTIFICATE',
         50, yPos,
         { align: 'center', width: 500 }
       );

    yPos += 60;

    // Certificate body
    doc.font(language === 'ar' ? 'Arabic' : this.defaultFont)
       .fontSize(14)
       .fillColor(this.colors.text);

    if (language === 'ar') {
      const certText = `هذا يشهد بأن الطالب/ة ${studentData.fullNameAr || studentData.fullName} ` +
                      `قد أتم/ت بنجاح جميع متطلبات درجة ${studentData.degreeAr || studentData.degree} ` +
                      `في تخصص ${studentData.majorAr || studentData.major} ` +
                      `من ${studentData.facultyNameAr || studentData.facultyName}`;
      
      doc.text(certText, 50, yPos, { 
        align: 'right', 
        width: 500,
        lineGap: 8
      });
    } else {
      const certText = `This is to certify that ${studentData.fullName} ` +
                      `has successfully completed all requirements for the degree of ` +
                      `${studentData.degree} in ${studentData.major} ` +
                      `from the ${studentData.facultyName}`;
      
      doc.text(certText, 50, yPos, { 
        align: 'center', 
        width: 500,
        lineGap: 8
      });
    }

    yPos += 80;

    // Student details table
    const details = [
      { 
        label: language === 'ar' ? 'رقم الطالب' : 'Student ID',
        value: studentData.studentId 
      },
      { 
        label: language === 'ar' ? 'تاريخ التخرج' : 'Graduation Date',
        value: moment(studentData.graduationDate).format('MMMM DD, YYYY')
      },
      { 
        label: language === 'ar' ? 'المعدل التراكمي' : 'Cumulative GPA',
        value: studentData.gpa?.toFixed(2) || 'N/A'
      },
      { 
        label: language === 'ar' ? 'التقدير' : 'Classification',
        value: language === 'ar' ? studentData.classificationAr : studentData.classification
      }
    ];

    details.forEach((detail, index) => {
      doc.font(this.boldFont)
         .fontSize(12)
         .text(detail.label + ':', 100, yPos + (index * 25), { width: 150 });
      
      doc.font(this.defaultFont)
         .text(detail.value, 250, yPos + (index * 25), { width: 250 });
    });

    yPos += 150;

    // Signatures section
    if (templateStyle === 'formal') {
      // Dean signature
      doc.font(this.defaultFont)
         .fontSize(12)
         .text(
           language === 'ar' ? 'عميد الكلية' : 'Dean of Faculty',
           100, yPos,
           { align: 'center', width: 150 }
         );

      // Registrar signature  
      doc.text(
        language === 'ar' ? 'مسجل الجامعة' : 'University Registrar',
        350, yPos,
        { align: 'center', width: 150 }
      );

      // Signature lines
      doc.strokeColor(this.colors.darkGray)
         .lineWidth(1)
         .moveTo(100, yPos - 10)
         .lineTo(250, yPos - 10)
         .stroke()
         .moveTo(350, yPos - 10)
         .lineTo(500, yPos - 10)
         .stroke();
    }

    // Add footer
    await this.addFooter(doc, {
      language,
      verificationCode: studentData.verificationCode,
      qrData: `${process.env.FRONTEND_URL}/verify/${studentData.verificationCode}`,
      issueDate: new Date()
    });

    return doc;
  }

  // Generate transcript
  async generateTranscript(studentData, courses, options = {}) {
    const { language = 'en' } = options;

    const doc = this.createDocument({
      title: `Official Transcript - ${studentData.fullName}`,
      subject: 'Academic Transcript'
    });

    let yPos = this.addHeader(doc, { language, ...options });
    yPos += 30;

    // Transcript title
    doc.font(this.boldFont)
       .fontSize(20)
       .fillColor(this.colors.primary)
       .text(
         language === 'ar' ? 'كشف الدرجات الرسمي' : 'OFFICIAL TRANSCRIPT',
         50, yPos,
         { align: 'center', width: 500 }
       );

    yPos += 50;

    // Student information
    const studentInfo = [
      { 
        label: language === 'ar' ? 'الاسم' : 'Name',
        value: language === 'ar' ? studentData.fullNameAr : studentData.fullName
      },
      { 
        label: language === 'ar' ? 'رقم الطالب' : 'Student ID',
        value: studentData.studentId 
      },
      { 
        label: language === 'ar' ? 'التخصص' : 'Major',
        value: language === 'ar' ? studentData.majorAr : studentData.major
      },
      { 
        label: language === 'ar' ? 'الكلية' : 'Faculty',
        value: language === 'ar' ? studentData.facultyNameAr : studentData.facultyName
      }
    ];

    doc.font(this.defaultFont).fontSize(11);
    
    studentInfo.forEach((info, index) => {
      const col = index % 2;
      const row = Math.floor(index / 2);
      const xPos = col === 0 ? 50 : 300;
      const currentY = yPos + (row * 20);

      doc.font(this.boldFont).text(info.label + ':', xPos, currentY, { width: 80 });
      doc.font(this.defaultFont).text(info.value, xPos + 80, currentY, { width: 170 });
    });

    yPos += 60;

    // Courses table header
    doc.rect(50, yPos, 500, 25)
       .fillAndStroke(this.colors.lightGray, this.colors.darkGray);

    doc.font(this.boldFont)
       .fontSize(10)
       .fillColor(this.colors.text);

    const headers = language === 'ar' ? 
      ['رمز المقرر', 'اسم المقرر', 'الساعات', 'الدرجة', 'النقاط'] :
      ['Course Code', 'Course Title', 'Credits', 'Grade', 'Points'];

    const colWidths = [80, 250, 60, 60, 50];
    let xPos = 55;

    headers.forEach((header, index) => {
      doc.text(header, xPos, yPos + 8, { width: colWidths[index], align: 'center' });
      xPos += colWidths[index];
    });

    yPos += 30;

    // Course rows
    let totalCredits = 0;
    let totalPoints = 0;

    courses.forEach((course, index) => {
      const rowY = yPos + (index * 20);
      
      // Alternate row colors
      if (index % 2 === 1) {
        doc.rect(50, rowY - 2, 500, 20)
           .fillAndStroke('#f9fafb', '#f9fafb');
      }

      doc.font(this.defaultFont)
         .fontSize(9)
         .fillColor(this.colors.text);

      xPos = 55;
      const values = [
        course.courseCode,
        language === 'ar' ? course.nameAr : course.name,
        course.credits.toString(),
        course.grade,
        course.gradePoints?.toFixed(1) || '0.0'
      ];

      values.forEach((value, colIndex) => {
        doc.text(value, xPos, rowY + 3, { 
          width: colWidths[colIndex], 
          align: colIndex === 1 ? 'left' : 'center' 
        });
        xPos += colWidths[colIndex];
      });

      totalCredits += course.credits;
      totalPoints += course.gradePoints || 0;
    });

    yPos += (courses.length * 20) + 20;

    // Summary
    doc.rect(50, yPos, 500, 40)
       .fillAndStroke(this.colors.lightGray, this.colors.darkGray);

    doc.font(this.boldFont)
       .fontSize(11)
       .fillColor(this.colors.text);

    const gpa = totalCredits > 0 ? (totalPoints / totalCredits).toFixed(2) : '0.00';

    doc.text(
      language === 'ar' ? `إجمالي الساعات: ${totalCredits}` : `Total Credits: ${totalCredits}`,
      60, yPos + 8
    );

    doc.text(
      language === 'ar' ? `المعدل التراكمي: ${gpa}` : `Cumulative GPA: ${gpa}`,
      60, yPos + 22
    );

    // Add footer
    await this.addFooter(doc, {
      language,
      verificationCode: studentData.verificationCode,
      qrData: `${process.env.FRONTEND_URL}/verify/${studentData.verificationCode}`,
      issueDate: new Date()
    });

    return doc;
  }

  // Generate enrollment certificate
  async generateEnrollmentCertificate(studentData, options = {}) {
    const { language = 'en' } = options;

    const doc = this.createDocument({
      title: `Enrollment Certificate - ${studentData.fullName}`,
      subject: 'Enrollment Verification'
    });

    let yPos = this.addHeader(doc, { language, ...options });
    yPos += 50;

    // Certificate title
    doc.font(this.boldFont)
       .fontSize(22)
       .fillColor(this.colors.primary)
       .text(
         language === 'ar' ? 'شهادة قيد' : 'ENROLLMENT CERTIFICATE',
         50, yPos,
         { align: 'center', width: 500 }
       );

    yPos += 80;

    // Certificate body
    doc.font(language === 'ar' && this.hasArabicFont ? 'Arabic' : this.defaultFont)
       .fontSize(14)
       .fillColor(this.colors.text);

    const currentDate = moment().format('MMMM DD, YYYY');
    
    if (language === 'ar') {
      const certText = `تشهد إدارة الجامعة بأن الطالب/ة ${studentData.fullNameAr || studentData.fullName} ` +
                      `رقم ${studentData.studentId} مقيد/ة حالياً في ` +
                      `${studentData.currentSemester} من العام الجامعي ${studentData.academicYear} ` +
                      `في تخصص ${studentData.majorAr || studentData.major} ` +
                      `بكلية ${studentData.facultyNameAr || studentData.facultyName}`;
      
      doc.text(certText, 50, yPos, { 
        align: 'right', 
        width: 500,
        lineGap: 10
      });
    } else {
      const certText = `This is to certify that ${studentData.fullName}, ` +
                      `Student ID: ${studentData.studentId}, is currently enrolled ` +
                      `in ${studentData.currentSemester} of Academic Year ${studentData.academicYear} ` +
                      `in the ${studentData.major} program at ${studentData.facultyName}.`;
      
      doc.text(certText, 50, yPos, { 
        align: 'justify', 
        width: 500,
        lineGap: 10
      });
    }

    yPos += 100;

    // Additional details
    const details = [
      {
        label: language === 'ar' ? 'حالة القيد' : 'Enrollment Status',
        value: language === 'ar' ? 'نشط' : 'Active'
      },
      {
        label: language === 'ar' ? 'نوع الدراسة' : 'Study Type',
        value: language === 'ar' ? studentData.studyTypeAr : studentData.studyType
      },
      {
        label: language === 'ar' ? 'المستوى الدراسي' : 'Academic Level',
        value: language === 'ar' ? studentData.levelAr : studentData.level
      },
      {
        label: language === 'ar' ? 'تاريخ الإصدار' : 'Issue Date',
        value: currentDate
      }
    ];

    details.forEach((detail, index) => {
      doc.font(this.boldFont)
         .fontSize(12)
         .text(detail.label + ':', 100, yPos + (index * 25), { width: 150 });
      
      doc.font(this.defaultFont)
         .text(detail.value, 250, yPos + (index * 25), { width: 250 });
    });

    yPos += 150;

    // Purpose statement
    doc.font(this.defaultFont)
       .fontSize(11)
       .fillColor(this.colors.darkGray)
       .text(
         language === 'ar' ? 
         'هذه الشهادة صادرة بناءً على طلب الطالب/ة لأغراض رسمية.' :
         'This certificate is issued at the request of the student for official purposes.',
         50, yPos,
         { align: 'center', width: 500 }
       );

    // Add footer
    await this.addFooter(doc, {
      language,
      verificationCode: studentData.verificationCode,
      qrData: `${process.env.FRONTEND_URL}/verify/${studentData.verificationCode}`,
      issueDate: new Date()
    });

    return doc;
  }

  // Generate financial report
  async generateFinancialReport(studentData, transactions, options = {}) {
    const { language = 'en', reportType = 'summary' } = options;

    const doc = this.createDocument({
      title: `Financial Report - ${studentData.fullName}`,
      subject: 'Student Financial Statement'
    });

    let yPos = this.addHeader(doc, { language, ...options });
    yPos += 30;

    // Report title
    doc.font(this.boldFont)
       .fontSize(18)
       .fillColor(this.colors.primary)
       .text(
         language === 'ar' ? 'التقرير المالي للطالب' : 'STUDENT FINANCIAL REPORT',
         50, yPos,
         { align: 'center', width: 500 }
       );

    yPos += 50;

    // Student info
    doc.font(this.boldFont)
       .fontSize(12)
       .text(
         language === 'ar' ? 'معلومات الطالب:' : 'Student Information:',
         50, yPos
       );

    yPos += 20;

    const studentInfo = [
      { 
        label: language === 'ar' ? 'الاسم' : 'Name',
        value: language === 'ar' ? studentData.fullNameAr : studentData.fullName
      },
      { 
        label: language === 'ar' ? 'رقم الطالب' : 'Student ID',
        value: studentData.studentId 
      },
      { 
        label: language === 'ar' ? 'الفصل الدراسي' : 'Current Semester',
        value: studentData.currentSemester
      }
    ];

    doc.font(this.defaultFont).fontSize(10);
    
    studentInfo.forEach((info, index) => {
      doc.font(this.boldFont).text(info.label + ':', 70, yPos + (index * 15), { width: 100 });
      doc.font(this.defaultFont).text(info.value, 170, yPos + (index * 15), { width: 200 });
    });

    yPos += 60;

    // Financial summary
    let totalCharges = 0;
    let totalPayments = 0;
    let balance = 0;

    transactions.forEach(transaction => {
      if (transaction.type === 'charge') {
        totalCharges += transaction.amount;
      } else if (transaction.type === 'payment') {
        totalPayments += transaction.amount;
      }
    });

    balance = totalCharges - totalPayments;

    // Summary table
    doc.font(this.boldFont)
       .fontSize(12)
       .text(
         language === 'ar' ? 'الملخص المالي:' : 'Financial Summary:',
         50, yPos
       );

    yPos += 25;

    // Summary header
    doc.rect(50, yPos, 500, 25)
       .fillAndStroke(this.colors.lightGray, this.colors.darkGray);

    doc.font(this.boldFont)
       .fontSize(11)
       .fillColor(this.colors.text);

    const summaryHeaders = language === 'ar' ? 
      ['البيان', 'المبلغ'] : ['Description', 'Amount'];

    doc.text(summaryHeaders[0], 60, yPos + 8, { width: 350 });
    doc.text(summaryHeaders[1], 420, yPos + 8, { width: 120, align: 'right' });

    yPos += 30;

    // Summary rows
    const summaryData = [
      {
        description: language === 'ar' ? 'إجمالي الرسوم' : 'Total Charges',
        amount: totalCharges.toFixed(2)
      },
      {
        description: language === 'ar' ? 'إجمالي المدفوعات' : 'Total Payments',
        amount: totalPayments.toFixed(2)
      },
      {
        description: language === 'ar' ? 'الرصيد' : 'Balance',
        amount: balance.toFixed(2),
        isBalance: true
      }
    ];

    summaryData.forEach((item, index) => {
      if (item.isBalance) {
        doc.rect(50, yPos + (index * 20) - 2, 500, 20)
           .fillAndStroke(item.amount > 0 ? '#fee2e2' : '#dcfce7', this.colors.darkGray);
      }

      doc.font(this.defaultFont)
         .fontSize(10)
         .fillColor(item.isBalance && item.amount > 0 ? '#dc2626' : this.colors.text);

      doc.text(item.description, 60, yPos + (index * 20) + 3, { width: 350 });
      doc.text('$' + item.amount, 420, yPos + (index * 20) + 3, { width: 120, align: 'right' });
    });

    yPos += 80;

    // Detailed transactions if requested
    if (reportType === 'detailed' && transactions.length > 0) {
      yPos += 20;
      
      doc.font(this.boldFont)
         .fontSize(12)
         .text(
           language === 'ar' ? 'تفاصيل المعاملات:' : 'Transaction Details:',
           50, yPos
         );

      yPos += 25;

      // Transaction table header
      doc.rect(50, yPos, 500, 25)
         .fillAndStroke(this.colors.lightGray, this.colors.darkGray);

      const transHeaders = language === 'ar' ? 
        ['التاريخ', 'الوصف', 'النوع', 'المبلغ'] :
        ['Date', 'Description', 'Type', 'Amount'];

      const transColWidths = [100, 200, 100, 100];
      let xPos = 55;

      transHeaders.forEach((header, index) => {
        doc.font(this.boldFont)
           .fontSize(9)
           .text(header, xPos, yPos + 8, { width: transColWidths[index], align: 'center' });
        xPos += transColWidths[index];
      });

      yPos += 30;

      // Transaction rows
      transactions.slice(0, 15).forEach((transaction, index) => {
        const rowY = yPos + (index * 18);
        
        if (index % 2 === 1) {
          doc.rect(50, rowY - 2, 500, 18)
             .fillAndStroke('#f9fafb', '#f9fafb');
        }

        doc.font(this.defaultFont)
           .fontSize(8)
           .fillColor(this.colors.text);

        xPos = 55;
        const values = [
          moment(transaction.date).format('MM/DD/YYYY'),
          transaction.description,
          transaction.type,
          '$' + transaction.amount.toFixed(2)
        ];

        values.forEach((value, colIndex) => {
          doc.text(value, xPos, rowY + 3, { 
            width: transColWidths[colIndex], 
            align: colIndex === 1 ? 'left' : 'center' 
          });
          xPos += transColWidths[colIndex];
        });
      });
    }

    // Add footer
    await this.addFooter(doc, {
      language,
      verificationCode: studentData.verificationCode,
      qrData: `${process.env.FRONTEND_URL}/verify/${studentData.verificationCode}`,
      issueDate: new Date()
    });

    return doc;
  }

  // Save PDF to file system
  async savePDF(doc, filepath) {
    return new Promise((resolve, reject) => {
      const stream = fs.createWriteStream(filepath);
      doc.pipe(stream);
      doc.end();

      stream.on('finish', () => resolve(filepath));
      stream.on('error', reject);
    });
  }

  // Generate PDF buffer for direct response
  async generateBuffer(doc) {
    return new Promise((resolve, reject) => {
      const buffers = [];
      
      doc.on('data', buffers.push.bind(buffers));
      doc.on('end', () => {
        const pdfBuffer = Buffer.concat(buffers);
        resolve(pdfBuffer);
      });
      doc.on('error', reject);
      
      doc.end();
    });
  }
}

module.exports = new PDFGenerator();
