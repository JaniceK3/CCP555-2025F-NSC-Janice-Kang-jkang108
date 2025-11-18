// fragments/tests/unit/get-route.test.js

describe('GET /fragments handler internals', () => {
  afterEach(() => {
    jest.resetModules();
  });

  test('falls back to req.ownerId when user is missing', async () => {
    let handlerPromise;
    jest.isolateModules(() => {
      const Fragment = require('../../src/model/fragment');
      jest.spyOn(Fragment, 'byUser').mockResolvedValue([]);
      const router = require('../../src/routes/api/get');

      const layer = router.stack.find((l) => l.route && l.route.path === '/fragments');
      const handler = layer.route.stack[0].handle;

      const res = {
        status: jest.fn(() => res),
        json: jest.fn(),
      };

      handlerPromise = handler({ query: {}, ownerId: 'fallback-owner' }, res, () => {
        throw new Error('next should not be called');
      }).then(() => {
        expect(Fragment.byUser).toHaveBeenCalledWith('fallback-owner', false);
        expect(res.status).toHaveBeenCalledWith(200);
      });
    });

    await handlerPromise;
  });
});
