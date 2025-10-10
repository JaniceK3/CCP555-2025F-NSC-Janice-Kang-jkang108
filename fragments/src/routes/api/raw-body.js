// fragments/src/routes/api/raw-body.js

const contentType = require('content-type');
const Fragment = require('../../model/fragment');
const { createErrorResponse } = require('../../response');

module.exports = function rawBody() {
  return (req, res, next) => {
    const typeHeader = req.headers['content-type'];
    if (!typeHeader) {
      return res.status(415).json(createErrorResponse(415, 'content type required'));
    }

    let mime;
    try {
      ({ type: mime } = contentType.parse(typeHeader));
    } catch {
      return res.status(415).json(createErrorResponse(415, 'invalid content type'));
    }

    if (!Fragment.isSupportedType(mime)) {
      return res.status(415).json(createErrorResponse(415, 'unsupported content type'));
    }

    const chunks = [];
    let totalLength = 0;

    req.on('data', (chunk) => {
      chunks.push(chunk);
      totalLength += chunk.length;
    });

    req.on('end', () => {
      req.rawBody = Buffer.concat(chunks, totalLength);
      req.bodyType = mime;
      next();
    });

    req.on('error', next);
  };
};
