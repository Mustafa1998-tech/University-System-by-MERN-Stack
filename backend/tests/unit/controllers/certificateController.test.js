const request = require('supertest');
const jwt = require('jsonwebtoken');
const Student = require('../../../src/models/Student');
const Course = require('../../../src/models/Course');
const Enrollment = require('../../../src/models/Enrollment');
const Faculty = require('../../../src/models/Faculty');
const Department = require('../../../src/models/Department');
const User = require('../../../src/models/User');
const app = require('../../../src/app');

describe('Certificate Controller', () => {
  let testUser;
  let adminUser;
  let testStudent;
  let testFaculty;
  let testDepartment;
  let testCourse;
  let accessToken;
  let adminToken;

  beforeEach(async () => {
    // Create test faculty and department
    testFaculty = await Faculty.create({
      name: 'كلية الهندسة',
      nameEn: 'College of Engineering',
      code: 'ENG',
      description: 'كلية الهندسة',
      descriptionEn: 'College of Engineering'
    });

    testDepartment = await Department.create({
      name: 'علوم الحاسوب',
      nameEn: 'Computer Science',
      code: 'CS',
      faculty: testFaculty._id,
      description: 'قسم علوم الحاسوب',
      descriptionEn: 'Computer Science Department'
    });

    // Create test user
    testUser = await createTestUser({
      firstName: 'أحمد',
      lastName: 'محمد',
      firstNameAr: 'أحمد',
      lastNameAr: 'محمد',
      email: 'student@university.edu',
      role: 'student'
    });

    // Create admin user
    adminUser = await createTestUser({
      firstName: 'Admin',
      lastName: 'User',
      email: 'admin@university.edu',
      role: 'admin'
    });

    // Create test student
    testStudent = await Student.create({
      studentId: 'STU123456',
      userId: testUser._id,
      department: testDepartment._id,
      faculty: testFaculty._id,
      program: testDepartment._id,
      academicYear: '2024-2025',
      status: 'active',
      gpa: {
        current: 3.75,
        cumulative: 3.65
      },
      totalCreditsEarned: 120,
      totalCreditsRequired: 120
    });

    // Create test course
    testCourse = await Course.create({
      courseCode: 'CS101',
      title: 'Introduction to Computer Science',
      titleAr: 'مقدمة في علوم الحاسوب',
      description: 'Basic concepts of computer science',
      department: testDepartment._id,
      faculty: testFaculty._id,
      creditHours: 3
    });

    // Generate tokens
    accessToken = generateAuthToken(testUser);
    adminToken = generateAuthToken(adminUser);

    // Set student reference in user
    testUser.studentId = testStudent._id;
    await testUser.save();
  });

  describe('POST /api/certificates/graduation/:studentId', () => {
    it('should generate graduation certificate for graduated student', async () => {
      // Set student as graduated
      await Student.findByIdAndUpdate(testStudent._id, { 
        status: 'graduated',
        graduationDate: new Date('2024-06-15')
      });

      const response = await request(app)
        .post(`/api/certificates/graduation/${testStudent._id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .query({ format: 'buffer', language: 'en' })
        .expect(200);

      expect(response.body.status).toBe('success');
      expect(response.body.data.pdf).toBeDefined();
      expect(response.body.data.verificationCode).toBeDefined();
      expect(response.body.data.verificationCode).toMatch(/^[A-F0-9]{32}$/);
    });

    it('should not generate certificate for non-graduated student', async () => {
      const response = await request(app)
        .post(`/api/certificates/graduation/${testStudent._id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(400);

      expect(response.body.status).toBe('error');
      expect(response.body.message).toContain('not graduated');
    });

    it('should allow student to generate their own graduation certificate', async () => {
      // Set student as graduated
      await Student.findByIdAndUpdate(testStudent._id, { 
        status: 'graduated',
        graduationDate: new Date('2024-06-15')
      });

      const response = await request(app)
        .post(`/api/certificates/graduation/${testStudent._id}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .query({ format: 'buffer' })
        .expect(200);

      expect(response.body.status).toBe('success');
      expect(response.body.data.pdf).toBeDefined();
    });

    it('should not allow student to generate other student\'s certificate', async () => {
      // Create another student
      const anotherUser = await createTestUser({
        email: 'another@university.edu',
        role: 'student'
      });

      const anotherStudent = await Student.create({
        studentId: 'STU789012',
        userId: anotherUser._id,
        department: testDepartment._id,
        faculty: testFaculty._id,
        program: testDepartment._id,
        academicYear: '2024-2025',
        status: 'graduated'
      });

      const response = await request(app)
        .post(`/api/certificates/graduation/${anotherStudent._id}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(403);

      expect(response.body.status).toBe('error');
      expect(response.body.message).toContain('not authorized');
    });

    it('should generate Arabic certificate when language is ar', async () => {
      // Set student as graduated
      await Student.findByIdAndUpdate(testStudent._id, { 
        status: 'graduated',
        graduationDate: new Date('2024-06-15')
      });

      const response = await request(app)
        .post(`/api/certificates/graduation/${testStudent._id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .query({ format: 'buffer', language: 'ar' })
        .expect(200);

      expect(response.body.status).toBe('success');
      expect(response.body.data.pdf).toBeDefined();
    });

    it('should return 404 for non-existent student', async () => {
      const nonExistentId = '507f1f77bcf86cd799439011';

      const response = await request(app)
        .post(`/api/certificates/graduation/${nonExistentId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(404);

      expect(response.body.status).toBe('error');
      expect(response.body.message).toContain('not found');
    });

    it('should require authentication', async () => {
      const response = await request(app)
        .post(`/api/certificates/graduation/${testStudent._id}`)
        .expect(401);

      expect(response.body.status).toBe('error');
    });

    it('should store certificate record in student document', async () => {
      // Set student as graduated
      await Student.findByIdAndUpdate(testStudent._id, { 
        status: 'graduated',
        graduationDate: new Date('2024-06-15')
      });

      await request(app)
        .post(`/api/certificates/graduation/${testStudent._id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .query({ format: 'buffer' })
        .expect(200);

      const updatedStudent = await Student.findById(testStudent._id);
      expect(updatedStudent.certificates).toBeDefined();
      expect(updatedStudent.certificates.length).toBeGreaterThan(0);
      
      const certificate = updatedStudent.certificates[0];
      expect(certificate.type).toBe('graduation');
      expect(certificate.verificationCode).toBeDefined();
      expect(certificate.issuedBy.toString()).toBe(adminUser._id.toString());
    });
  });

  describe('POST /api/certificates/transcript/:studentId', () => {
    beforeEach(async () => {
      // Create enrollment with grade
      await Enrollment.create({
        student: testStudent._id,
        course: testCourse._id,
        semester: {
          name: 'Fall',
          year: 2024
        },
        status: 'completed',
        finalGrade: {
          letter: 'A',
          points: 4.0,
          percentage: 95
        }
      });
    });

    it('should generate transcript for any student status', async () => {
      const response = await request(app)
        .post(`/api/certificates/transcript/${testStudent._id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .query({ format: 'buffer', language: 'en' })
        .expect(200);

      expect(response.body.status).toBe('success');
      expect(response.body.data.pdf).toBeDefined();
      expect(response.body.data.verificationCode).toBeDefined();
    });

    it('should include course information in transcript', async () => {
      const response = await request(app)
        .post(`/api/certificates/transcript/${testStudent._id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .query({ format: 'buffer' })
        .expect(200);

      expect(response.body.status).toBe('success');
      expect(response.body.data.pdf).toBeDefined();
    });

    it('should allow student to generate their own transcript', async () => {
      const response = await request(app)
        .post(`/api/certificates/transcript/${testStudent._id}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .query({ format: 'buffer' })
        .expect(200);

      expect(response.body.status).toBe('success');
    });

    it('should not allow student to generate other student\'s transcript', async () => {
      // Create another student
      const anotherUser = await createTestUser({
        email: 'another2@university.edu',
        role: 'student'
      });

      const anotherStudent = await Student.create({
        studentId: 'STU789013',
        userId: anotherUser._id,
        department: testDepartment._id,
        faculty: testFaculty._id,
        program: testDepartment._id,
        academicYear: '2024-2025'
      });

      const response = await request(app)
        .post(`/api/certificates/transcript/${anotherStudent._id}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(403);

      expect(response.body.status).toBe('error');
    });

    it('should generate Arabic transcript when language is ar', async () => {
      const response = await request(app)
        .post(`/api/certificates/transcript/${testStudent._id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .query({ format: 'buffer', language: 'ar' })
        .expect(200);

      expect(response.body.status).toBe('success');
      expect(response.body.data.pdf).toBeDefined();
    });

    it('should store transcript record in student document', async () => {
      await request(app)
        .post(`/api/certificates/transcript/${testStudent._id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .query({ format: 'buffer' })
        .expect(200);

      const updatedStudent = await Student.findById(testStudent._id);
      expect(updatedStudent.transcripts).toBeDefined();
      expect(updatedStudent.transcripts.length).toBeGreaterThan(0);
      
      const transcript = updatedStudent.transcripts[0];
      expect(transcript.type).toBe('transcript');
      expect(transcript.verificationCode).toBeDefined();
      expect(transcript.issuedBy.toString()).toBe(adminUser._id.toString());
    });
  });

  describe('POST /api/certificates/enrollment/:studentId', () => {
    it('should generate enrollment certificate for active student', async () => {
      const response = await request(app)
        .post(`/api/certificates/enrollment/${testStudent._id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .query({ format: 'buffer', language: 'en' })
        .expect(200);

      expect(response.body.status).toBe('success');
      expect(response.body.data.pdf).toBeDefined();
      expect(response.body.data.verificationCode).toBeDefined();
    });

    it('should allow student to generate their own enrollment certificate', async () => {
      const response = await request(app)
        .post(`/api/certificates/enrollment/${testStudent._id}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .query({ format: 'buffer' })
        .expect(200);

      expect(response.body.status).toBe('success');
    });

    it('should generate Arabic enrollment certificate', async () => {
      const response = await request(app)
        .post(`/api/certificates/enrollment/${testStudent._id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .query({ format: 'buffer', language: 'ar' })
        .expect(200);

      expect(response.body.status).toBe('success');
      expect(response.body.data.pdf).toBeDefined();
    });

    it('should include current semester information', async () => {
      const response = await request(app)
        .post(`/api/certificates/enrollment/${testStudent._id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .query({ format: 'buffer' })
        .expect(200);

      expect(response.body.status).toBe('success');
    });

    it('should not allow enrollment certificate for withdrawn student', async () => {
      // Set student as withdrawn
      await Student.findByIdAndUpdate(testStudent._id, { status: 'withdrawn' });

      const response = await request(app)
        .post(`/api/certificates/enrollment/${testStudent._id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(400);

      expect(response.body.status).toBe('error');
      expect(response.body.message).toContain('not currently enrolled');
    });
  });

  describe('GET /api/certificates/verify/:verificationCode', () => {
    let verificationCode;

    beforeEach(async () => {
      // Set student as graduated and generate certificate
      await Student.findByIdAndUpdate(testStudent._id, { 
        status: 'graduated',
        graduationDate: new Date('2024-06-15')
      });

      const response = await request(app)
        .post(`/api/certificates/graduation/${testStudent._id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .query({ format: 'buffer' })
        .expect(200);

      verificationCode = response.body.data.verificationCode;
    });

    it('should verify valid certificate', async () => {
      const response = await request(app)
        .get(`/api/certificates/verify/${verificationCode}`)
        .expect(200);

      expect(response.body.status).toBe('success');
      expect(response.body.data.certificate).toBeDefined();
      expect(response.body.data.certificate.type).toBe('graduation');
      expect(response.body.data.certificate.studentInfo).toBeDefined();
    });

    it('should return 404 for invalid verification code', async () => {
      const invalidCode = 'INVALID123456789012345678901234';

      const response = await request(app)
        .get(`/api/certificates/verify/${invalidCode}`)
        .expect(404);

      expect(response.body.status).toBe('error');
      expect(response.body.message).toContain('not found');
    });

    it('should not require authentication for verification', async () => {
      const response = await request(app)
        .get(`/api/certificates/verify/${verificationCode}`)
        .expect(200);

      expect(response.body.status).toBe('success');
    });

    it('should include student information in verification response', async () => {
      const response = await request(app)
        .get(`/api/certificates/verify/${verificationCode}`)
        .expect(200);

      expect(response.body.data.certificate.studentInfo).toBeDefined();
      expect(response.body.data.certificate.studentInfo.studentId).toBe('STU123456');
      expect(response.body.data.certificate.studentInfo.fullName).toBeDefined();
    });
  });

  describe('GET /api/certificates/student/:studentId', () => {
    beforeEach(async () => {
      // Generate some certificates
      await Student.findByIdAndUpdate(testStudent._id, { 
        status: 'graduated',
        graduationDate: new Date('2024-06-15')
      });

      // Generate graduation certificate
      await request(app)
        .post(`/api/certificates/graduation/${testStudent._id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .query({ format: 'buffer' });

      // Generate transcript
      await request(app)
        .post(`/api/certificates/transcript/${testStudent._id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .query({ format: 'buffer' });
    });

    it('should list all certificates for student (admin)', async () => {
      const response = await request(app)
        .get(`/api/certificates/student/${testStudent._id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body.status).toBe('success');
      expect(response.body.data.certificates).toBeDefined();
      expect(response.body.data.certificates.length).toBeGreaterThanOrEqual(2);
    });

    it('should allow student to view their own certificates', async () => {
      const response = await request(app)
        .get(`/api/certificates/student/${testStudent._id}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      expect(response.body.status).toBe('success');
      expect(response.body.data.certificates).toBeDefined();
    });

    it('should not allow student to view other student\'s certificates', async () => {
      // Create another student
      const anotherUser = await createTestUser({
        email: 'another3@university.edu',
        role: 'student'
      });

      const anotherStudent = await Student.create({
        studentId: 'STU789014',
        userId: anotherUser._id,
        department: testDepartment._id,
        faculty: testFaculty._id,
        program: testDepartment._id,
        academicYear: '2024-2025'
      });

      const response = await request(app)
        .get(`/api/certificates/student/${anotherStudent._id}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(403);

      expect(response.body.status).toBe('error');
    });

    it('should include certificate details', async () => {
      const response = await request(app)
        .get(`/api/certificates/student/${testStudent._id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      const certificates = response.body.data.certificates;
      expect(certificates.length).toBeGreaterThan(0);
      
      const certificate = certificates[0];
      expect(certificate.type).toBeDefined();
      expect(certificate.verificationCode).toBeDefined();
      expect(certificate.issuedAt).toBeDefined();
    });
  });

  describe('Authorization and Permissions', () => {
    it('should allow admin to generate any certificate', async () => {
      await Student.findByIdAndUpdate(testStudent._id, { status: 'graduated' });

      const response = await request(app)
        .post(`/api/certificates/graduation/${testStudent._id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .query({ format: 'buffer' })
        .expect(200);

      expect(response.body.status).toBe('success');
    });

    it('should allow staff to generate certificates', async () => {
      // Create staff user
      const staffUser = await createTestUser({
        email: 'staff@university.edu',
        role: 'staff'
      });
      const staffToken = generateAuthToken(staffUser);

      await Student.findByIdAndUpdate(testStudent._id, { status: 'graduated' });

      const response = await request(app)
        .post(`/api/certificates/graduation/${testStudent._id}`)
        .set('Authorization', `Bearer ${staffToken}`)
        .query({ format: 'buffer' })
        .expect(200);

      expect(response.body.status).toBe('success');
    });

    it('should not allow instructor to generate certificates for random students', async () => {
      // Create instructor user
      const instructorUser = await createTestUser({
        email: 'instructor@university.edu',
        role: 'instructor'
      });
      const instructorToken = generateAuthToken(instructorUser);

      await Student.findByIdAndUpdate(testStudent._id, { status: 'graduated' });

      const response = await request(app)
        .post(`/api/certificates/graduation/${testStudent._id}`)
        .set('Authorization', `Bearer ${instructorToken}`)
        .expect(403);

      expect(response.body.status).toBe('error');
    });
  });

  describe('Error Handling', () => {
    it('should handle invalid student ID format', async () => {
      const response = await request(app)
        .post('/api/certificates/graduation/invalid-id')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(400);

      expect(response.body.status).toBe('error');
    });

    it('should handle missing authorization header', async () => {
      const response = await request(app)
        .post(`/api/certificates/graduation/${testStudent._id}`)
        .expect(401);

      expect(response.body.status).toBe('error');
    });

    it('should handle expired or invalid tokens', async () => {
      const expiredToken = jwt.sign(
        { userId: testUser._id },
        process.env.JWT_SECRET || 'test-secret',
        { expiresIn: '-1h' }
      );

      const response = await request(app)
        .post(`/api/certificates/graduation/${testStudent._id}`)
        .set('Authorization', `Bearer ${expiredToken}`)
        .expect(401);

      expect(response.body.status).toBe('error');
    });
  });

  describe('PDF Generation', () => {
    it('should generate PDF with proper content type for download', async () => {
      await Student.findByIdAndUpdate(testStudent._id, { 
        status: 'graduated',
        graduationDate: new Date('2024-06-15')
      });

      const response = await request(app)
        .post(`/api/certificates/graduation/${testStudent._id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .query({ format: 'pdf' })
        .expect(200);

      expect(response.headers['content-type']).toBe('application/pdf');
      expect(response.headers['content-disposition']).toContain('attachment');
      expect(response.headers['content-disposition']).toContain('graduation-certificate');
    });

    it('should return base64 PDF when format is buffer', async () => {
      await Student.findByIdAndUpdate(testStudent._id, { 
        status: 'graduated',
        graduationDate: new Date('2024-06-15')
      });

      const response = await request(app)
        .post(`/api/certificates/graduation/${testStudent._id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .query({ format: 'buffer' })
        .expect(200);

      expect(response.body.data.pdf).toBeDefined();
      expect(typeof response.body.data.pdf).toBe('string');
      // Base64 string should be divisible by 4
      expect(response.body.data.pdf.length % 4).toBe(0);
    });
  });
});