import { describe, test, expect, beforeEach, jest } from '@jest/globals';
import User from '../../../server/models/user.model.js';
import {
  register,
  login,
  getProfile,
  updateProfile,
  deleteAccount,
  verifyToken
} from '../../../server/controllers/auth.controller.js';
import { validUser, loginCredentials, invalidLoginCredentials, userUpdateData } from '../../fixtures/users.js';

describe('Auth Controller', () => {
  let mockReq, mockRes, testUser;

  beforeEach(async () => {
    // Create test user
    const user = new User(validUser);
    testUser = await user.save();

    // Mock request and response objects
    mockReq = {
      body: {},
      user: { id: testUser._id.toString() },
      header: jest.fn()
    };

    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
      redirect: jest.fn()
    };

    // Note: JWT tokens will be real in these tests
  });

  describe('register', () => {
    test('should register a new user successfully', async () => {
      const newUserData = {
        name: 'New User',
        email: 'newuser@example.com',
        password: 'password123'
      };
      
      mockReq.body = newUserData;

      await register(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(201);
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          message: 'User registered successfully',
          data: expect.objectContaining({
            name: newUserData.name,
            email: newUserData.email,
            provider: 'local'
          }),
          token: expect.any(String)
        })
      );
    });

    test('should fail registration with missing fields', async () => {
      mockReq.body = { name: 'Test User' }; // Missing email and password

      await register(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        message: 'Please provide name, email, and password'
      });
    });

    test('should fail registration with short password', async () => {
      mockReq.body = {
        name: 'Test User',
        email: 'test@example.com',
        password: '123' // Too short
      };

      await register(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        message: 'Password must be at least 6 characters long'
      });
    });

    test('should fail registration with existing email', async () => {
      mockReq.body = {
        name: 'Another User',
        email: validUser.email, // Already exists
        password: 'password123'
      };

      await register(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        message: 'User with this email already exists'
      });
    });
  });

  describe('login', () => {
    test('should login user with valid credentials', async () => {
      mockReq.body = loginCredentials;

      await login(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          message: 'Login successful',
          data: expect.objectContaining({
            email: loginCredentials.email,
            provider: 'local'
          }),
          token: expect.any(String)
        })
      );
    });

    test('should fail login with missing credentials', async () => {
      mockReq.body = { email: 'test@example.com' }; // Missing password

      await login(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        message: 'Please provide email and password'
      });
    });

    test('should fail login with invalid credentials', async () => {
      mockReq.body = invalidLoginCredentials;

      await login(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(401);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        message: 'Invalid email or password'
      });
    });

    test('should fail login with non-existent user', async () => {
      mockReq.body = {
        email: 'nonexistent@example.com',
        password: 'password123'
      };

      await login(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(401);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        message: 'Invalid email or password'
      });
    });
  });

  describe('getProfile', () => {
    test('should get user profile successfully', async () => {
      await getProfile(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        data: expect.objectContaining({
          _id: testUser._id,
          name: testUser.name,
          email: testUser.email
        })
      });
    });

    test('should fail to get profile for non-existent user', async () => {
      mockReq.user.id = '507f1f77bcf86cd799439011'; // Non-existent ID

      await getProfile(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(404);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        message: 'User not found'
      });
    });
  });

  describe('updateProfile', () => {
    test('should update user profile successfully', async () => {
      mockReq.body = userUpdateData;

      await updateProfile(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        data: expect.objectContaining({
          name: userUpdateData.name
        })
      });
    });

    test('should not update protected fields', async () => {
      mockReq.body = {
        name: 'Updated Name',
        email: 'newemail@example.com', // Should be ignored
        password: 'newpassword', // Should be ignored
        googleId: 'newgoogleid', // Should be ignored
        provider: 'google' // Should be ignored
      };

      await updateProfile(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(200);
      
      // Verify the user wasn't updated with protected fields
      const updatedUser = await User.findById(testUser._id);
      expect(updatedUser.email).toBe(testUser.email); // Should remain unchanged
      expect(updatedUser.provider).toBe(testUser.provider); // Should remain unchanged
    });

    test('should fail to update non-existent user', async () => {
      mockReq.user.id = '507f1f77bcf86cd799439011'; // Non-existent ID
      mockReq.body = userUpdateData;

      await updateProfile(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(404);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        message: 'User not found'
      });
    });
  });

  describe('deleteAccount', () => {
    test('should delete user account successfully', async () => {
      await deleteAccount(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        message: 'Account deleted successfully'
      });

      // Verify user was actually deleted
      const deletedUser = await User.findById(testUser._id);
      expect(deletedUser).toBeNull();
    });

    test('should fail to delete non-existent user', async () => {
      mockReq.user.id = '507f1f77bcf86cd799439011'; // Non-existent ID

      await deleteAccount(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(404);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        message: 'User not found'
      });
    });
  });

  describe('verifyToken', () => {
    test('should verify token successfully', async () => {
      mockReq.header.mockReturnValue('Bearer test-token');

      await verifyToken(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        data: expect.objectContaining({
          _id: testUser._id,
          name: testUser.name,
          email: testUser.email
        }),
        token: 'test-token'
      });
    });

    test('should fail to verify token for non-existent user', async () => {
      mockReq.user.id = '507f1f77bcf86cd799439011'; // Non-existent ID
      mockReq.header.mockReturnValue('Bearer test-token');

      await verifyToken(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(404);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        message: 'User not found'
      });
    });
  });
});
