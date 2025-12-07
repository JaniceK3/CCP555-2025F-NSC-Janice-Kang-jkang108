// src/routes/api/index.js
 
//The main entry-point for the v1 version of the fragments API.
const express = require('express');
 
// Create a router on which to mount our API endpoints
const router = express.Router();

const rawBody = require('./raw-body');

router.get('/fragments', require('./get'));
router.post('/fragments', rawBody(), require('./post'));
router.put('/fragments/:id', rawBody(), require('./put'));
router.get('/fragments/:id/info', require('./get-info'));
router.get('/fragments/:id.:ext', require('./get-by-id-ext'));
router.get('/fragments/:id', require('./get-by-id'));
router.use(require('./delete'));

module.exports = router;
