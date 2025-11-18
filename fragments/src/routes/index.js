// src/routes/index.js
 
const express = require('express');
 
// version and author from package.json
const { version, author } = require('../../package.json');
 
// Create a router that we can use to mount our API
const router = express.Router();

// Our authentication middleware
const { authenticate } = require('../auth');

// response helper
const { createSuccessResponse } = require('../response');
 
/**
 * Expose all of our API routes on /v1/* to include an API version.
 */
router.use(`/v1`, authenticate(), require('./api'));

/**
 * Define a simple health check route. If the server is running
 * we'll respond with a 200 OK.  If not, the server isn't healthy.
 */
router.get('/', (req, res) => {
  // Client's shouldn't cache this response (always request it fresh)
  res.setHeader('Cache-Control', 'no-cache');
  // Send a 200 'OK' response
  res.status(200).json(createSuccessResponse({
    author,
    // Use your own GitHub URL for this!
    githubUrl: 'https://github.com/JaniceK3/CCP555-2025F-NSC-Janice-Kang-jkang108/tree/main/fragments',
    version,
  }));
});

// Test-only route to exercise error handling in automated tests
if (process.env.NODE_ENV === 'test') {
  router.get('/__test__/error', () => {
    throw new Error('boom');
  });

  router.get('/__test__/client-error', (req, res, next) => {
    const err = new Error('client oops');
    err.status = 418;
    next(err);
  });
}

module.exports = router;
