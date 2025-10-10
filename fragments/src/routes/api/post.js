// fragments/src/routes/api/post.js

const Fragment = require('../../model/fragment');
const { createSuccessResponse, createErrorResponse } = require('../../response');

const buildLocation = (req, id) => {
  const base = process.env.API_URL || `${req.protocol}://${req.get('host')}`;
  const location = new URL(`/v1/fragments/${id}`, base);
  return location.toString();
};

module.exports = async (req, res, next) => {
  try {
    const fragment = new Fragment({
      ownerId: req.user.ownerId,
      type: req.bodyType,
    });

    await fragment.setData(req.rawBody || Buffer.alloc(0));

    res.setHeader('Location', buildLocation(req, fragment.id));
    return res.status(201).json(createSuccessResponse({ fragment: fragment.toObject() }));
  } catch (err) {
    if (err.message && err.message.includes('supported')) {
      return res.status(415).json(createErrorResponse(415, err.message));
    }
    return next(err);
  }
};
