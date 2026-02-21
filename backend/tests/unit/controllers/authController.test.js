const request = require('supertest');
const jwt = require('jsonwebtoken');
const User = require('../../../src/models/User');
const app = require('../../../src/app');

describe('Auth Controller', () => {
  describe('POST /api/auth/register', () => {
    it('should register a new user successfully', async () => {
      const userData = {
        name: 'أحمد محمد',
        nameEn: 'Ahmed Mohammed',
        email: 'ahmed@university.edu',
        password: 'password123',
        role: 'student',
        phone: '+966501234567'
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(201);

      expect(response.body.status).toBe('success');
      expect(response.body.message).toBeDefined();
      expect(response.body.data.user).toBeDefined();
      expect(response.body.data.user.email).toBe(userData.email);
      expect(response.body.data.user.password).toBeUndefined(); // Password should not be returned
    });

    it('should not register user with invalid email', async () => {
      const userData = {
        name: 'Test User',
        email: 'invalid-email',
        password: 'password123',
        role: 'student'
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(400);

      expect(response.body.status).toBe('error');
      expect(response.body.message).toContain('email');
    });

    it('should not register user with duplicate email', async () => {
      const userData = generateTestData.student();
      
      // Create first user
      await createTestUser(userData);
      
      // Try to register with same email
      const response = await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(400);

      expect(response.body.status).toBe('error');
      expect(response.body.message).toContain('already exists');
    });

    it('should validate required fields', async () => {
      const incompleteData = {
        email: 'test@university.edu'
        // Missing required fields
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(incompleteData)
        .expect(400);

      expect(response.body.status).toBe('error');
    });

    it('should validate password strength', async () => {
      const userData = generateTestData.student({
        password: '123' // Weak password
      });

      const response = await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(400);

      expect(response.body.status).toBe('error');
      expect(response.body.message).toContain('password');
    });
  });

  describe('POST /api/auth/login', () => {
    let testUser;

    beforeEach(async () => {
      testUser = await createTestUser({
        email: 'test@university.edu',
        password: 'password123',
        isEmailVerified: true
      });
    });

    it('should login with valid credentials', async () => {
      const loginData = {
        email: 'test@university.edu',
        password: 'password123'
      };

      const response = await request(app)
        .post('/api/auth/login')
        .send(loginData)
        .expect(200);

      expect(response.body.status).toBe('success');
      expect(response.body.data.user).toBeDefined();
      expect(response.body.data.accessToken).toBeDefined();
      expect(response.body.data.refreshToken).toBeDefined();
      expect(response.body.data.user.password).toBeUndefined();
    });

    it('should not login with invalid password', async () => {
      const loginData = {
        email: 'test@university.edu',
        password: 'wrongpassword'
      };

      const response = await request(app)
        .post('/api/auth/login')
        .send(loginData)
        .expect(401);

      expect(response.body.status).toBe('error');
      expect(response.body.message).toContain('Invalid credentials');
    });

    it('should not login with non-existent email', async () => {
      const loginData = {
        email: 'nonexistent@university.edu',
        password: 'password123'
      };

      const response = await request(app)
        .post('/api/auth/login')
        .send(loginData)
        .expect(401);

      expect(response.body.status).toBe('error');
      expect(response.body.message).toContain('Invalid credentials');
    });

    it('should not login with unverified email', async () => {
      // Create unverified user
      await createTestUser({
        email: 'unverified@university.edu',
        password: 'password123',
        isEmailVerified: false
      });

      const loginData = {
        email: 'unverified@university.edu',
        password: 'password123'
      };

      const response = await request(app)
        .post('/api/auth/login')
        .send(loginData)
        .expect(401);

      expect(response.body.status).toBe('error');
      expect(response.body.message).toContain('verify');
    });

    it('should not login with inactive account', async () => {
      // Create inactive user
      await createTestUser({
        email: 'inactive@university.edu',
        password: 'password123',
        isEmailVerified: true,
        isActive: false
      });

      const loginData = {
        email: 'inactive@university.edu',
        password: 'password123'
      };

      const response = await request(app)
        .post('/api/auth/login')
        .send(loginData)
        .expect(401);

      expect(response.body.status).toBe('error');
      expect(response.body.message).toContain('suspended');
    });

    it('should update last login timestamp', async () => {
      const loginData = {
        email: 'test@university.edu',
        password: 'password123'
      };

      const userBefore = await User.findById(testUser._id);
      const initialLastLogin = userBefore.lastLogin;

      await request(app)
        .post('/api/auth/login')
        .send(loginData)
        .expect(200);

      const userAfter = await User.findById(testUser._id);
      expect(userAfter.lastLogin.getTime()).toBeGreaterThan(initialLastLogin || 0);
    });
  });

  describe('POST /api/auth/refresh', () => {
    let testUser;
    let refreshToken;

    beforeEach(async () => {
      testUser = await createTestUser();
      refreshToken = testUser.generateRefreshToken();
    });

    it('should refresh access token with valid refresh token', async () => {
      const response = await request(app)
        .post('/api/auth/refresh')
        .send({ refreshToken })
        .expect(200);

      expect(response.body.status).toBe('success');
      expect(response.body.data.accessToken).toBeDefined();
      
      // Verify new token is valid
      const decoded = jwt.verify(response.body.data.accessToken, process.env.JWT_SECRET || 'test-secret');
      expect(decoded.userId).toBe(testUser._id.toString());
    });

    it('should not refresh with invalid refresh token', async () => {
      const response = await request(app)
        .post('/api/auth/refresh')
        .send({ refreshToken: 'invalid-token' })
        .expect(401);

      expect(response.body.status).toBe('error');
      expect(response.body.message).toContain('Invalid refresh token');
    });

    it('should not refresh with expired refresh token', async () => {
      // Create expired token
      const expiredToken = jwt.sign(
        { userId: testUser._id },
        process.env.JWT_REFRESH_SECRET || 'test-refresh-secret',
        { expiresIn: '-1h' } // Expired 1 hour ago
      );

      const response = await request(app)
        .post('/api/auth/refresh')
        .send({ refreshToken: expiredToken })
        .expect(401);

      expect(response.body.status).toBe('error');
    });
  });

  describe('POST /api/auth/logout', () => {
    let testUser;
    let accessToken;

    beforeEach(async () => {
      testUser = await createTestUser();
      accessToken = generateAuthToken(testUser);
    });

    it('should logout successfully', async () => {
      const response = await request(app)
        .post('/api/auth/logout')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      expect(response.body.status).toBe('success');
      expect(response.body.message).toContain('Logged out successfully');
    });

    it('should logout without authentication', async () => {
      const response = await request(app)
        .post('/api/auth/logout')
        .expect(200);

      expect(response.body.status).toBe('success');
    });
  });

  describe('GET /api/auth/profile', () => {
    let testUser;
    let accessToken;

    beforeEach(async () => {
      testUser = await createTestUser();
      accessToken = generateAuthToken(testUser);
    });

    it('should get user profile', async () => {
      const response = await request(app)
        .get('/api/auth/profile')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      expect(response.body.status).toBe('success');
      expect(response.body.data.user).toBeDefined();
      expect(response.body.data.user._id).toBe(testUser._id.toString());
      expect(response.body.data.user.password).toBeUndefined();
    });

    it('should not get profile without authentication', async () => {
      const response = await request(app)
        .get('/api/auth/profile')
        .expect(401);

      expect(response.body.status).toBe('error');
      expect(response.body.message).toContain('Access denied');
    });

    it('should not get profile with invalid token', async () => {
      const response = await request(app)
        .get('/api/auth/profile')
        .set('Authorization', 'Bearer invalid-token')
        .expect(401);

      expect(response.body.status).toBe('error');
    });
  });

  describe('PATCH /api/auth/profile', () => {
    let testUser;
    let accessToken;

    beforeEach(async () => {
      testUser = await createTestUser();
      accessToken = generateAuthToken(testUser);
    });

    it('should update user profile', async () => {
      const updateData = {
        name: 'اسم محدث',
        nameEn: 'Updated Name',
        phone: '+966501234568'
      };

      const response = await request(app)
        .patch('/api/auth/profile')
        .set('Authorization', `Bearer ${accessToken}`)
        .send(updateData)
        .expect(200);

      expect(response.body.status).toBe('success');
      expect(response.body.data.user.name).toBe(updateData.name);
      expect(response.body.data.user.nameEn).toBe(updateData.nameEn);
      expect(response.body.data.user.phone).toBe(updateData.phone);
    });

    it('should not update email through profile', async () => {
      const updateData = {
        email: 'newemail@university.edu'
      };

      const response = await request(app)
        .patch('/api/auth/profile')
        .set('Authorization', `Bearer ${accessToken}`)
        .send(updateData)
        .expect(400);

      expect(response.body.status).toBe('error');
    });

    it('should not update without authentication', async () => {
      const updateData = {
        name: 'Updated Name'
      };

      const response = await request(app)
        .patch('/api/auth/profile')
        .send(updateData)
        .expect(401);

      expect(response.body.status).toBe('error');
    });
  });

  describe('POST /api/auth/forgot-password', () => {
    let testUser;

    beforeEach(async () => {
      testUser = await createTestUser({
        email: 'test@university.edu',
        isEmailVerified: true
      });
    });

    it('should send password reset email', async () => {
      const response = await request(app)
        .post('/api/auth/forgot-password')
        .send({ email: 'test@university.edu' })
        .expect(200);

      expect(response.body.status).toBe('success');
      expect(response.body.message).toContain('reset');
    });

    it('should not reveal if email does not exist', async () => {
      const response = await request(app)
        .post('/api/auth/forgot-password')
        .send({ email: 'nonexistent@university.edu' })
        .expect(200);

      expect(response.body.status).toBe('success');
      expect(response.body.message).toContain('reset');
    });

    it('should validate email format', async () => {
      const response = await request(app)
        .post('/api/auth/forgot-password')
        .send({ email: 'invalid-email' })
        .expect(400);

      expect(response.body.status).toBe('error');
    });
  });

  describe('PATCH /api/auth/change-password', () => {
    let testUser;
    let accessToken;

    beforeEach(async () => {
      testUser = await createTestUser({
        password: 'oldpassword123'
      });
      accessToken = generateAuthToken(testUser);
    });

    it('should change password with correct current password', async () => {
      const passwordData = {
        currentPassword: 'oldpassword123',
        newPassword: 'newpassword123'
      };

      const response = await request(app)
        .patch('/api/auth/change-password')
        .set('Authorization', `Bearer ${accessToken}`)
        .send(passwordData)
        .expect(200);

      expect(response.body.status).toBe('success');
      expect(response.body.message).toContain('changed');
    });

    it('should not change password with incorrect current password', async () => {
      const passwordData = {
        currentPassword: 'wrongpassword',
        newPassword: 'newpassword123'
      };

      const response = await request(app)
        .patch('/api/auth/change-password')
        .set('Authorization', `Bearer ${accessToken}`)
        .send(passwordData)
        .expect(400);

      expect(response.body.status).toBe('error');
      expect(response.body.message).toContain('current password');
    });

    it('should validate new password strength', async () => {
      const passwordData = {
        currentPassword: 'oldpassword123',
        newPassword: '123' // Weak password
      };

      const response = await request(app)
        .patch('/api/auth/change-password')
        .set('Authorization', `Bearer ${accessToken}`)
        .send(passwordData)
        .expect(400);

      expect(response.body.status).toBe('error');
    });
  });
});
