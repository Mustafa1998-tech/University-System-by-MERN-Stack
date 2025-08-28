const request = require('supertest');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');

// Test Database Helper
class TestDatabase {
  static async clearAllCollections() {
    const collections = mongoose.connection.collections;
    for (const key in collections) {
      await collections[key].deleteMany({});
    }
  }

  static async resetSequences() {
    // Reset any sequence counters if using them
    const collections = await mongoose.connection.db.listCollections().toArray();
    for (const collection of collections) {
      if (collection.name.includes('counter')) {
        await mongoose.connection.db.collection(collection.name).deleteMany({});
      }
    }
  }

  static async createIndexes() {
    // Ensure indexes are created for testing
    const collections = mongoose.connection.collections;
    for (const key in collections) {
      try {
        await collections[key].createIndexes();
      } catch (error) {
        // Indexes might already exist
        console.log(`Indexes for ${key} already exist or error occurred:`, error.message);
      }
    }
  }
}

// Authentication Helper
class AuthHelper {
  static generateValidToken(user) {
    return jwt.sign(
      {
        userId: user._id,
        email: user.email,
        role: user.role
      },
      process.env.JWT_SECRET || 'test-secret',
      { expiresIn: '1h' }
    );
  }

  static generateExpiredToken(user) {
    return jwt.sign(
      {
        userId: user._id,
        email: user.email,
        role: user.role
      },
      process.env.JWT_SECRET || 'test-secret',
      { expiresIn: '-1h' }
    );
  }

  static generateInvalidToken() {
    return 'invalid.token.here';
  }

  static async loginUser(app, credentials) {
    const response = await request(app)
      .post('/api/auth/login')
      .send(credentials);
    
    return {
      token: response.body.data?.accessToken,
      user: response.body.data?.user,
      refreshToken: response.body.data?.refreshToken
    };
  }
}

// Request Helper
class RequestHelper {
  static async makeAuthenticatedRequest(app, method, url, token, data = {}) {
    const req = request(app)[method.toLowerCase()](url);
    
    if (token) {
      req.set('Authorization', `Bearer ${token}`);
    }
    
    if (data && Object.keys(data).length > 0) {
      req.send(data);
    }
    
    return req;
  }

  static async uploadFile(app, url, token, fieldName, filePath, additionalFields = {}) {
    const req = request(app)
      .post(url)
      .set('Authorization', `Bearer ${token}`);
    
    if (filePath) {
      req.attach(fieldName, filePath);
    }
    
    Object.keys(additionalFields).forEach(key => {
      req.field(key, additionalFields[key]);
    });
    
    return req;
  }
}

// Data Builder
class DataBuilder {
  static buildUser(overrides = {}) {
    return {
      firstName: 'Test',
      lastName: 'User',
      firstNameAr: 'تست',
      lastNameAr: 'يوزر',
      email: `test${Date.now()}@university.edu`,
      password: 'password123',
      role: 'student',
      dateOfBirth: new Date('1995-01-01'),
      gender: 'male',
      nationality: 'Saudi',
      phone: '+966501234567',
      isEmailVerified: true,
      isActive: true,
      ...overrides
    };
  }

  static buildStudent(userId, departmentId, facultyId, overrides = {}) {
    return {
      studentId: `STU${Date.now()}`,
      userId,
      department: departmentId,
      faculty: facultyId,
      program: departmentId, // Using department as program for simplicity
      academicYear: '2024-2025',
      admissionDate: new Date('2024-09-01'),
      currentSemester: 1,
      status: 'active',
      classification: 'freshman',
      gpa: {
        current: 0,
        cumulative: 0
      },
      totalCreditsEarned: 0,
      totalCreditsRequired: 120,
      ...overrides
    };
  }

  static buildCourse(departmentId, facultyId, overrides = {}) {
    return {
      courseCode: `CS${Date.now().toString().slice(-3)}`,
      title: 'Test Course',
      titleAr: 'مقرر تجريبي',
      description: 'This is a test course',
      descriptionAr: 'هذا مقرر تجريبي',
      department: departmentId,
      faculty: facultyId,
      creditHours: 3,
      level: 'undergraduate',
      courseType: 'core',
      status: 'active',
      ...overrides
    };
  }

  static buildDepartment(facultyId, overrides = {}) {
    return {
      name: 'قسم علوم الحاسوب',
      nameEn: 'Computer Science Department',
      code: `CS${Date.now().toString().slice(-2)}`,
      faculty: facultyId,
      description: 'قسم علوم الحاسوب',
      descriptionEn: 'Computer Science Department',
      ...overrides
    };
  }

  static buildFaculty(overrides = {}) {
    return {
      name: 'كلية الهندسة',
      nameEn: 'College of Engineering',
      code: `ENG${Date.now().toString().slice(-2)}`,
      description: 'كلية الهندسة',
      descriptionEn: 'College of Engineering',
      ...overrides
    };
  }

  static buildEnrollment(studentId, courseId, overrides = {}) {
    return {
      student: studentId,
      course: courseId,
      semester: {
        name: 'Fall',
        year: 2024
      },
      status: 'enrolled',
      enrollmentDate: new Date(),
      ...overrides
    };
  }
}

// Assertion Helper
class AssertionHelper {
  static expectValidResponse(response, expectedStatus = 200) {
    expect(response.status).toBe(expectedStatus);
    expect(response.body).toBeDefined();
    expect(response.body.status).toBeDefined();
  }

  static expectSuccessResponse(response, expectedStatus = 200) {
    this.expectValidResponse(response, expectedStatus);
    expect(response.body.status).toBe('success');
    expect(response.body.data).toBeDefined();
  }

  static expectErrorResponse(response, expectedStatus = 400) {
    this.expectValidResponse(response, expectedStatus);
    expect(response.body.status).toBe('error');
    expect(response.body.message).toBeDefined();
  }

  static expectValidationError(response) {
    this.expectErrorResponse(response, 400);
    expect(response.body.message).toMatch(/validation|required|invalid/i);
  }

  static expectAuthenticationError(response) {
    this.expectErrorResponse(response, 401);
    expect(response.body.message).toMatch(/unauthorized|authentication|token/i);
  }

  static expectAuthorizationError(response) {
    this.expectErrorResponse(response, 403);
    expect(response.body.message).toMatch(/forbidden|authorized|permission/i);
  }

  static expectNotFoundError(response) {
    this.expectErrorResponse(response, 404);
    expect(response.body.message).toMatch(/not found/i);
  }
}

// Mock Helper
class MockHelper {
  static mockEmailService() {
    const mockSendMail = jest.fn().mockResolvedValue({
      messageId: 'test-message-id',
      envelope: { from: 'test@test.com', to: ['recipient@test.com'] },
      accepted: ['recipient@test.com'],
      rejected: []
    });

    return {
      sendMail: mockSendMail,
      mockSendMail
    };
  }

  static mockSMSService() {
    const mockSendSMS = jest.fn().mockResolvedValue({
      sid: 'test-sms-sid',
      status: 'sent'
    });

    return {
      sendSMS: mockSendSMS,
      mockSendSMS
    };
  }

  static mockFileUpload() {
    const mockUpload = jest.fn().mockResolvedValue({
      filename: 'test-file.pdf',
      path: '/uploads/test-file.pdf',
      size: 1024
    });

    return {
      upload: mockUpload,
      mockUpload
    };
  }
}

// Performance Helper
class PerformanceHelper {
  static async measureExecutionTime(fn) {
    const start = Date.now();
    const result = await fn();
    const end = Date.now();
    return {
      result,
      executionTime: end - start
    };
  }

  static expectResponseTime(response, maxTime = 1000) {
    const responseTime = parseInt(response.headers['x-response-time']) || 0;
    expect(responseTime).toBeLessThan(maxTime);
  }
}

module.exports = {
  TestDatabase,
  AuthHelper,
  RequestHelper,
  DataBuilder,
  AssertionHelper,
  MockHelper,
  PerformanceHelper
};