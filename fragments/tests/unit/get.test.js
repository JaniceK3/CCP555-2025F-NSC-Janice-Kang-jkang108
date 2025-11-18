// tests/unit/get.test.js
 
const request = require('supertest');
const app = require('../../src/app');
const Fragment = require('../../src/model/fragment');
const data = require('../../src/model/data');
const hash = require('../../src/hash');

describe('GET /v1/fragments', () => {
  beforeEach(() => {
    data.reset();
  });

  test('unauthenticated requests are denied', () =>
    request(app).get('/v1/fragments').expect(401));

  test('incorrect credentials are denied', () =>
    request(app)
      .get('/v1/fragments')
      .auth('invalid@email.com', 'incorrect_password')
      .expect(401));

  test('returns empty array when user has no fragments', async () => {
    const res = await request(app).get('/v1/fragments').auth('user1@email.com', 'password1');
    expect(res.statusCode).toBe(200);
    expect(res.body.fragments).toEqual([]);
  });

  test('authenticated users get only their fragment ids', async () => {
    const owner = hash('user1@email.com');
    const fragment = new Fragment({ ownerId: owner, type: 'text/plain' });
    await fragment.setData(Buffer.from('hello world'));

    const res = await request(app).get('/v1/fragments').auth('user1@email.com', 'password1');
    expect(res.statusCode).toBe(200);
    expect(res.body.status).toBe('ok');
    expect(res.body.fragments).toEqual([fragment.id]);
  });

  test('expand=1 returns full metadata', async () => {
    const owner = hash('user1@email.com');
    const fragment = new Fragment({ ownerId: owner, type: 'text/plain' });
    await fragment.setData(Buffer.from('hello world'));

    const res = await request(app)
      .get('/v1/fragments?expand=1')
      .auth('user1@email.com', 'password1');

    expect(res.statusCode).toBe(200);
    expect(res.body.fragments[0]).toMatchObject({
      id: fragment.id,
      ownerId: owner,
      type: 'text/plain',
      size: 'hello world'.length,
    });
  });

  test('expand=true also returns metadata', async () => {
    const owner = hash('user1@email.com');
    const fragment = new Fragment({ ownerId: owner, type: 'text/plain' });
    await fragment.setData(Buffer.from('hello world'));

    const res = await request(app)
      .get('/v1/fragments?expand=true')
      .auth('user1@email.com', 'password1');

    expect(res.statusCode).toBe(200);
    expect(res.body.fragments[0]).toMatchObject({ id: fragment.id, ownerId: owner });
  });
});
