// fragments/tests/unit/post.test.js

const request = require('supertest');
const app = require('../../src/app');
const data = require('../../src/model/data');
const hash = require('../../src/hash');

describe('POST /v1/fragments', () => {
  beforeEach(() => {
    data.reset();
  });

  test('requires authentication', () =>
    request(app).post('/v1/fragments').send('test').expect(401));

  test('rejects unsupported content type', () =>
    request(app)
      .post('/v1/fragments')
      .auth('user1@email.com', 'password1')
      .set('Content-Type', 'application/json')
      .send(JSON.stringify({ foo: 'bar' }))
      .expect(415));

  test('creates fragment metadata and returns location header', async () => {
    const res = await request(app)
      .post('/v1/fragments')
      .auth('user1@email.com', 'password1')
      .set('Content-Type', 'text/plain')
      .send('hello fragment');

    expect(res.statusCode).toBe(201);
    expect(res.headers.location).toMatch(/\/v1\/fragments\/.+/);
    expect(res.body.status).toBe('ok');
    expect(res.body.fragment).toMatchObject({
      type: 'text/plain',
      size: 'hello fragment'.length,
      ownerId: hash('user1@email.com'),
    });
    const fragmentId = res.body.fragment.id;
    expect(res.headers.location.endsWith(`/v1/fragments/${fragmentId}`)).toBe(true);
  });

  test('unexpected errors bubble to the error handler', async () => {
    let testApp;
    jest.isolateModules(() => {
      jest.doMock('../../src/model/fragment', () => {
        return class Fragment {
          constructor() {
            this.id = 'mock-id';
            this.ownerId = 'mock-owner';
            this.type = 'text/plain';
          }

          static isSupportedType() {
            return true;
          }

          async setData() {
            throw new Error('boom');
          }

          toObject() {
            return {
              id: this.id,
              ownerId: this.ownerId,
              type: this.type,
              size: 0,
              created: new Date().toISOString(),
              updated: new Date().toISOString(),
            };
          }
        };
      });
      testApp = require('../../src/app');
    });

    const res = await request(testApp)
      .post('/v1/fragments')
      .auth('user1@email.com', 'password1')
      .set('Content-Type', 'text/plain')
      .send('data');

    expect(res.statusCode).toBe(500);
    expect(res.body.error.message).toBe('boom');
    jest.resetModules();
  });
});
