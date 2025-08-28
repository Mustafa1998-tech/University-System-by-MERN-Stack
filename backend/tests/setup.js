const { MongoMemoryServer } = require('mongodb-memory-server');
const mongoose = require('mongoose');

let mongoServer;

// Setup before all tests
beforeAll(async () => {
  // Start in-memory MongoDB instance
  mongoServer = await MongoMemoryServer.create();
  const mongoUri = mongoServer.getUri();
  
  // Connect to the in-memory database
  await mongoose.connect(mongoUri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
});

// Clean up after each test
afterEach(async () => {
  // Clear all collections
  const collections = mongoose.connection.collections;
  for (const key in collections) {
    await collections[key].deleteMany({});
  }
});

// Cleanup after all tests
afterAll(async () => {
  // Disconnect from database
  await mongoose.disconnect();
  
  // Stop the in-memory MongoDB instance
  if (mongoServer) {
    await mongoServer.stop();
  }
});

// Global test timeout
jest.setTimeout(30000);

// Mock console methods in test environment
if (process.env.NODE_ENV === 'test') {
  global.console = {
    ...console,
    // Suppress console.log in tests, but keep console.error and console.warn
    log: jest.fn(),
    debug: jest.fn(),
    info: jest.fn(),
    warn: console.warn,
    error: console.error,
  };
}

// Mock external services
jest.mock('nodemailer', () => ({
  createTransport: jest.fn(() => ({
    sendMail: jest.fn().mockResolvedValue({
      messageId: 'test-message-id',
      envelope: { from: 'test@test.com', to: ['recipient@test.com'] },
      accepted: ['recipient@test.com'],
      rejected: [],
    }),
  })),
}));

jest.mock('twilio', () => ({
  __esModule: true,
  default: jest.fn(() => ({
    messages: {
      create: jest.fn().mockResolvedValue({
        sid: 'test-sms-sid',
        status: 'sent',
      }),
    },
  })),
}));

// Helper functions for tests
global.createTestUser = async (userData = {}) => {
  const User = require('../src/models/User');
  const bcrypt = require('bcryptjs');
  
  const defaultUser = {
    name: 'Test User',
    nameEn: 'Test User',
    email: 'test@university.edu',
    password: await bcrypt.hash('password123', 12),
    role: 'student',
    isEmailVerified: true,
    ...userData,
  };
  
  return await User.create(defaultUser);
};

global.createTestCourse = async (courseData = {}) => {
  const Course = require('../src/models/Course');
  
  const defaultCourse = {
    code: 'CS101',
    name: 'Introduction to Computer Science',
    nameEn: 'Introduction to Computer Science',
    credits: 3,
    description: 'Basic computer science concepts',
    descriptionEn: 'Basic computer science concepts',
    semester: 'Fall 2024',
    isActive: true,
    ...courseData,
  };
  
  return await Course.create(defaultCourse);
};

global.generateAuthToken = (user) => {
  const jwt = require('jsonwebtoken');
  return jwt.sign(
    { 
      userId: user._id,
      email: user.email,
      role: user.role 
    },
    process.env.JWT_SECRET || 'test-secret',
    { expiresIn: '1h' }
  );
};

// Test data generators
global.generateTestData = {
  student: (overrides = {}) => ({
    name: 'أحمد محمد علي',
    nameEn: 'Ahmed Mohammed Ali',
    email: 'ahmed@university.edu',
    password: 'password123',
    role: 'student',
    studentId: 'STU123456',
    dateOfBirth: new Date('1999-05-15'),
    gender: 'male',
    nationality: 'Saudi',
    phone: '+966501234567',
    address: {
      street: 'شارع الملك فهد',
      city: 'الرياض',
      country: 'السعودية',
    },
    academic: {
      faculty: 'كلية الهندسة',
      department: 'علوم الحاسوب',
      program: 'بكالوريوس علوم الحاسوب',
      level: 'السنة الثالثة',
      gpa: 3.75,
      totalCredits: 120,
      completedCredits: 89,
    },
    ...overrides,
  }),
  
  instructor: (overrides = {}) => ({
    name: 'د. محمد أحمد الشريف',
    nameEn: 'Dr. Mohammed Ahmed Al-Sharif',
    email: 'dr.mohammed@university.edu',
    password: 'password123',
    role: 'instructor',
    employeeId: 'EMP001',
    department: 'علوم الحاسوب',
    position: 'أستاذ مساعد',
    specialization: 'الذكاء الاصطناعي',
    phone: '+966501234568',
    ...overrides,
  }),
  
  course: (overrides = {}) => ({
    code: 'CS301',
    name: 'البرمجة المتقدمة',
    nameEn: 'Advanced Programming',
    credits: 3,
    description: 'مقرر يتناول مفاهيم البرمجة المتقدمة',
    descriptionEn: 'Course covering advanced programming concepts',
    semester: 'Fall 2024',
    department: 'علوم الحاسوب',
    prerequisite: ['CS201'],
    maxStudents: 45,
    isActive: true,
    ...overrides,
  }),
  
  assignment: (overrides = {}) => ({
    title: 'مشروع عملي',
    titleEn: 'Practical Project',
    description: 'تطوير تطبيق ويب باستخدام React',
    descriptionEn: 'Develop a web application using React',
    type: 'project',
    maxGrade: 100,
    weight: 0.3,
    dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
    isActive: true,
    ...overrides,
  }),
};

module.exports = {};