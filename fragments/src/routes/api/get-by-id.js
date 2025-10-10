// fragments/src/routes/api/get-by-id.js

const Fragment = require('../../model/fragment');
const { createErrorResponse } = require('../../response');

module.exports = async (req, res, next) => {
  try {
    const fragment = await Fragment.byId(req.user.ownerId, req.params.id);
    if (!fragment) {
      return res.status(404).json(createErrorResponse(404, 'fragment not found'));
    }

    const data = await fragment.getData();
    if (!data) {
      return res.status(404).json(createErrorResponse(404, 'fragment data not found'));
    }

    res.setHeader('Content-Type', fragment.type);
    return res.status(200).send(data);
  } catch (err) {
    return next(err);
  }
};
