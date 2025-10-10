describe('auth index module resolution', () => {
  const originalEnv = { ...process.env };

  beforeEach(() => {
    jest.resetModules();
    process.env = { ...originalEnv };
    delete process.env.AWS_COGNITO_POOL_ID;
    delete process.env.AWS_COGNITO_CLIENT_ID;
    delete process.env.HTPASSWD_FILE;
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  const loadAuth = () => require('../../src/auth');

  test('throws when both cognito and basic auth are configured', () => {
    process.env.AWS_COGNITO_POOL_ID = 'pool';
    process.env.AWS_COGNITO_CLIENT_ID = 'client';
    process.env.HTPASSWD_FILE = '/tmp/.htpasswd';

    expect(loadAuth).toThrow(/both AWS Cognito and HTTP Basic Auth/);
  });

  test('exports cognito strategy when cognito env vars set', () => {
    const mockCognito = { strategy: jest.fn() };
    jest.doMock('../../src/auth/cognito', () => mockCognito);

    process.env.AWS_COGNITO_POOL_ID = 'pool';
    process.env.AWS_COGNITO_CLIENT_ID = 'client';

    const auth = loadAuth();
    expect(auth).toBe(mockCognito);
  });

  test('exports basic auth strategy when htpasswd configured in non-production', () => {
    const mockBasic = { strategy: jest.fn() };
    jest.doMock('../../src/auth/basic-auth', () => mockBasic);

    process.env.HTPASSWD_FILE = '/tmp/.htpasswd';
    process.env.NODE_ENV = 'test';

    const auth = loadAuth();
    expect(auth).toBe(mockBasic);
  });

  test('throws when no auth configuration is present', () => {
    process.env.NODE_ENV = 'production';
    expect(loadAuth).toThrow(/no authorization configuration/);
  });
});
