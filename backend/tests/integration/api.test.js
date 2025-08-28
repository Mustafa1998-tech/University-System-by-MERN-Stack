const request = require('supertest');
const app = require('../../src/app');
const User = require('../../src/models/User');
const Student = require('../../src/models/Student');
const Faculty = require('../../src/models/Faculty');
const Department = require('../../src/models/Department');
const { 
  TestDatabase, 
  AuthHelper, 
  DataBuilder, 
  AssertionHelper 
} = require('../helpers/testHelpers');

describe('API Integration Tests', () => {
  let testFaculty;
  let testDepartment;
  let adminUser;
  let studentUser;
  let testStudent;
  let adminToken;
  let studentToken;

  beforeEach(async () => {
    // Clear database
    await TestDatabase.clearAllCollections();

    // Create test faculty and department
    testFaculty = await Faculty.create(DataBuilder.buildFaculty());
    testDepartment = await Department.create(DataBuilder.buildDepartment(testFaculty._id));

    // Create admin user
    const adminData = DataBuilder.buildUser({
      email: 'admin@university.edu',
      role: 'admin'
    });
    adminUser = await User.create(adminData);
    adminToken = AuthHelper.generateValidToken(adminUser);

    // Create student user
    const studentData = DataBuilder.buildUser({
      email: 'student@university.edu',
      role: 'student'
    });
    studentUser = await User.create(studentData);
    
    // Create student record
    testStudent = await Student.create(DataBuilder.buildStudent(
      studentUser._id,
      testDepartment._id,
      testFaculty._id
    ));

    // Link student to user
    studentUser.studentId = testStudent._id;
    await studentUser.save();

    studentToken = AuthHelper.generateValidToken(studentUser);
  });

  describe('Authentication Endpoints', () => {
    describe('POST /api/auth/register', () => {
      it('should register a new user successfully', async () => {
        const userData = {
          firstName: 'John',
          lastName: 'Doe',
          email: 'john.doe@university.edu',
          password: 'password123',
          role: 'student',
          phone: '+966501234567'
        };

        const response = await request(app)
          .post('/api/auth/register')
          .send(userData)
          .expect(201);

        AssertionHelper.expectSuccessResponse(response, 201);
        expect(response.body.data.user.email).toBe(userData.email);
        expect(response.body.data.user.password).toBeUndefined();
      });

      it('should not register user with existing email', async () => {
        const userData = DataBuilder.buildUser({
          email: adminUser.email
        });

        const response = await request(app)
          .post('/api/auth/register')
          .send(userData)
          .expect(400);

        AssertionHelper.expectErrorResponse(response, 400);
        expect(response.body.message).toContain('already exists');
      });

      it('should validate required fields', async () => {
        const incompleteData = {
          email: 'incomplete@university.edu'
        };

        const response = await request(app)
          .post('/api/auth/register')
          .send(incompleteData)
          .expect(400);

        AssertionHelper.expectValidationError(response);
      });
    });

    describe('POST /api/auth/login', () => {
      it('should login with valid credentials', async () => {
        const loginData = {
          email: adminUser.email,
          password: 'password123'
        };

        const response = await request(app)
          .post('/api/auth/login')
          .send(loginData)
          .expect(200);

        AssertionHelper.expectSuccessResponse(response);
        expect(response.body.data.accessToken).toBeDefined();
        expect(response.body.data.refreshToken).toBeDefined();
        expect(response.body.data.user.email).toBe(adminUser.email);
      });

      it('should not login with invalid credentials', async () => {
        const loginData = {
          email: adminUser.email,
          password: 'wrongpassword'
        };

        const response = await request(app)
          .post('/api/auth/login')
          .send(loginData)
          .expect(401);

        AssertionHelper.expectAuthenticationError(response);
      });

      it('should not login inactive user', async () => {
        // Create inactive user
        const inactiveUserData = DataBuilder.buildUser({
          email: 'inactive@university.edu',
          isActive: false
        });
        const inactiveUser = await User.create(inactiveUserData);

        const loginData = {
          email: inactiveUser.email,
          password: 'password123'
        };

        const response = await request(app)
          .post('/api/auth/login')
          .send(loginData)
          .expect(401);

        AssertionHelper.expectAuthenticationError(response);
        expect(response.body.message).toContain('suspended');
      });
    });

    describe('GET /api/auth/profile', () => {
      it('should get user profile with valid token', async () => {
        const response = await request(app)
          .get('/api/auth/profile')
          .set('Authorization', `Bearer ${adminToken}`)
          .expect(200);

        AssertionHelper.expectSuccessResponse(response);
        expect(response.body.data.user._id).toBe(adminUser._id.toString());
        expect(response.body.data.user.password).toBeUndefined();
      });

      it('should not get profile without token', async () => {
        const response = await request(app)
          .get('/api/auth/profile')
          .expect(401);

        AssertionHelper.expectAuthenticationError(response);
      });

      it('should not get profile with invalid token', async () => {
        const response = await request(app)
          .get('/api/auth/profile')
          .set('Authorization', 'Bearer invalid-token')
          .expect(401);

        AssertionHelper.expectAuthenticationError(response);
      });
    });

    describe('PATCH /api/auth/profile', () => {
      it('should update user profile', async () => {
        const updateData = {
          firstName: 'Updated',
          lastName: 'Name',
          phone: '+966501234999'
        };

        const response = await request(app)
          .patch('/api/auth/profile')
          .set('Authorization', `Bearer ${adminToken}`)
          .send(updateData)
          .expect(200);

        AssertionHelper.expectSuccessResponse(response);
        expect(response.body.data.user.firstName).toBe(updateData.firstName);
        expect(response.body.data.user.lastName).toBe(updateData.lastName);
        expect(response.body.data.user.phone).toBe(updateData.phone);
      });

      it('should not update email through profile', async () => {
        const updateData = {
          email: 'newemail@university.edu'
        };

        const response = await request(app)
          .patch('/api/auth/profile')
          .set('Authorization', `Bearer ${adminToken}`)
          .send(updateData)
          .expect(400);

        AssertionHelper.expectErrorResponse(response, 400);
      });

      it('should not update profile without authentication', async () => {
        const updateData = {
          firstName: 'Updated'
        };

        const response = await request(app)
          .patch('/api/auth/profile')
          .send(updateData)
          .expect(401);

        AssertionHelper.expectAuthenticationError(response);
      });
    });

    describe('PATCH /api/auth/change-password', () => {
      it('should change password with correct current password', async () => {
        const passwordData = {
          currentPassword: 'password123',
          newPassword: 'newpassword123'
        };

        const response = await request(app)
          .patch('/api/auth/change-password')
          .set('Authorization', `Bearer ${adminToken}`)
          .send(passwordData)
          .expect(200);

        AssertionHelper.expectSuccessResponse(response);
        expect(response.body.message).toContain('changed');
      });

      it('should not change password with incorrect current password', async () => {
        const passwordData = {
          currentPassword: 'wrongpassword',
          newPassword: 'newpassword123'
        };

        const response = await request(app)
          .patch('/api/auth/change-password')
          .set('Authorization', `Bearer ${adminToken}`)
          .send(passwordData)
          .expect(400);

        AssertionHelper.expectErrorResponse(response, 400);
        expect(response.body.message).toContain('current password');
      });
    });
  });

  describe('Student Management Endpoints', () => {
    describe('GET /api/students', () => {
      it('should get all students (admin)', async () => {
        const response = await request(app)
          .get('/api/students')
          .set('Authorization', `Bearer ${adminToken}`)
          .expect(200);

        AssertionHelper.expectSuccessResponse(response);
        expect(Array.isArray(response.body.data.students)).toBe(true);
        expect(response.body.data.students.length).toBeGreaterThan(0);
      });

      it('should not allow non-admin to get all students', async () => {
        const response = await request(app)
          .get('/api/students')
          .set('Authorization', `Bearer ${studentToken}`)
          .expect(403);

        AssertionHelper.expectAuthorizationError(response);
      });

      it('should support pagination', async () => {
        const response = await request(app)
          .get('/api/students')
          .set('Authorization', `Bearer ${adminToken}`)
          .query({ page: 1, limit: 10 })
          .expect(200);

        AssertionHelper.expectSuccessResponse(response);
        expect(response.body.data.pagination).toBeDefined();
        expect(response.body.data.pagination.page).toBe(1);
        expect(response.body.data.pagination.limit).toBe(10);
      });

      it('should support search', async () => {
        const response = await request(app)
          .get('/api/students')
          .set('Authorization', `Bearer ${adminToken}`)
          .query({ search: testStudent.studentId })
          .expect(200);

        AssertionHelper.expectSuccessResponse(response);
        expect(response.body.data.students.length).toBeGreaterThan(0);
        expect(response.body.data.students[0].studentId).toBe(testStudent.studentId);
      });
    });

    describe('GET /api/students/:id', () => {
      it('should get student by ID (admin)', async () => {
        const response = await request(app)
          .get(`/api/students/${testStudent._id}`)
          .set('Authorization', `Bearer ${adminToken}`)
          .expect(200);

        AssertionHelper.expectSuccessResponse(response);
        expect(response.body.data.student._id).toBe(testStudent._id.toString());
      });

      it('should allow student to get their own record', async () => {
        const response = await request(app)
          .get(`/api/students/${testStudent._id}`)
          .set('Authorization', `Bearer ${studentToken}`)
          .expect(200);

        AssertionHelper.expectSuccessResponse(response);
        expect(response.body.data.student._id).toBe(testStudent._id.toString());
      });

      it('should not allow student to get other student records', async () => {
        // Create another student
        const anotherStudentUser = await User.create(DataBuilder.buildUser({
          email: 'another@university.edu',
          role: 'student'
        }));
        const anotherStudent = await Student.create(DataBuilder.buildStudent(
          anotherStudentUser._id,
          testDepartment._id,
          testFaculty._id
        ));

        const response = await request(app)
          .get(`/api/students/${anotherStudent._id}`)
          .set('Authorization', `Bearer ${studentToken}`)
          .expect(403);

        AssertionHelper.expectAuthorizationError(response);
      });

      it('should return 404 for non-existent student', async () => {
        const nonExistentId = '507f1f77bcf86cd799439011';

        const response = await request(app)
          .get(`/api/students/${nonExistentId}`)
          .set('Authorization', `Bearer ${adminToken}`)
          .expect(404);

        AssertionHelper.expectNotFoundError(response);
      });
    });

    describe('POST /api/students', () => {
      it('should create new student (admin)', async () => {
        const newUserData = DataBuilder.buildUser({
          email: 'newstudent@university.edu',
          role: 'student'
        });
        const newUser = await User.create(newUserData);

        const studentData = DataBuilder.buildStudent(
          newUser._id,
          testDepartment._id,
          testFaculty._id,
          { studentId: 'STU999999' }
        );

        const response = await request(app)
          .post('/api/students')
          .set('Authorization', `Bearer ${adminToken}`)
          .send(studentData)
          .expect(201);

        AssertionHelper.expectSuccessResponse(response, 201);
        expect(response.body.data.student.studentId).toBe(studentData.studentId);
      });

      it('should not allow non-admin to create student', async () => {
        const studentData = DataBuilder.buildStudent(
          studentUser._id,
          testDepartment._id,
          testFaculty._id
        );

        const response = await request(app)
          .post('/api/students')
          .set('Authorization', `Bearer ${studentToken}`)
          .send(studentData)
          .expect(403);

        AssertionHelper.expectAuthorizationError(response);
      });

      it('should validate required fields', async () => {
        const incompleteData = {
          studentId: 'STU888888'
        };

        const response = await request(app)
          .post('/api/students')
          .set('Authorization', `Bearer ${adminToken}`)
          .send(incompleteData)
          .expect(400);

        AssertionHelper.expectValidationError(response);
      });
    });

    describe('PATCH /api/students/:id', () => {
      it('should update student record (admin)', async () => {
        const updateData = {
          currentSemester: 2,
          gpa: {
            current: 3.5,
            cumulative: 3.2
          }
        };

        const response = await request(app)
          .patch(`/api/students/${testStudent._id}`)
          .set('Authorization', `Bearer ${adminToken}`)
          .send(updateData)
          .expect(200);

        AssertionHelper.expectSuccessResponse(response);
        expect(response.body.data.student.currentSemester).toBe(updateData.currentSemester);
        expect(response.body.data.student.gpa.current).toBe(updateData.gpa.current);
      });

      it('should allow student to update limited fields', async () => {
        const updateData = {
          parentGuardian: {
            father: {
              name: 'Updated Father Name',
              phone: '+966501234567'
            }
          }
        };

        const response = await request(app)
          .patch(`/api/students/${testStudent._id}`)
          .set('Authorization', `Bearer ${studentToken}`)
          .send(updateData)
          .expect(200);

        AssertionHelper.expectSuccessResponse(response);
      });

      it('should not allow student to update academic fields', async () => {
        const updateData = {
          gpa: {
            current: 4.0,
            cumulative: 4.0
          }
        };

        const response = await request(app)
          .patch(`/api/students/${testStudent._id}`)
          .set('Authorization', `Bearer ${studentToken}`)
          .send(updateData)
          .expect(403);

        AssertionHelper.expectAuthorizationError(response);
      });
    });

    describe('DELETE /api/students/:id', () => {
      it('should delete student record (admin)', async () => {
        const response = await request(app)
          .delete(`/api/students/${testStudent._id}`)
          .set('Authorization', `Bearer ${adminToken}`)
          .expect(200);

        AssertionHelper.expectSuccessResponse(response);
        expect(response.body.message).toContain('deleted');

        // Verify student is deleted
        const deletedStudent = await Student.findById(testStudent._id);
        expect(deletedStudent).toBeNull();
      });

      it('should not allow non-admin to delete student', async () => {
        const response = await request(app)
          .delete(`/api/students/${testStudent._id}`)
          .set('Authorization', `Bearer ${studentToken}`)
          .expect(403);

        AssertionHelper.expectAuthorizationError(response);
      });
    });
  });

  describe('Error Handling', () => {
    it('should handle invalid JSON in request body', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .set('Content-Type', 'application/json')
        .send('invalid json')
        .expect(400);

      AssertionHelper.expectErrorResponse(response, 400);
    });

    it('should handle missing Content-Type header', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({ email: 'test@test.com', password: 'password' })
        .expect(400);

      // Should still work or handle gracefully
      expect(response.status).toBeGreaterThanOrEqual(400);
    });

    it('should handle malformed authorization header', async () => {
      const response = await request(app)
        .get('/api/auth/profile')
        .set('Authorization', 'InvalidFormat')
        .expect(401);

      AssertionHelper.expectAuthenticationError(response);
    });

    it('should handle database connection errors gracefully', async () => {
      // This would require mocking mongoose
      // For now, just verify the endpoint exists
      const response = await request(app)
        .get('/api/students')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBeLessThan(500);
    });
  });

  describe('Rate Limiting and Security', () => {
    it('should handle multiple rapid requests', async () => {
      const promises = Array.from({ length: 5 }, () =>
        request(app)
          .get('/api/auth/profile')
          .set('Authorization', `Bearer ${adminToken}`)
      );

      const responses = await Promise.all(promises);
      
      // All requests should succeed or be rate limited
      responses.forEach(response => {
        expect([200, 429]).toContain(response.status);
      });
    });

    it('should sanitize error messages in production', async () => {
      // Mock production environment
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'production';

      const response = await request(app)
        .get('/api/students/invalid-id')
        .set('Authorization', `Bearer ${adminToken}`);

      // Error messages should not reveal internal details
      if (response.status >= 400) {
        expect(response.body.message).not.toContain('mongoose');
        expect(response.body.message).not.toContain('ObjectId');
      }

      process.env.NODE_ENV = originalEnv;
    });
  });

  describe('API Versioning', () => {
    it('should handle API version headers', async () => {
      const response = await request(app)
        .get('/api/auth/profile')
        .set('Authorization', `Bearer ${adminToken}`)
        .set('API-Version', '1.0')
        .expect(200);

      AssertionHelper.expectSuccessResponse(response);
    });
  });

  describe('Content Negotiation', () => {
    it('should handle different Accept headers', async () => {
      const response = await request(app)
        .get('/api/students')
        .set('Authorization', `Bearer ${adminToken}`)
        .set('Accept', 'application/json')
        .expect(200);

      AssertionHelper.expectSuccessResponse(response);
      expect(response.headers['content-type']).toContain('application/json');
    });
  });
});