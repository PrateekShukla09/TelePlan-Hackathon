const request = require('supertest');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const app = require('../src/app');
const Customer = require('../src/models/Customer');

let mongoServer;

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
});

describe('Customer API Integration Tests', () => {
  test('GET /api/customers/:id returns customer details', async () => {
    const customer = await Customer.create({
      name: 'Test Customer',
      phone: '+919999999999',
      tenureMonths: 12,
      contractType: 'postpaid',
      usage: {
        avgCallMin: 500,
        dataGB: 15,
        smsCount: 100,
        roamingUsage: 0,
        internationalUsage: 0
      }
    });

    const res = await request(app).get(`/api/customers/${customer._id}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.name).toBe('Test Customer');
    expect(res.body.phone).toBe('+919999999999');
  });

  test('GET /api/customers/:id/usage returns usage breakdown', async () => {
    const customer = await Customer.create({
      name: 'Usage Customer',
      phone: '+918888888888',
      usage: {
        avgCallMin: 750,
        dataGB: 22,
        smsCount: 150
      }
    });

    const res = await request(app).get(`/api/customers/${customer._id}/usage`);
    expect(res.statusCode).toBe(200);
    expect(res.body.avgCallMin).toBe(750);
    expect(res.body.dataGB).toBe(22);
  });

  test('GET /api/customers/:id with non-existent ID returns 404', async () => {
    const fakeId = new mongoose.Types.ObjectId();
    const res = await request(app).get(`/api/customers/${fakeId}`);
    expect(res.statusCode).toBe(404);
    expect(res.body.error.code).toBe('CUSTOMER_NOT_FOUND');
  });

  test('GET /api/customers/:id with invalid ObjectId returns 400', async () => {
    const res = await request(app).get('/api/customers/invalid-id-123');
    expect(res.statusCode).toBe(400);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });
});
