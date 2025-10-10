// fragments/jest.config.js
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, 'env.jest') });
const logger = require('./src/logger');
logger.debug(`Using LOG_LEVEL=${process.env.LOG_LEVEL}. Use 'debug' in env.jest for more detail`);

module.exports = {
  verbose: true,
  testTimeout: 5000,
};
