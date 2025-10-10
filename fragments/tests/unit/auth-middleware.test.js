jest.mock('passport', () => ({
  authenticate: jest.fn(),
}));

const passport = require('passport');
const hash = require('../../src/hash');

jest.mock('../../src/hash', () => jest.fn((value) => `hashed-${value}`));

const { authorize } = require('../../src/auth/auth-middleware');

const createRes = () => {
  const res = {};
  res.status = jest.fn(() => res);
  res.json = jest.fn(() => res);
  return res;
};

describe('authorize middleware', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('calls next when authentication succeeds', () => {
    passport.authenticate.mockImplementation((strategy, options, callback) => () => {
      callback(null, 'User@Example.com');
    });

    const middleware = authorize('http');
    const req = {};
    const res = createRes();
    const next = jest.fn();

    middleware(req, res, next);

    expect(hash).toHaveBeenCalledWith('user@example.com');
    expect(req.user).toEqual({
      email: 'user@example.com',
      ownerId: 'hashed-user@example.com',
      raw: 'User@Example.com',
    });
    expect(req.ownerId).toBe('hashed-user@example.com');
    expect(next).toHaveBeenCalledWith();
  });

  test('passes errors to next when passport yields error', () => {
    const error = new Error('auth failure');
    passport.authenticate.mockImplementation((strategy, options, callback) => () => {
      callback(error);
    });

    const middleware = authorize('bearer');
    const req = {};
    const res = createRes();
    const next = jest.fn();

    middleware(req, res, next);

    expect(next).toHaveBeenCalledWith(error);
    expect(res.status).not.toHaveBeenCalled();
  });

  test('returns 401 when user not authenticated', () => {
    passport.authenticate.mockImplementation((strategy, options, callback) => () => {
      callback(null, false);
    });

    const middleware = authorize('http');
    const req = {};
    const res = createRes();
    const next = jest.fn();

    middleware(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({
      status: 'error',
      error: { code: 401, message: 'unauthorized' },
    });
    expect(next).not.toHaveBeenCalled();
  });

  test('returns 401 when identity cannot be derived', () => {
    passport.authenticate.mockImplementation((strategy, options, callback) => () => {
      callback(null, { unknown: true });
    });

    const middleware = authorize('http');
    const req = {};
    const res = createRes();
    const next = jest.fn();

    middleware(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({
      status: 'error',
      error: { code: 401, message: 'unauthorized' },
    });
    expect(next).not.toHaveBeenCalled();
  });
});
