const request = require('supertest');
const app = require('../../src/app');

describe('404 handler', () => {
  test('returns JSON error', async () => {
    const res = await request(app).get('/does/not/exist');
    expect(res.statusCode).toBe(404);
    expect(res.body.status).toBe('error');
    expect(res.body.error && res.body.error.message).toBe('not found');
  });
});
