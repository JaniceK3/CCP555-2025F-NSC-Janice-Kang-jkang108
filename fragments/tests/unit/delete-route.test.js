// tests/unit/delete-route.test.js

const request = require('supertest');
const app = require('../../src/app');
const data = require('../../src/model/data');

describe('DELETE /v1/fragments/:id', () => {
  const creds = ['user1@email.com', 'password1'];

  beforeEach(() => {
    data.reset();
  });

  test('returns 404 when fragment is missing', async () => {
    const res = await request(app).delete('/v1/fragments/missing').auth(...creds);
    expect(res.status).toBe(404);
  });

  test('deletes existing fragment', async () => {
    // create
    const create = await request(app)
      .post('/v1/fragments')
      .auth(...creds)
      .set('Content-Type', 'text/plain')
      .send('to-delete');
    const id = create.body.fragment.id;

    const del = await request(app).delete(`/v1/fragments/${id}`).auth(...creds);
    expect(del.status).toBe(200);

    const get = await request(app).get(`/v1/fragments/${id}`).auth(...creds);
    expect(get.status).toBe(404);
  });

  test('returns 500 when handler throws', async () => {
    jest.isolateModules(() => {
      jest.doMock('../../src/model/fragment', () => {
        return {
          byId: () => {
            throw new Error('boom');
          },
        };
      });
      const testApp = require('../../src/app');
      return request(testApp).delete('/v1/fragments/any').auth(...creds).expect(500);
    });
    jest.resetModules();
  });

  test('returns 500 when delete throws', async () => {
    jest.isolateModules(() => {
      jest.doMock('../../src/model/fragment', () => {
        return {
          byId: () => ({
            delete: () => {
              throw new Error('boom');
            },
          }),
        };
      });
      const testApp = require('../../src/app');
      return request(testApp).delete('/v1/fragments/any').auth(...creds).expect(500);
    });
    jest.resetModules();
  });
});
