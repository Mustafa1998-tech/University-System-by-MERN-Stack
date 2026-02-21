const User = require('../../../src/models/User');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

describe('User Model', () => {
  describe('User Creation', () => {
    it('should create a valid user', async () => {
      const userData = generateTestData.student();
      const user = new User(userData);
      const savedUser = await user.save();
      
      expect(savedUser._id).toBeDefined();
      expect(savedUser.email).toBe(userData.email);
      expect(savedUser.name).toBe(userData.name);
      expect(savedUser.role).toBe(userData.role);
      expect(savedUser.isEmailVerified).toBe(false); // Default value
      expect(savedUser.isActive).toBe(true); // Default value
    });

    it('should hash password before saving', async () => {
      const userData = generateTestData.student();
      const user = new User(userData);
      const savedUser = await user.save();
      
      expect(savedUser.password).not.toBe(userData.password);
      expect(savedUser.password).toMatch(/^\$2[aby]\$\d+\$/); // bcrypt hash pattern
    });

    it('should require email field', async () => {
      const userData = generateTestData.student();
      delete userData.email;
      
      const user = new User(userData);
      
      await expect(user.save()).rejects.toThrow('Path `email` is required');
    });

    it('should require unique email', async () => {
      const userData = generateTestData.student();
      
      // Create first user
      const user1 = new User(userData);
      await user1.save();
      
      // Try to create second user with same email
      const user2 = new User(userData);
      
      await expect(user2.save()).rejects.toThrow('E11000');
    });

    it('should validate email format', async () => {
      const userData = generateTestData.student({
        email: 'invalid-email'
      });
      
      const user = new User(userData);
      
      await expect(user.save()).rejects.toThrow('Please provide a valid email');
    });

    it('should require name field', async () => {
      const userData = generateTestData.student();
      delete userData.name;
      
      const user = new User(userData);
      
      await expect(user.save()).rejects.toThrow('Path `name` is required');
    });

    it('should validate role enum', async () => {
      const userData = generateTestData.student({
        role: 'invalid-role'
      });
      
      const user = new User(userData);
      
      await expect(user.save()).rejects.toThrow('`invalid-role` is not a valid enum value');
    });

    it('should set default values correctly', async () => {
      const userData = generateTestData.student();
      const user = new User(userData);
      const savedUser = await user.save();
      
      expect(savedUser.isActive).toBe(true);
      expect(savedUser.isEmailVerified).toBe(false);
      expect(savedUser.loginAttempts).toBe(0);
      expect(savedUser.createdAt).toBeInstanceOf(Date);
      expect(savedUser.updatedAt).toBeInstanceOf(Date);
    });
  });

  describe('User Methods', () => {
    let user;

    beforeEach(async () => {
      const userData = generateTestData.student();
      user = new User(userData);
      await user.save();
    });

    it('should compare passwords correctly', async () => {
      const isMatch = await user.comparePassword('password123');
      expect(isMatch).toBe(true);
      
      const isNotMatch = await user.comparePassword('wrongpassword');
      expect(isNotMatch).toBe(false);
    });

    it('should generate JWT token', () => {
      const token = user.generateAuthToken();
      expect(token).toBeDefined();
      expect(typeof token).toBe('string');
      expect(token.split('.')).toHaveLength(3); // JWT has 3 parts
    });

    it('should generate refresh token', () => {
      const refreshToken = user.generateRefreshToken();
      expect(refreshToken).toBeDefined();
      expect(typeof refreshToken).toBe('string');
      expect(refreshToken.split('.')).toHaveLength(3); // JWT has 3 parts
    });

    it('should update last login', async () => {
      const initialLastLogin = user.lastLogin;
      await user.updateLastLogin();
      
      expect(user.lastLogin).toBeInstanceOf(Date);
      expect(user.lastLogin.getTime()).toBeGreaterThan(initialLastLogin || 0);
    });

    it('should increment login attempts', async () => {
      const initialAttempts = user.loginAttempts;
      await user.incrementLoginAttempts();
      
      expect(user.loginAttempts).toBe(initialAttempts + 1);
    });

    it('should reset login attempts', async () => {
      user.loginAttempts = 5;
      await user.resetLoginAttempts();
      
      expect(user.loginAttempts).toBe(0);
      expect(user.lockUntil).toBeUndefined();
    });

    it('should check if account is locked', () => {
      // Account not locked
      expect(user.isLocked).toBe(false);
      
      // Set lock until future date
      user.lockUntil = Date.now() + 60000; // 1 minute from now
      expect(user.isLocked).toBe(true);
      
      // Set lock until past date
      user.lockUntil = Date.now() - 60000; // 1 minute ago
      expect(user.isLocked).toBe(false);
    });
  });

  describe('User Statics', () => {
    beforeEach(async () => {
      // Create test users
      await User.create(generateTestData.student({ email: 'student1@test.com' }));
      await User.create(generateTestData.student({ email: 'student2@test.com' }));
      await User.create(generateTestData.instructor({ email: 'instructor1@test.com' }));
    });

    it('should find users by role', async () => {
      const students = await User.find({ role: 'student' });
      const instructors = await User.find({ role: 'instructor' });
      
      expect(students).toHaveLength(2);
      expect(instructors).toHaveLength(1);
    });

    it('should find active users', async () => {
      const activeUsers = await User.find({ isActive: true });
      expect(activeUsers.length).toBeGreaterThan(0);
    });

    it('should find verified users', async () => {
      // Update one user to be verified
      await User.findOneAndUpdate(
        { email: 'student1@test.com' },
        { isEmailVerified: true }
      );
      
      const verifiedUsers = await User.find({ isEmailVerified: true });
      expect(verifiedUsers).toHaveLength(1);
    });
  });

  describe('User Validation', () => {
    it('should validate phone number format', async () => {
      const validPhones = ['+966501234567', '+1234567890', '0501234567'];
      const invalidPhones = ['123', 'invalid-phone', ''];
      
      for (const phone of validPhones) {
        const userData = generateTestData.student({
          email: `test-${Math.random()}@test.com`,
          phone
        });
        const user = new User(userData);
        await expect(user.save()).resolves.toBeDefined();
      }
      
      for (const phone of invalidPhones) {
        const userData = generateTestData.student({
          email: `test-${Math.random()}@test.com`,
          phone
        });
        const user = new User(userData);
        if (phone) {
          await expect(user.save()).rejects.toThrow();
        }
      }
    });

    it('should validate gender enum', async () => {
      const validGenders = ['male', 'female'];
      const invalidGenders = ['invalid', 'other'];
      
      for (const gender of validGenders) {
        const userData = generateTestData.student({
          email: `test-${Math.random()}@test.com`,
          gender
        });
        const user = new User(userData);
        await expect(user.save()).resolves.toBeDefined();
      }
      
      for (const gender of invalidGenders) {
        const userData = generateTestData.student({
          email: `test-${Math.random()}@test.com`,
          gender
        });
        const user = new User(userData);
        await expect(user.save()).rejects.toThrow();
      }
    });
  });

  describe('User Indexes', () => {
    it('should have unique index on email', async () => {
      const indexes = await User.collection.getIndexes();
      const emailIndex = Object.keys(indexes).find(key => 
        indexes[key].some(field => field[0] === 'email')
      );
      
      expect(emailIndex).toBeDefined();
    });

    it('should have index on role', async () => {
      const indexes = await User.collection.getIndexes();
      const roleIndex = Object.keys(indexes).find(key => 
        indexes[key].some(field => field[0] === 'role')
      );
      
      expect(roleIndex).toBeDefined();
    });
  });
});
