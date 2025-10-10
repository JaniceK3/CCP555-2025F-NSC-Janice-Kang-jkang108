jest.mock('pino', () => jest.fn((opts) => ({ opts })));

const loadLogger = () => require('../../src/logger');

describe('logger configuration', () => {
  let pino;

  beforeEach(() => {
    jest.resetModules();
    pino = require('pino');
    delete process.env.LOG_LEVEL;
  });

  afterEach(() => {
    jest.resetModules();
  });

  test('defaults to info level', () => {
    const logger = loadLogger();
    expect(logger.opts.level).toBe('info');
    expect(pino).toHaveBeenCalledWith(expect.objectContaining({ level: 'info' }));
  });

  test('enables pretty transport when LOG_LEVEL=debug', () => {
    process.env.LOG_LEVEL = 'debug';
    const logger = loadLogger();
    expect(logger.opts.level).toBe('debug');
    expect(logger.opts.transport).toEqual({
      target: 'pino-pretty',
      options: { colorize: true },
    });
  });
});
