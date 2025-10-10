// fragments/tests/unit/health.test.js

const request = require('supertest');
const app = require('../../src/app');
const { version, author } = require('../../package.json');

describe('/ health check', () => {
  test('200 OK', async () => {
    const res = await request(app).get('/');
    expect(res.statusCode).toBe(200);
  });
  test('Cache-Control: no-cache', async () => {
    const res = await request(app).get('/');
    expect(res.headers['cache-control']).toEqual('no-cache');
  });
  test('status: ok', async () => {
    const res = await request(app).get('/');
    expect(res.body.status).toBe('ok');
  });
  test('author/version/githubUrl present', async () => {
    const res = await request(app).get('/');
    expect(res.body.author).toEqual(author);
    expect(res.body.version).toEqual(version);
    expect(res.body.githubUrl.startsWith('https://github.com/')).toBe(true);
  });
});
