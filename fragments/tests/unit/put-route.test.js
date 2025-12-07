// tests/unit/put-route.test.js

const request = require('supertest');
const app = require('../../src/app');
const data = require('../../src/model/data');

describe('PUT /v1/fragments/:id', () => {
  const creds = ['user1@email.com', 'password1'];

  beforeEach(() => {
    data.reset();
  });

  test('returns 404 when fragment is missing', async () => {
    const res = await request(app)
      .put('/v1/fragments/missing')
      .auth(...creds)
      .set('Content-Type', 'text/plain')
      .send('updated');

    expect(res.status).toBe(404);
  });

  test('updates existing fragment data', async () => {
    // create
    const create = await request(app)
      .post('/v1/fragments')
      .auth(...creds)
      .set('Content-Type', 'text/plain')
      .send('original');
    const id = create.body.fragment.id;

    // update
    const res = await request(app)
      .put(`/v1/fragments/${id}`)
      .auth(...creds)
      .set('Content-Type', 'text/plain')
      .send('updated text');

    expect(res.status).toBe(200);
    expect(res.body.fragment.size).toBe('updated text'.length);

    // verify read
    const fetched = await request(app).get(`/v1/fragments/${id}`).auth(...creds);
    expect(fetched.text).toBe('updated text');
  });

  test('returns 415 when setData fails due to unsupported type', async () => {
    jest.isolateModules(() => {
      jest.doMock('../../src/model/fragment', () => {
        return class Fragment {
          static async byId() {
            return new Fragment();
          }
          async setData() {
            throw new Error('type not supported');
          }
          toObject() {
            return { id: 'mock', ownerId: 'owner', type: 'text/plain', size: 0 };
          }
        };
      });
      const testApp = require('../../src/app');
      return request(testApp)
        .put('/v1/fragments/mock')
        .auth(...creds)
        .set('Content-Type', 'text/plain')
        .send('data')
        .expect(415);
    });
    jest.resetModules();
  });

  test('bubbles unexpected errors to next (500)', async () => {
    jest.isolateModules(() => {
      jest.doMock('../../src/model/fragment', () => {
        return class Fragment {
          static async byId() {
            return new Fragment();
          }
          async setData() {
            throw new Error('boom');
          }
          toObject() {
            return { id: 'mock', ownerId: 'owner', type: 'text/plain', size: 0 };
          }
        };
      });
      const testApp = require('../../src/app');
      return request(testApp)
        .put('/v1/fragments/mock')
        .auth(...creds)
        .set('Content-Type', 'text/plain')
        .send('data')
        .expect(500);
    });
    jest.resetModules();
  });
});
