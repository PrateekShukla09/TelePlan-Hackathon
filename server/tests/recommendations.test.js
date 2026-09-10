const request = require('supertest');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const app = require('../src/app');
const Customer = require('../src/models/Customer');
const Plan = require('../src/models/Plan');
const Recommendation = require('../src/models/Recommendation');

let mongoServer;

jest.setTimeout(20000);

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const mongoUri = mongoServer.getUri();
  await mongoose.connect(mongoUri);
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

beforeEach(async () => {
  await Customer.deleteMany({});
  await Plan.deleteMany({});
  await Recommendation.deleteMany({});

  await Plan.insertMany([
    { planName: 'Basic 199', price: 199, dataGB: 5, callMinutes: 300, sms: 100, roamingIncluded: false, validityDays: 28 },
    { planName: 'Standard 499', price: 499, dataGB: 18, callMinutes: 900, sms: 300, roamingIncluded: false, validityDays: 28 },
    { planName: 'Heavy 799', price: 799, dataGB: 40, callMinutes: 1800, sms: 1000, roamingIncluded: true, validityDays: 28 }
  ]);
});

describe('Recommendation APIs Integration Tests', () => {
  test('POST /api/recommendations/by-customer/:id returns top recommended plans', async () => {
    const customer = await Customer.create({
      name: 'Recommendation Customer',
      phone: '+919999911111',
      usage: {
        avgCallMin: 800,
        dataGB: 15,
        smsCount: 200,
        roamingUsage: 0
      }
    });

    const res = await request(app).post(`/api/recommendations/by-customer/${customer._id}`);
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('plans');
    expect(Array.isArray(res.body.plans)).toBe(true);
    expect(res.body.plans.length).toBeLessThanOrEqual(3);
    expect(res.body.plans[0]).toHaveProperty('plan');
    expect(res.body.plans[0]).toHaveProperty('score');

    const auditCount = await Recommendation.countDocuments({ customerId: customer._id });
    expect(auditCount).toBe(1);
  });

  test('POST /api/recommendations/by-profile returns top 3 recommended plans for structured profile', async () => {
    const profilePayload = {
      profile: {
        dataNeed: 'high',
        callingNeed: 'medium',
        smsNeed: 'low',
        budget: 700,
        roamingRequired: true,
        familyOrIndividual: 'individual'
      }
    };

    const res = await request(app)
      .post('/api/recommendations/by-profile')
      .send(profilePayload);

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('plans');
    expect(Array.isArray(res.body.plans)).toBe(true);
    expect(res.body.plans.length).toBeLessThanOrEqual(3);
    expect(res.body.plans[0]).toHaveProperty('plan');
    expect(res.body.plans[0]).toHaveProperty('score');

    const auditCount = await Recommendation.countDocuments({ source: 'chat_profile' });
    expect(auditCount).toBe(1);
  });

  test('POST /api/recommendations/by-profile fails with 400 if profile is missing', async () => {
    const res = await request(app)
      .post('/api/recommendations/by-profile')
      .send({});

    expect(res.statusCode).toBe(400);
    expect(res.body.error.code).toBe('INVALID_PROFILE');
  });
});
