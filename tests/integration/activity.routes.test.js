import { describe, test, expect, beforeEach, beforeAll } from '@jest/globals';
import request from 'supertest';
import express from 'express';
import cors from 'cors';
import activityRouter from '../../server/routes/activity.route.js';
import User from '../../server/models/user.model.js';
import Activity from '../../server/models/activity.model.js';
import { validUser, loginCredentials } from '../fixtures/users.js';
import { validActivity, activeActivity, completedActivity } from '../fixtures/activities.js';

// Create test app
const createTestApp = () => {
  const app = express();
  
  app.use(cors());
  app.use(express.json());
  
  app.use('/api/activity', activityRouter);
  
  return app;
};

describe('Activity Routes Integration Tests', () => {
  let app;
  let testUser;
  let authToken;

  beforeAll(() => {
    app = createTestApp();
  });

  beforeEach(async () => {
    // Create test user and get auth token
    const user = new User(validUser);
    testUser = await user.save();
    
    // Mock JWT token for testing (in real scenario, this would come from login)
    const jwt = await import('jsonwebtoken');
    authToken = jwt.default.sign(
      { id: testUser._id, email: testUser.email, name: testUser.name },
      process.env.JWT_SECRET || 'test_jwt_secret',
      { expiresIn: '1h' }
    );
  });

  describe('GET /api/activity', () => {
    test('should return activity route works message', async () => {
      const response = await request(app)
        .get('/api/activity')
        .expect(200);

      expect(response.body).toMatchObject({
        message: 'Activity route works!'
      });
    });
  });

  describe('POST /api/activity/log', () => {
    test('should log a new activity', async () => {
      const activityData = { ...validActivity };

      const response = await request(app)
        .post('/api/activity/log')
        .set('Authorization', `Bearer ${authToken}`)
        .send(activityData)
        .expect(201);

      expect(response.body).toMatchObject({
        success: true,
        message: expect.stringContaining('Activity logged successfully')
      });
      expect(response.body.data).toMatchObject({
        sessionId: activityData.sessionId,
        url: activityData.url,
        domain: activityData.domain,
        action: activityData.action
      });
    });

    test('should fail without authentication', async () => {
      const response = await request(app)
        .post('/api/activity/log')
        .send(validActivity)
        .expect(401);

      expect(response.body).toMatchObject({
        message: 'No token, authorization denied'
      });
    });

    test('should fail with invalid activity data', async () => {
      const invalidActivity = {
        sessionId: '',
        url: '',
        domain: ''
      };

      const response = await request(app)
        .post('/api/activity/log')
        .set('Authorization', `Bearer ${authToken}`)
        .send(invalidActivity)
        .expect(400);

      expect(response.body.success).toBe(false);
    });
  });

  describe('POST /api/activity', () => {
    test('should log activity via alternative endpoint', async () => {
      const activityData = { ...validActivity };

      const response = await request(app)
        .post('/api/activity')
        .set('Authorization', `Bearer ${authToken}`)
        .send(activityData)
        .expect(201);

      expect(response.body).toMatchObject({
        success: true,
        message: expect.stringContaining('Activity logged successfully')
      });
    });
  });

  describe('GET /api/activity/summary', () => {
    beforeEach(async () => {
      // Create test activities
      const activities = [
        { ...validActivity, userId: testUser._id, sessionId: 'session-1' },
        { ...activeActivity, userId: testUser._id, sessionId: 'session-2' },
        { ...completedActivity, userId: testUser._id, sessionId: 'session-3' }
      ];

      for (const activityData of activities) {
        const activity = new Activity(activityData);
        await activity.save();
      }
    });

    test('should get activity summary for authenticated user', async () => {
      const response = await request(app)
        .get('/api/activity/summary')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toMatchObject({
        success: true
      });
      expect(response.body.data).toBeDefined();
      expect(Array.isArray(response.body.data.activities) || typeof response.body.data.totalTime === 'number').toBe(true);
    });

    test('should fail without authentication', async () => {
      const response = await request(app)
        .get('/api/activity/summary')
        .expect(401);

      expect(response.body).toMatchObject({
        message: 'No token, authorization denied'
      });
    });

    test('should accept date range query parameters', async () => {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - 7);
      const endDate = new Date();

      const response = await request(app)
        .get('/api/activity/summary')
        .set('Authorization', `Bearer ${authToken}`)
        .query({
          startDate: startDate.toISOString(),
          endDate: endDate.toISOString()
        })
        .expect(200);

      expect(response.body.success).toBe(true);
    });
  });

  describe('GET /api/activity/analytics/categories', () => {
    beforeEach(async () => {
      // Create activities with different categories
      const activities = [
        { ...validActivity, userId: testUser._id, sessionId: 'cat-1', categoryName: 'Development' },
        { ...activeActivity, userId: testUser._id, sessionId: 'cat-2', categoryName: 'Research' },
        { ...completedActivity, userId: testUser._id, sessionId: 'cat-3', categoryName: 'Entertainment' }
      ];

      for (const activityData of activities) {
        const activity = new Activity(activityData);
        await activity.save();
      }
    });

    test('should get category analytics', async () => {
      const response = await request(app)
        .get('/api/activity/analytics/categories')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toMatchObject({
        success: true
      });
      expect(response.body.data).toBeDefined();
    });

    test('should fail without authentication', async () => {
      const response = await request(app)
        .get('/api/activity/analytics/categories')
        .expect(401);

      expect(response.body).toMatchObject({
        message: 'No token, authorization denied'
      });
    });
  });

  describe('GET /api/activity/analytics/productivity', () => {
    beforeEach(async () => {
      // Create activities with different productivity scores
      const activities = [
        { ...validActivity, userId: testUser._id, sessionId: 'prod-1', productivityScore: 8 },
        { ...activeActivity, userId: testUser._id, sessionId: 'prod-2', productivityScore: 6 },
        { ...completedActivity, userId: testUser._id, sessionId: 'prod-3', productivityScore: 3 }
      ];

      for (const activityData of activities) {
        const activity = new Activity(activityData);
        await activity.save();
      }
    });

    test('should get productivity insights', async () => {
      const response = await request(app)
        .get('/api/activity/analytics/productivity')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toMatchObject({
        success: true
      });
      expect(response.body.data).toBeDefined();
    });

    test('should fail without authentication', async () => {
      const response = await request(app)
        .get('/api/activity/analytics/productivity')
        .expect(401);

      expect(response.body).toMatchObject({
        message: 'No token, authorization denied'
      });
    });
  });

  describe('GET /api/activity/categories', () => {
    test('should get available categories', async () => {
      const response = await request(app)
        .get('/api/activity/categories')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toMatchObject({
        success: true
      });
      expect(response.body.data).toBeDefined();
    });

    test('should fail without authentication', async () => {
      const response = await request(app)
        .get('/api/activity/categories')
        .expect(401);

      expect(response.body).toMatchObject({
        message: 'No token, authorization denied'
      });
    });
  });

  describe('POST /api/activity/end-all', () => {
    beforeEach(async () => {
      // Create some active activities
      const activeActivities = [
        { ...activeActivity, userId: testUser._id, sessionId: 'active-1', isActive: true },
        { ...activeActivity, userId: testUser._id, sessionId: 'active-2', isActive: true },
        { ...completedActivity, userId: testUser._id, sessionId: 'inactive-1', isActive: false }
      ];

      for (const activityData of activeActivities) {
        const activity = new Activity(activityData);
        await activity.save();
      }
    });

    test('should end all active sessions', async () => {
      const response = await request(app)
        .post('/api/activity/end-all')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toMatchObject({
        success: true,
        message: expect.stringContaining('Ended')
      });

      // Verify activities were ended
      const activeActivities = await Activity.find({ userId: testUser._id, isActive: true });
      expect(activeActivities).toHaveLength(0);
    });

    test('should fail without authentication', async () => {
      const response = await request(app)
        .post('/api/activity/end-all')
        .expect(401);

      expect(response.body).toMatchObject({
        message: 'No token, authorization denied'
      });
    });

    test('should handle case with no active sessions', async () => {
      // End all activities first
      await Activity.updateMany(
        { userId: testUser._id },
        { isActive: false }
      );

      const response = await request(app)
        .post('/api/activity/end-all')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toMatchObject({
        success: true,
        message: 'Ended 0 active sessions'
      });
    });
  });

  describe('POST /api/activity/recategorize', () => {
    beforeEach(async () => {
      // Create activities that need recategorization
      const activities = [
        { ...validActivity, userId: testUser._id, sessionId: 'recat-1' },
        { ...activeActivity, userId: testUser._id, sessionId: 'recat-2' }
      ];

      for (const activityData of activities) {
        const activity = new Activity(activityData);
        await activity.save();
      }
    });

    test('should trigger recategorization process', async () => {
      const response = await request(app)
        .post('/api/activity/recategorize')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toMatchObject({
        success: true
      });
    });

    test('should fail without authentication', async () => {
      const response = await request(app)
        .post('/api/activity/recategorize')
        .expect(401);

      expect(response.body).toMatchObject({
        message: 'No token, authorization denied'
      });
    });
  });
});
