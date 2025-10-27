import { describe, test, expect, beforeEach, beforeAll, afterAll } from '@jest/globals';
import request from 'supertest';
import express from 'express';
import cors from 'cors';
import session from 'express-session';
import authRouter from '../../server/routes/auth.route.js';
import User from '../../server/models/user.model.js';
import { validUser, loginCredentials, userUpdateData } from '../fixtures/users.js';

// Create test app
const createTestApp = () => {
  const app = express();
  
  app.use(cors());
  app.use(express.json());
  app.use(session({
    secret: 'test-secret',
    resave: false,
    saveUninitialized: false
  }));
  
  app.use('/api/auth', authRouter);
  
  return app;
};

describe('Auth Routes Integration Tests', () => {
  let app;
  let testUser;
  let authToken;

  beforeAll(() => {
    app = createTestApp();
  });

  beforeEach(async () => {
    // Create a test user for authenticated routes
    const user = new User(validUser);
    testUser = await user.save();
  });

  describe('POST /api/auth/register', () => {
    test('should register a new user', async () => {
      const newUser = {
        name: 'New Test User',
        email: 'newtest@example.com',
        password: 'password123'
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(newUser)
        .expect(201);

      expect(response.body).toMatchObject({
        success: true,
        message: 'User registered successfully',
        data: {
          name: newUser.name,
          email: newUser.email,
          provider: 'local',
          isEmailVerified: false
        }
      });
      expect(response.body.token).toBeDefined();
      expect(response.body.data.id).toBeDefined();
    });

    test('should fail with invalid data', async () => {
      const invalidUser = {
        name: '',
        email: 'invalid-email',
        password: '123'
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(invalidUser)
        .expect(400);

      expect(response.body).toMatchObject({
        success: false,
        message: 'Please provide name, email, and password'
      });
    });

    test('should fail with duplicate email', async () => {
      const duplicateUser = {
        name: 'Duplicate User',
        email: validUser.email,
        password: 'password123'
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(duplicateUser)
        .expect(400);

      expect(response.body).toMatchObject({
        success: false,
        message: 'User with this email already exists'
      });
    });
  });

  describe('POST /api/auth/login', () => {
    test('should login with valid credentials', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send(loginCredentials)
        .expect(200);

      expect(response.body).toMatchObject({
        success: true,
        message: 'Login successful',
        data: {
          email: loginCredentials.email,
          provider: 'local'
        }
      });
      expect(response.body.token).toBeDefined();
      
      // Store token for authenticated tests
      authToken = response.body.token;
    });

    test('should fail with invalid credentials', async () => {
      const invalidCredentials = {
        email: validUser.email,
        password: 'wrongpassword'
      };

      const response = await request(app)
        .post('/api/auth/login')
        .send(invalidCredentials)
        .expect(401);

      expect(response.body).toMatchObject({
        success: false,
        message: 'Invalid email or password'
      });
    });

    test('should fail with missing credentials', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({ email: 'test@example.com' })
        .expect(400);

      expect(response.body).toMatchObject({
        success: false,
        message: 'Please provide email and password'
      });
    });
  });

  describe('GET /api/auth/verify', () => {
    beforeEach(async () => {
      // Login to get auth token
      const loginResponse = await request(app)
        .post('/api/auth/login')
        .send(loginCredentials);
      authToken = loginResponse.body.token;
    });

    test('should verify valid token', async () => {
      const response = await request(app)
        .get('/api/auth/verify')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toMatchObject({
        success: true,
        data: {
          email: validUser.email,
          name: validUser.name
        }
      });
      expect(response.body.token).toBeDefined();
    });

    test('should fail without token', async () => {
      const response = await request(app)
        .get('/api/auth/verify')
        .expect(401);

      expect(response.body).toMatchObject({
        message: 'No token, authorization denied'
      });
    });

    test('should fail with invalid token', async () => {
      const response = await request(app)
        .get('/api/auth/verify')
        .set('Authorization', 'Bearer invalid-token')
        .expect(401);

      expect(response.body).toMatchObject({
        message: 'Token is not valid'
      });
    });
  });

  describe('GET /api/auth/profile', () => {
    beforeEach(async () => {
      // Login to get auth token
      const loginResponse = await request(app)
        .post('/api/auth/login')
        .send(loginCredentials);
      authToken = loginResponse.body.token;
    });

    test('should get user profile', async () => {
      const response = await request(app)
        .get('/api/auth/profile')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toMatchObject({
        success: true,
        data: {
          email: validUser.email,
          name: validUser.name,
          provider: 'local'
        }
      });
      expect(response.body.data.password).toBeUndefined();
    });

    test('should fail without authentication', async () => {
      const response = await request(app)
        .get('/api/auth/profile')
        .expect(401);

      expect(response.body).toMatchObject({
        message: 'No token, authorization denied'
      });
    });
  });

  describe('PUT /api/auth/profile', () => {
    beforeEach(async () => {
      // Login to get auth token
      const loginResponse = await request(app)
        .post('/api/auth/login')
        .send(loginCredentials);
      authToken = loginResponse.body.token;
    });

    test('should update user profile', async () => {
      const response = await request(app)
        .put('/api/auth/profile')
        .set('Authorization', `Bearer ${authToken}`)
        .send(userUpdateData)
        .expect(200);

      expect(response.body).toMatchObject({
        success: true,
        data: {
          name: userUpdateData.name
        }
      });
    });

    test('should not update protected fields', async () => {
      const protectedUpdate = {
        name: 'Updated Name',
        email: 'newemail@example.com',
        password: 'newpassword',
        provider: 'google'
      };

      const response = await request(app)
        .put('/api/auth/profile')
        .set('Authorization', `Bearer ${authToken}`)
        .send(protectedUpdate)
        .expect(200);

      expect(response.body.data.email).toBe(validUser.email);
      expect(response.body.data.provider).toBe('local');
    });

    test('should fail without authentication', async () => {
      const response = await request(app)
        .put('/api/auth/profile')
        .send(userUpdateData)
        .expect(401);

      expect(response.body).toMatchObject({
        message: 'No token, authorization denied'
      });
    });
  });

  describe('DELETE /api/auth/account', () => {
    beforeEach(async () => {
      // Login to get auth token
      const loginResponse = await request(app)
        .post('/api/auth/login')
        .send(loginCredentials);
      authToken = loginResponse.body.token;
    });

    test('should delete user account', async () => {
      const response = await request(app)
        .delete('/api/auth/account')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toMatchObject({
        success: true,
        message: 'Account deleted successfully'
      });

      // Verify user was deleted
      const deletedUser = await User.findById(testUser._id);
      expect(deletedUser).toBeNull();
    });

    test('should fail without authentication', async () => {
      const response = await request(app)
        .delete('/api/auth/account')
        .expect(401);

      expect(response.body).toMatchObject({
        message: 'No token, authorization denied'
      });
    });
  });

  describe('POST /api/auth/logout', () => {
    test('should logout successfully', async () => {
      const response = await request(app)
        .post('/api/auth/logout')
        .expect(200);

      expect(response.body).toMatchObject({
        success: true,
        message: 'Logged out successfully'
      });
    });
  });
});
