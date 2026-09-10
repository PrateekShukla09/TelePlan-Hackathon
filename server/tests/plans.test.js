const request = require('supertest');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const { MongoMemoryServer } = require('mongodb-memory-server');
const app = require('../src/app');
const Plan = require('../src/models/Plan');
const env = require('../src/config/env');

let mongoServer;
let adminToken;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const mongoUri = mongoServer.getUri();
  await mongoose.connect(mongoUri);

  adminToken = jwt.sign({ username: env.ADMIN_USERNAME, role: 'admin' }, env.JWT_SECRET, { expiresIn: '1h' });
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

beforeEach(async () => {
  await Plan.deleteMany({});
});

describe('Plans API Integration Tests', () => {
  test('GET /api/plans returns all plans', async () => {
    await Plan.create({
      planName: 'Plan A',
      price: 299,
      dataGB: 10,
      callMinutes: 500,
      sms: 100,
      validityDays: 28
    });

    const res = await request(app).get('/api/plans');
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBe(1);
    expect(res.body[0].planName).toBe('Plan A');
  });

  test('POST /api/plans requires admin JWT authentication', async () => {
    const newPlan = {
      planName: 'New Plan',
      price: 399,
      dataGB: 15,
      callMinutes: 600,
      sms: 200,
      validityDays: 28
    };

    const unauthRes = await request(app).post('/api/plans').send(newPlan);
    expect(unauthRes.statusCode).toBe(401);

    const authRes = await request(app)
      .post('/api/plans')
      .set('Authorization', `Bearer ${adminToken}`)
      .send(newPlan);

    expect(authRes.statusCode).toBe(201);
    expect(authRes.body.planName).toBe('New Plan');
  });

  test('PUT /api/plans/:id updates plan details when authorized', async () => {
    const plan = await Plan.create({
      planName: 'Old Name',
      price: 100,
      dataGB: 2,
      callMinutes: 100,
      sms: 50,
      validityDays: 28
    });

    const res = await request(app)
      .put(`/api/plans/${plan._id}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ planName: 'Updated Name', price: 150 });

    expect(res.statusCode).toBe(200);
    expect(res.body.planName).toBe('Updated Name');
    expect(res.body.price).toBe(150);
  });

  test('DELETE /api/plans/:id deletes plan when authorized', async () => {
    const plan = await Plan.create({
      planName: 'ToDelete',
      price: 100,
      dataGB: 2,
      callMinutes: 100,
      sms: 50,
      validityDays: 28
    });

    const res = await request(app)
      .delete(`/api/plans/${plan._id}`)
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.message).toContain('deleted');
  });
});
