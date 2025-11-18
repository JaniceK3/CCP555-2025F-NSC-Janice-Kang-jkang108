// fragments/src/routes/api/get-info.js

const Fragment = require('../../model/fragment');
const { createSuccessResponse, createErrorResponse } = require('../../response');

module.exports = async (req, res, next) => {
  try {
    const ownerId = req.user?.ownerId || req.ownerId;
    const fragment = await Fragment.byId(ownerId, req.params.id);

    if (!fragment) {
      return res.status(404).json(createErrorResponse(404, 'fragment not found'));
    }

    return res.status(200).json(createSuccessResponse({ fragment: fragment.toObject() }));
  } catch (err) {
    return next(err);
  }
};
