// fragments/tests/unit/response.test.js
const { createErrorResponse, createSuccessResponse } = require('../../src/response');

describe('API Responses', () => {
  test('createErrorResponse()', () => {
    expect(createErrorResponse(404, 'not found')).toEqual({
      status: 'error',
      error: { code: 404, message: 'not found' },
    });
  });

  test('createSuccessResponse()', () => {
    expect(createSuccessResponse()).toEqual({ status: 'ok' });
  });

  test('createSuccessResponse(data)', () => {
    expect(createSuccessResponse({ a: 1, b: 2 })).toEqual({ status: 'ok', a: 1, b: 2 });
  });
});
