// fragments/tests/unit/hash.test.js

const hash = require('../../src/hash');

describe('hash utility', () => {
  test('returns deterministic hashes', () => {
    const value = 'user@example.com';
    expect(hash(value)).toEqual(hash(value));
  });

  test('different inputs yield different hashes', () => {
    expect(hash('a@example.com')).not.toEqual(hash('b@example.com'));
  });

  test('throws on invalid input', () => {
    expect(() => hash('')).toThrow();
    expect(() => hash()).toThrow();
  });
});
