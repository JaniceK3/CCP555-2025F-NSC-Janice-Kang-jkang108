// fragments/tests/unit/routes-index.test.js

describe('routes index env-specific behavior', () => {
  const originalEnv = process.env.NODE_ENV;

  afterEach(() => {
    jest.resetModules();
    process.env.NODE_ENV = originalEnv;
  });

  test('test-only routes are not registered outside test env', () => {
    process.env.NODE_ENV = 'production';
    delete process.env.HTPASSWD_FILE;
    process.env.AWS_COGNITO_POOL_ID = 'pool';
    process.env.AWS_COGNITO_CLIENT_ID = 'client';
    jest.isolateModules(() => {
      jest.doMock('../../src/auth/cognito', () => ({
        authenticate: () => (req, res, next) => next(),
      }));
      const router = require('../../src/routes');
      const hasTestRoute = router.stack.some(
        (layer) => layer.route && layer.route.path === '/__test__/error'
      );
      expect(hasTestRoute).toBe(false);
    });
  });
});
