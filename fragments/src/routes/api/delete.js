// src/routes/api/delete.js

const express = require('express');
const Fragment = require('../../model/fragment');
const { createErrorResponse, createSuccessResponse } = require('../../response');

const router = express.Router();

// DELETE /fragments/:id (mounted under /v1)
router.delete('/fragments/:id', async (req, res) => {
  try {
    // Be consistent with other routes: pull ownerId from the authenticated user
    const ownerId = req.user?.ownerId || req.ownerId;
    const id = req.params.id;

    const fragment = await Fragment.byId(ownerId, id);
    if (!fragment) {
      return res.status(404).json(
        createErrorResponse(404, 'Fragment not found')
      );
    }

    await fragment.delete();

    return res.status(200).json(
      createSuccessResponse({ status: 'ok' })
    );
  } catch (err) {
    console.error(err);
    return res.status(500).json(
      createErrorResponse(500, err.message)
    );
  }
});

module.exports = router;
