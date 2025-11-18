// fragments/tests/unit/get-by-id-ext.test.js

const request = require('supertest');
const app = require('../../src/app');
const data = require('../../src/model/data');

const credentials = ['user1@email.com', 'password1'];

describe('GET /v1/fragments/:id.:ext', () => {
  beforeEach(() => {
    data.reset();
  });

  test('requires authentication', () =>
    request(app).get('/v1/fragments/abc.html').expect(401));

  test('returns 404 when fragment metadata is missing', () =>
    request(app).get('/v1/fragments/missing.html').auth(...credentials).expect(404));

  test('returns 415 when extension is unsupported', async () => {
    const createRes = await request(app)
      .post('/v1/fragments')
      .auth(...credentials)
      .set('Content-Type', 'text/plain')
      .send('plain text');

    const id = createRes.body.fragment.id;

    await request(app)
      .get(`/v1/fragments/${id}.png`)
      .auth(...credentials)
      .expect(415);
  });

  test('converts markdown fragments to HTML using markdown-it', async () => {
    const markdown = '# Title\n\nSome body.';

    const createRes = await request(app)
      .post('/v1/fragments')
      .auth(...credentials)
      .set('Content-Type', 'text/markdown')
      .send(markdown);

    const id = createRes.body.fragment.id;

    const res = await request(app).get(`/v1/fragments/${id}.html`).auth(...credentials);

    expect(res.statusCode).toBe(200);
    expect(res.headers['content-type']).toBe('text/html');
    expect(res.text).toBe('<h1>Title</h1>\n<p>Some body.</p>\n');
  });

  test('requesting html for non-markdown fragments is not supported', async () => {
    const createRes = await request(app)
      .post('/v1/fragments')
      .auth(...credentials)
      .set('Content-Type', 'text/plain')
      .send('plain data');

    const id = createRes.body.fragment.id;

    await request(app).get(`/v1/fragments/${id}.html`).auth(...credentials).expect(415);
  });

  test('returns original data when extension matches stored type', async () => {
    const markdown = '_hi_';

    const createRes = await request(app)
      .post('/v1/fragments')
      .auth(...credentials)
      .set('Content-Type', 'text/markdown')
      .send(markdown);

    const id = createRes.body.fragment.id;

    const res = await request(app).get(`/v1/fragments/${id}.md`).auth(...credentials);
    expect(res.statusCode).toBe(200);
    expect(res.headers['content-type']).toBe('text/markdown');
    expect(res.text).toBe(markdown);
  });

  test('text/plain fragments can be retrieved via .txt', async () => {
    const createRes = await request(app)
      .post('/v1/fragments')
      .auth(...credentials)
      .set('Content-Type', 'text/plain')
      .send('plain data');

    const id = createRes.body.fragment.id;
    const res = await request(app).get(`/v1/fragments/${id}.txt`).auth(...credentials);

    expect(res.statusCode).toBe(200);
    expect(res.headers['content-type']).toBe('text/plain');
    expect(res.text).toBe('plain data');
  });

  test('returns json fragments when requesting .json', async () => {
    const body = { foo: 'bar' };

    const createRes = await request(app)
      .post('/v1/fragments')
      .auth(...credentials)
      .set('Content-Type', 'application/json')
      .send(JSON.stringify(body));

    const id = createRes.body.fragment.id;
    const res = await request(app).get(`/v1/fragments/${id}.json`).auth(...credentials);

    expect(res.statusCode).toBe(200);
    expect(res.headers['content-type']).toBe('application/json');
    expect(res.text).toBe(JSON.stringify(body));
  });

  test('returns 404 when fragment metadata exists but data is missing', async () => {
    const createRes = await request(app)
      .post('/v1/fragments')
      .auth(...credentials)
      .set('Content-Type', 'text/plain')
      .send('orphaned ext');

    const { id, ownerId } = createRes.body.fragment;
    const dataStore = require('../../src/model/data');
    await dataStore.deleteFragmentData(ownerId, id);

    const res = await request(app).get(`/v1/fragments/${id}.txt`).auth(...credentials);
    expect(res.statusCode).toBe(404);
    expect(res.body.error.message).toBe('fragment data not found');
  });

  test('unexpected errors propagate via error handler', async () => {
    let testApp;
    jest.isolateModules(() => {
      jest.doMock('../../src/model/fragment', () => {
        return class Fragment {
          static async byId() {
            throw new Error('ext boom');
          }
        };
      });
      testApp = require('../../src/app');
    });

    const res = await request(testApp).get('/v1/fragments/any.html').auth(...credentials);
    expect(res.statusCode).toBe(500);
    expect(res.body.error.message).toBe('ext boom');
  });
});
