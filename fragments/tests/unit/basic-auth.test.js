// fragments/tests/unit/basic-auth.test.js

describe('basic auth module', () => {
  const originalEnv = { ...process.env };

  afterEach(() => {
    jest.resetModules();
    process.env = { ...originalEnv };
  });

  test('throws when HTPASSWD_FILE is missing', () => {
    delete process.env.HTPASSWD_FILE;
    expect(() => require('../../src/auth/basic-auth')).toThrow(/HTPASSWD_FILE/);
  });

  test('exports strategy when env var present', () => {
    process.env.HTPASSWD_FILE = '/tmp/.htpasswd';
    jest.isolateModules(() => {
      jest.doMock('http-auth', () => ({
        basic: jest.fn(() => 'basic-strategy'),
      }));
      jest.doMock('http-auth-passport', () => jest.fn((strategy) => strategy));
      const mockAuthorize = jest.fn();
      jest.doMock('../../src/auth/auth-middleware', () => ({
        authorize: () => mockAuthorize,
      }));
      const basic = require('../../src/auth/basic-auth');
      expect(typeof basic.strategy).toBe('function');
      expect(basic.strategy()).toBe('basic-strategy');
      expect(typeof basic.authenticate()).toBe('function');
    });
  });
});
