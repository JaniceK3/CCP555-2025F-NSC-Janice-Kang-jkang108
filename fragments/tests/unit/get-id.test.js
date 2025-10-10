// fragments/tests/unit/get-id.test.js

const request = require('supertest');
const app = require('../../src/app');
const data = require('../../src/model/data');

const credentials = ['user1@email.com', 'password1'];

describe('GET /v1/fragments/:id', () => {
  beforeEach(() => {
    data.reset();
  });

  test('requires authentication', () =>
    request(app).get('/v1/fragments/abc').expect(401));

  test('returns 404 when fragment is missing', () =>
    request(app)
      .get('/v1/fragments/missing')
      .auth(...credentials)
      .expect(404));

  test('returns raw fragment data with correct content type', async () => {
    const createRes = await request(app)
      .post('/v1/fragments')
      .auth(...credentials)
      .set('Content-Type', 'text/plain')
      .send('sample text data');

    const fragmentId = createRes.body.fragment.id;

    const res = await request(app)
      .get(`/v1/fragments/${fragmentId}`)
      .auth(...credentials);

    expect(res.statusCode).toBe(200);
    expect(res.headers['content-type']).toBe('text/plain');
    expect(res.text).toBe('sample text data');
  });

  test('returns 404 when fragment data is missing', async () => {
    const createRes = await request(app)
      .post('/v1/fragments')
      .auth(...credentials)
      .set('Content-Type', 'text/plain')
      .send('orphaned data');

    const { id, ownerId } = createRes.body.fragment;
    await data.deleteFragmentData(ownerId, id);

    const res = await request(app)
      .get(`/v1/fragments/${id}`)
      .auth(...credentials);

    expect(res.statusCode).toBe(404);
    expect(res.body.error.message).toBe('fragment data not found');
  });

  test('unexpected errors propagate to the error handler', async () => {
    let testApp;
    jest.isolateModules(() => {
      jest.doMock('../../src/model/fragment', () => {
        return class Fragment {
          static async byId() {
            throw new Error('boom');
          }

          static isSupportedType() {
            return true;
          }
        };
      });
      testApp = require('../../src/app');
    });

    const res = await request(testApp)
      .get('/v1/fragments/any-id')
      .auth(...credentials);

    expect(res.statusCode).toBe(500);
    expect(res.body.error.message).toBe('boom');
    jest.resetModules();
  });
});
