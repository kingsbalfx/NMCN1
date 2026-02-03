const request = require('supertest');
const app = require('../api/index');

describe('Basic API tests', () => {
  test('/test responds', async () => {
    const res = await request(app).get('/test');
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('message');
  });

  test('/api/public/nursing-questions responds', async () => {
    const res = await request(app).get('/api/public/nursing-questions?limit=2');
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('data');
    expect(Array.isArray(res.body.data)).toBe(true);
  });
});
