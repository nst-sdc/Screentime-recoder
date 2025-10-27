import { describe, test, expect, beforeEach } from '@jest/globals';
import User from '../../../server/models/user.model.js';
import { validUser, validGoogleUser, invalidUser } from '../../fixtures/users.js';

describe('User Model', () => {
  describe('User Creation', () => {
    test('should create a valid local user', async () => {
      const user = new User(validUser);
      const savedUser = await user.save();
      
      expect(savedUser._id).toBeDefined();
      expect(savedUser.name).toBe(validUser.name);
      expect(savedUser.email).toBe(validUser.email);
      expect(savedUser.provider).toBe('local');
      expect(savedUser.password).not.toBe(validUser.password); // Should be hashed
      expect(savedUser.isEmailVerified).toBe(false);
    });

    test('should create a valid Google user', async () => {
      const user = new User(validGoogleUser);
      const savedUser = await user.save();
      
      expect(savedUser._id).toBeDefined();
      expect(savedUser.googleId).toBe(validGoogleUser.googleId);
      expect(savedUser.name).toBe(validGoogleUser.name);
      expect(savedUser.email).toBe(validGoogleUser.email);
      expect(savedUser.provider).toBe('google');
      expect(savedUser.isEmailVerified).toBe(true);
      expect(savedUser.password).toBeUndefined();
    });

    test('should fail to create user with invalid data', async () => {
      const user = new User(invalidUser);
      
      await expect(user.save()).rejects.toThrow();
    });

    test('should fail to create user with duplicate email', async () => {
      const user1 = new User(validUser);
      await user1.save();
      
      const user2 = new User({ ...validUser, name: 'Different Name' });
      
      await expect(user2.save()).rejects.toThrow();
    });
  });

  describe('Password Hashing', () => {
    test('should hash password before saving for local users', async () => {
      const user = new User(validUser);
      await user.save();
      
      expect(user.password).not.toBe(validUser.password);
      expect(user.password.length).toBeGreaterThan(50); // Hashed password should be longer
    });

    test('should not hash password for Google users', async () => {
      const user = new User(validGoogleUser);
      await user.save();
      
      expect(user.password).toBeUndefined();
    });

    test('should not rehash password if not modified', async () => {
      const user = new User(validUser);
      await user.save();
      const originalPassword = user.password;
      
      user.name = 'Updated Name';
      await user.save();
      
      expect(user.password).toBe(originalPassword);
    });
  });

  describe('Password Comparison', () => {
    test('should correctly compare valid password', async () => {
      const user = new User(validUser);
      await user.save();
      
      const isMatch = await user.comparePassword(validUser.password);
      expect(isMatch).toBe(true);
    });

    test('should reject invalid password', async () => {
      const user = new User(validUser);
      await user.save();
      
      const isMatch = await user.comparePassword('wrongpassword');
      expect(isMatch).toBe(false);
    });

    test('should return false for Google users without password', async () => {
      const user = new User(validGoogleUser);
      await user.save();
      
      const isMatch = await user.comparePassword('anypassword');
      expect(isMatch).toBe(false);
    });
  });

  describe('findByCredentials Static Method', () => {
    beforeEach(async () => {
      const user = new User(validUser);
      await user.save();
    });

    test('should find user with valid credentials', async () => {
      const user = await User.findByCredentials(validUser.email, validUser.password);
      
      expect(user).toBeDefined();
      expect(user.email).toBe(validUser.email);
      expect(user.provider).toBe('local');
    });

    test('should throw error with invalid email', async () => {
      await expect(
        User.findByCredentials('nonexistent@example.com', validUser.password)
      ).rejects.toThrow('Invalid email or password');
    });

    test('should throw error with invalid password', async () => {
      await expect(
        User.findByCredentials(validUser.email, 'wrongpassword')
      ).rejects.toThrow('Invalid email or password');
    });

    test('should not find Google user with local credentials', async () => {
      const googleUser = new User(validGoogleUser);
      await googleUser.save();
      
      await expect(
        User.findByCredentials(validGoogleUser.email, 'anypassword')
      ).rejects.toThrow('Invalid email or password');
    });
  });

  describe('Schema Validation', () => {
    test('should require name field', async () => {
      const user = new User({ ...validUser, name: undefined });
      
      await expect(user.save()).rejects.toThrow();
    });

    test('should require email field', async () => {
      const user = new User({ ...validUser, email: undefined });
      
      await expect(user.save()).rejects.toThrow();
    });

    test('should require password for local users', async () => {
      const user = new User({ ...validUser, password: undefined });
      
      await expect(user.save()).rejects.toThrow();
    });

    test('should validate provider enum', async () => {
      const user = new User({ ...validUser, provider: 'invalid' });
      
      await expect(user.save()).rejects.toThrow();
    });

    test('should set default values correctly', async () => {
      const user = new User({
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123'
      });
      
      await user.save();
      
      expect(user.provider).toBe('local');
      expect(user.isEmailVerified).toBe(false);
      expect(user.lastLogin).toBeDefined();
    });
  });
});
