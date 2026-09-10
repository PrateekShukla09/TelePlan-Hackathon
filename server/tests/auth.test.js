const request = require('supertest');
const app = require('../src/app');
const env = require('../src/config/env');

describe('Auth API Integration Tests', () => {
  test('POST /api/auth/login with valid credentials returns JWT token', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({
        username: env.ADMIN_USERNAME,
        password: env.ADMIN_PASSWORD
      });

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('token');
  });

  test('POST /api/auth/login with invalid credentials returns 401 Unauthorized', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({
        username: 'wronguser',
        password: 'wrongpassword'
      });

    expect(res.statusCode).toBe(401);
    expect(res.body.error.code).toBe('UNAUTHORIZED');
  });

  test('POST /api/auth/login missing username/password returns 400 Validation Error', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({});

    expect(res.statusCode).toBe(400);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });
});
