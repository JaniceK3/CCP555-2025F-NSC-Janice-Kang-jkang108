// fragments/tests/unit/get-info.test.js

const request = require('supertest');
const app = require('../../src/app');
const data = require('../../src/model/data');

const credentials = ['user1@email.com', 'password1'];

describe('GET /v1/fragments/:id/info', () => {
  beforeEach(() => {
    data.reset();
  });

  test('requires authentication', () =>
    request(app).get('/v1/fragments/abc/info').expect(401));

  test('returns 404 when fragment metadata is missing', () =>
    request(app).get('/v1/fragments/missing/info').auth(...credentials).expect(404));

  test('returns fragment metadata for the owner', async () => {
    const createRes = await request(app)
      .post('/v1/fragments')
      .auth(...credentials)
      .set('Content-Type', 'text/plain')
      .send('info data');

    const id = createRes.body.fragment.id;
    const res = await request(app).get(`/v1/fragments/${id}/info`).auth(...credentials);

    expect(res.statusCode).toBe(200);
    expect(res.body.status).toBe('ok');
    expect(res.body.fragment).toMatchObject({
      id,
      type: 'text/plain',
      size: 'info data'.length,
    });
  });

  test('unexpected errors propagate through next()', async () => {
    let testApp;
    jest.isolateModules(() => {
      jest.doMock('../../src/model/fragment', () => {
        return class Fragment {
          static async byId() {
            throw Object.assign(new Error('fail'), { status: 409 });
          }
        };
      });
      testApp = require('../../src/app');
    });

    const res = await request(testApp).get('/v1/fragments/any/info').auth(...credentials);
    expect(res.statusCode).toBe(409);
    expect(res.body.error.message).toBe('fail');
  });

  test('handler uses req.ownerId fallback when user missing', async () => {
    let handlerPromise;
    jest.isolateModules(() => {
      const Fragment = require('../../src/model/fragment');
      jest.spyOn(Fragment, 'byId').mockResolvedValue({
        toObject: () => ({ id: 'frag', ownerId: 'fallback-owner' }),
      });
      const handler = require('../../src/routes/api/get-info');
      const res = {
        status: jest.fn(() => res),
        json: jest.fn(() => res),
      };
      handlerPromise = handler({ params: { id: 'frag' }, ownerId: 'fallback-owner' }, res, () => {
        throw new Error('next should not be called');
      }).then(() => {
        expect(Fragment.byId).toHaveBeenCalledWith('fallback-owner', 'frag');
        expect(res.status).toHaveBeenCalledWith(200);
      });
    });

    await handlerPromise;
  });
});
