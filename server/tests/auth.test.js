import request from 'supertest';
import app from '../server.js';
import mongoose from 'mongoose';
import User from '../models/user.model.js';

// These tests are minimal smoke tests and expect a running test DB configured via MONGO_URI in env when running.

describe('Auth flows (smoke)', () => {
  beforeAll(async () => {
    // connect DB if not connected
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/screentime-test');
    }
  });

  afterAll(async () => {
    try {
      await User.deleteMany({ email: /@example.com$/ });
      await mongoose.disconnect();
    } catch (err) {
      // ignore
    }
  });

  test('register creates user and sends response', async () => {
    const email = `test-${Date.now()}@example.com`;
    const res = await request(app)
      .post('/api/auth/register')
      .send({ name: 'Test User', email, password: 'password123' })
      .expect(201);

    expect(res.body.success).toBe(true);
    expect(res.body.data.email).toBe(email);
  });
});
