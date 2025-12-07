// fragments/src/routes/api/put.js

const Fragment = require('../../model/fragment');
const { createSuccessResponse, createErrorResponse } = require('../../response');

module.exports = async (req, res, next) => {
  try {
    const ownerId = req.user?.ownerId || req.ownerId;
    const id = req.params.id;

    const fragment = await Fragment.byId(ownerId, id);
    if (!fragment) {
      return res.status(404).json(createErrorResponse(404, 'fragment not found'));
    }

    await fragment.setData(req.rawBody || Buffer.alloc(0));
    return res.status(200).json(createSuccessResponse({ fragment: fragment.toObject() }));
  } catch (err) {
    if (err.message && err.message.includes('supported')) {
      return res.status(415).json(createErrorResponse(415, err.message));
    }
    return next(err);
  }
};
