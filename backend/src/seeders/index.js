const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

// Import models
const User = require('../models/User');
const Student = require('../models/Student');
const Instructor = require('../models/Instructor');
const Staff = require('../models/Staff');
const Faculty = require('../models/Faculty');
const Department = require('../models/Department');
const Course = require('../models/Course');
const Enrollment = require('../models/Enrollment');
const Tuition = require('../models/Tuition');
const Payroll = require('../models/Payroll');

// Sample data
const sampleData = {
  faculties: [
    { facultyCode: 'ENG', name: 'Faculty of Engineering', nameAr: 'كلية الهندسة' },
    { facultyCode: 'SCI', name: 'Faculty of Science', nameAr: 'كلية العلوم' },
    { facultyCode: 'BUS', name: 'Faculty of Business', nameAr: 'كلية الأعمال' }
  ],
  
  departments: [
    { departmentCode: 'CS', name: 'Computer Science', nameAr: 'علوم الحاسوب' },
    { departmentCode: 'MATH', name: 'Mathematics', nameAr: 'الرياضيات' },
    { departmentCode: 'PHYS', name: 'Physics', nameAr: 'الفيزياء' },
    { departmentCode: 'BA', name: 'Business Administration', nameAr: 'إدارة الأعمال' }
  ],
  
  courses: [
    { courseCode: 'CS101', title: 'Introduction to Programming', titleAr: 'مقدمة في البرمجة', creditHours: 3 },
    { courseCode: 'MATH201', title: 'Calculus I', titleAr: 'التفاضل والتكامل الأول', creditHours: 3 },
    { courseCode: 'PHYS101', title: 'General Physics', titleAr: 'الفيزياء العامة', creditHours: 4 },
    { courseCode: 'BA101', title: 'Principles of Management', titleAr: 'مبادئ الإدارة', creditHours: 3 }
  ],
  
  users: [
    { firstName: 'Ahmed', lastName: 'Ali', email: 'admin@university.edu', role: 'admin', password: 'admin123' },
    { firstName: 'Sarah', lastName: 'Hassan', email: 'staff@university.edu', role: 'staff', password: 'staff123' },
    { firstName: 'Mohammad', lastName: 'Omar', email: 'instructor@university.edu', role: 'instructor', password: 'instructor123' },
    { firstName: 'Fatima', lastName: 'Ahmad', email: 'student@university.edu', role: 'student', password: 'student123' }
  ]
};

async function connectDB() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/sis_university');
    console.log('Connected to MongoDB');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
}

async function clearDatabase() {
  const collections = await mongoose.connection.db.listCollections().toArray();
  for (const collection of collections) {
    await mongoose.connection.db.dropCollection(collection.name);
  }
  console.log('Database cleared');
}

async function seedData() {
  try {
    console.log('Starting database seeding...');
    
    // Connect to database
    await connectDB();
    
    // Clear existing data
    await clearDatabase();
    
    // Create faculties
    const faculties = await Faculty.insertMany(sampleData.faculties);
    console.log(`Created ${faculties.length} faculties`);
    
    // Create departments
    const departmentsWithFaculty = sampleData.departments.map((dept, index) => ({
      ...dept,
      faculty: faculties[index % faculties.length]._id
    }));
    const departments = await Department.insertMany(departmentsWithFaculty);
    console.log(`Created ${departments.length} departments`);
    
    // Create users
    const hashedUsers = await Promise.all(
      sampleData.users.map(async (user) => ({
        ...user,
        password: await bcrypt.hash(user.password, 12)
      }))
    );
    const users = await User.insertMany(hashedUsers);
    console.log(`Created ${users.length} users`);
    
    // Create courses
    const coursesWithDept = sampleData.courses.map((course, index) => ({
      ...course,
      department: departments[index % departments.length]._id,
      faculty: departments[index % departments.length].faculty,
      description: `Course description for ${course.title}`
    }));
    const courses = await Course.insertMany(coursesWithDept);
    console.log(`Created ${courses.length} courses`);
    
    // Create 50 more students
    const studentUsers = [];
    for (let i = 1; i <= 50; i++) {
      studentUsers.push({
        firstName: `Student${i}`,
        lastName: `Test`,
        firstNameAr: `طالب${i}`,
        lastNameAr: `تجريبي`,
        email: `student${i}@university.edu`,
        role: 'student',
        password: await bcrypt.hash('student123', 12),
        language: i % 2 === 0 ? 'ar' : 'en'
      });
    }
    const createdStudentUsers = await User.insertMany(studentUsers);
    
    // Create student profiles
    const studentProfiles = createdStudentUsers.map((user, index) => ({
      studentId: `STU${String(index + 1).padStart(6, '0')}`,
      userId: user._id,
      department: departments[index % departments.length]._id,
      faculty: departments[index % departments.length].faculty,
      academicYear: '2024-2025',
      admissionDate: new Date('2024-09-01')
    }));
    const students = await Student.insertMany(studentProfiles);
    console.log(`Created ${students.length} students`);
    
    console.log('Database seeding completed successfully!');
    console.log('\nDemo Accounts:');
    console.log('Admin: admin@university.edu / admin123');
    console.log('Staff: staff@university.edu / staff123');
    console.log('Instructor: instructor@university.edu / instructor123');
    console.log('Student: student@university.edu / student123');
    
  } catch (error) {
    console.error('Seeding error:', error);
  } finally {
    await mongoose.connection.close();
  }
}

// Run seeder
if (require.main === module) {
  seedData();
}

module.exports = seedData;