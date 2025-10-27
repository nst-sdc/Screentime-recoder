import { describe, test, expect, beforeEach } from '@jest/globals';
import mongoose from 'mongoose';
import Activity from '../../../server/models/activity.model.js';
import User from '../../../server/models/user.model.js';
import { validActivity, activeActivity, completedActivity, invalidActivity } from '../../fixtures/activities.js';
import { validUser } from '../../fixtures/users.js';

describe('Activity Model', () => {
  let testUser;

  beforeEach(async () => {
    const user = new User(validUser);
    testUser = await user.save();
  });

  describe('Activity Creation', () => {
    test('should create a valid activity', async () => {
      const activityData = { ...validActivity, userId: testUser._id };
      const activity = new Activity(activityData);
      const savedActivity = await activity.save();
      
      expect(savedActivity._id).toBeDefined();
      expect(savedActivity.userId.toString()).toBe(testUser._id.toString());
      expect(savedActivity.sessionId).toBe(validActivity.sessionId);
      expect(savedActivity.url).toBe(validActivity.url);
      expect(savedActivity.domain).toBe(validActivity.domain);
      expect(savedActivity.action).toBe(validActivity.action);
      expect(savedActivity.isActive).toBe(true); // Default value
      expect(savedActivity.productivityScore).toBe(validActivity.productivityScore);
    });

    test('should create activity with default values', async () => {
      const minimalActivity = {
        userId: testUser._id,
        sessionId: 'test-session',
        url: 'https://example.com',
        domain: 'example.com'
      };
      
      const activity = new Activity(minimalActivity);
      const savedActivity = await activity.save();
      
      expect(savedActivity.action).toBe('visit'); // Default
      expect(savedActivity.isActive).toBe(true); // Default
      expect(savedActivity.duration).toBe(0); // Default
      expect(savedActivity.idleTime).toBe(0); // Default
      expect(savedActivity.productivityScore).toBe(5); // Default
      expect(savedActivity.startTime).toBeDefined();
    });

    test('should fail to create activity without required fields', async () => {
      const activity = new Activity(invalidActivity);
      
      await expect(activity.save()).rejects.toThrow();
    });

    test('should fail to create activity without userId', async () => {
      const activity = new Activity(validActivity);
      
      await expect(activity.save()).rejects.toThrow();
    });
  });

  describe('Schema Validation', () => {
    test('should validate action enum values', async () => {
      const activityData = {
        ...validActivity,
        userId: testUser._id,
        action: 'invalid_action'
      };
      
      const activity = new Activity(activityData);
      
      await expect(activity.save()).rejects.toThrow();
    });

    test('should validate productivity score range', async () => {
      const activityData = {
        ...validActivity,
        userId: testUser._id,
        productivityScore: 15 // Invalid: max is 10
      };
      
      const activity = new Activity(activityData);
      
      await expect(activity.save()).rejects.toThrow();
    });

    test('should validate productivity score minimum', async () => {
      const activityData = {
        ...validActivity,
        userId: testUser._id,
        productivityScore: 0 // Invalid: min is 1
      };
      
      const activity = new Activity(activityData);
      
      await expect(activity.save()).rejects.toThrow();
    });

    test('should accept valid action enum values', async () => {
      const validActions = ['visit', 'start', 'update', 'end', 'close'];
      
      for (const action of validActions) {
        const activityData = {
          ...validActivity,
          userId: testUser._id,
          sessionId: `test-${action}`,
          action
        };
        
        const activity = new Activity(activityData);
        const savedActivity = await activity.save();
        
        expect(savedActivity.action).toBe(action);
      }
    });
  });

  describe('Activity Indexes', () => {
    test('should create activities with different session IDs', async () => {
      const activity1 = new Activity({
        ...validActivity,
        userId: testUser._id,
        sessionId: 'session-1'
      });
      
      const activity2 = new Activity({
        ...validActivity,
        userId: testUser._id,
        sessionId: 'session-2'
      });
      
      const saved1 = await activity1.save();
      const saved2 = await activity2.save();
      
      expect(saved1.sessionId).toBe('session-1');
      expect(saved2.sessionId).toBe('session-2');
    });

    test('should handle activities with same domain for different users', async () => {
      const user2 = new User({
        name: 'User 2',
        email: 'user2@example.com',
        password: 'password123'
      });
      const savedUser2 = await user2.save();
      
      const activity1 = new Activity({
        ...validActivity,
        userId: testUser._id,
        sessionId: 'session-1'
      });
      
      const activity2 = new Activity({
        ...validActivity,
        userId: savedUser2._id,
        sessionId: 'session-2'
      });
      
      const saved1 = await activity1.save();
      const saved2 = await activity2.save();
      
      expect(saved1.domain).toBe(saved2.domain);
      expect(saved1.userId.toString()).not.toBe(saved2.userId.toString());
    });
  });

  describe('Activity States', () => {
    test('should create active activity', async () => {
      const activityData = { ...activeActivity, userId: testUser._id };
      const activity = new Activity(activityData);
      const savedActivity = await activity.save();
      
      expect(savedActivity.isActive).toBe(true);
      expect(savedActivity.action).toBe('start');
      expect(savedActivity.endTime).toBeUndefined();
    });

    test('should create completed activity', async () => {
      const activityData = { ...completedActivity, userId: testUser._id };
      const activity = new Activity(activityData);
      const savedActivity = await activity.save();
      
      expect(savedActivity.isActive).toBe(false);
      expect(savedActivity.action).toBe('close');
      expect(savedActivity.endTime).toBeDefined();
      expect(savedActivity.duration).toBe(completedActivity.duration);
    });
  });

  describe('AI Analysis Fields', () => {
    test('should save activity with AI analysis data', async () => {
      const activityData = {
        ...validActivity,
        userId: testUser._id,
        aiAnalysis: {
          category: 'Development',
          confidence: 0.95,
          reasoning: 'GitHub is a development platform',
          processedAt: new Date()
        }
      };
      
      const activity = new Activity(activityData);
      const savedActivity = await activity.save();
      
      expect(savedActivity.aiAnalysis.category).toBe('Development');
      expect(savedActivity.aiAnalysis.confidence).toBe(0.95);
      expect(savedActivity.aiAnalysis.reasoning).toBe('GitHub is a development platform');
      expect(savedActivity.aiAnalysis.processedAt).toBeDefined();
    });

    test('should save activity with tags', async () => {
      const activityData = {
        ...validActivity,
        userId: testUser._id,
        tags: ['coding', 'repository', 'github']
      };
      
      const activity = new Activity(activityData);
      const savedActivity = await activity.save();
      
      expect(savedActivity.tags).toHaveLength(3);
      expect(savedActivity.tags).toContain('coding');
      expect(savedActivity.tags).toContain('repository');
      expect(savedActivity.tags).toContain('github');
    });
  });

  describe('Timestamps', () => {
    test('should automatically set createdAt and updatedAt', async () => {
      const activityData = { ...validActivity, userId: testUser._id };
      const activity = new Activity(activityData);
      const savedActivity = await activity.save();
      
      expect(savedActivity.createdAt).toBeDefined();
      expect(savedActivity.updatedAt).toBeDefined();
      expect(savedActivity.startTime).toBeDefined();
    });

    test('should update updatedAt on modification', async () => {
      const activityData = { ...validActivity, userId: testUser._id };
      const activity = new Activity(activityData);
      const savedActivity = await activity.save();
      
      const originalUpdatedAt = savedActivity.updatedAt;
      
      // Wait a bit to ensure timestamp difference
      await new Promise(resolve => setTimeout(resolve, 10));
      
      savedActivity.duration = 600000;
      const updatedActivity = await savedActivity.save();
      
      expect(updatedActivity.updatedAt.getTime()).toBeGreaterThan(originalUpdatedAt.getTime());
    });
  });
});
