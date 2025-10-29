// src/routes/api/get.js
const express = require('express');
const Fragment = require('../../model/fragment');
const { createSuccessResponse } = require('../../response');
const router = express.Router();

// GET /v1/fragments -> IDs by default; ?expand=1|true -> metadata objects
router.get('/fragments', async (req, res, next) => {
  try {
    const expand = req.query.expand === '1' || req.query.expand === 'true';
    const fragments = await Fragment.byUser(req.user, expand);
    res.status(200).json(createSuccessResponse({ fragments }));
  } catch (err) {
    next(err);
  }
});

module.exports = router;
