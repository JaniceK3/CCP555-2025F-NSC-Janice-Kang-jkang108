// framgnets/src/hash.js

const crypto = require('crypto');

module.exports = function hash(value) {
  if (typeof value !== 'string' || value.length === 0) {
    throw new Error('value must be a non-empty string');
  }
  return crypto.createHash('sha256').update(value).digest('hex');
};
