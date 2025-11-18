// fragments/tests/unit/app.test.js

const request = require('supertest');
const app = require('../../src/app');

describe('404 handler', () => {
  test('returns JSON error', async () => {
    const res = await request(app).get('/does/not/exist');
    expect(res.statusCode).toBe(404);
    expect(res.body.status).toBe('error');
    expect(res.body.error && res.body.error.message).toBe('not found');
  });

  test('error handler returns structured 500 response', async () => {
    const res = await request(app).get('/__test__/error');
    expect(res.statusCode).toBe(500);
    expect(res.body).toEqual({
      status: 'error',
      error: { code: 500, message: 'boom' },
    });
  });

  test('client error through error handler returns provided status', async () => {
    const res = await request(app).get('/__test__/client-error');
    expect(res.statusCode).toBe(418);
    expect(res.body).toEqual({
      status: 'error',
      error: { code: 418, message: 'client oops' },
    });
  });
});
