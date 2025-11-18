// fragments/tests/unit/raw-body.test.js

const EventEmitter = require('events');
const rawBody = require('../../src/routes/api/raw-body');

const createRes = () => {
  const res = {
    statusCode: null,
    payload: null,
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(payload) {
      this.payload = payload;
      return this;
    },
  };
  return res;
};

describe('rawBody middleware', () => {
  test('rejects requests without content-type header', () => {
    const middleware = rawBody();
    const req = new EventEmitter();
    req.headers = {};
    const res = createRes();
    const next = jest.fn();

    middleware(req, res, next);

    expect(res.statusCode).toBe(415);
    expect(res.payload.error.message).toMatch(/content type required/);
    expect(next).not.toHaveBeenCalled();
  });

  test('rejects invalid content-type header', () => {
    const middleware = rawBody();
    const req = new EventEmitter();
    req.headers = { 'content-type': 'not-a-type' };
    const res = createRes();
    const next = jest.fn();

    middleware(req, res, next);

    expect(res.statusCode).toBe(415);
    expect(res.payload.error.message).toMatch(/invalid content type/);
    expect(next).not.toHaveBeenCalled();
  });
});
