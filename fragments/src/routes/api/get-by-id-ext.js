// fragments/src/routes/api/get-by-id-ext.js

const Fragment = require('../../model/fragment');
const { createErrorResponse } = require('../../response');
const MarkdownIt = require('markdown-it');

const markdown = new MarkdownIt();

const extensionToType = (ext = '') => {
  const normalized = ext.toLowerCase();
  switch (normalized) {
    case 'txt':
    case 'text':
      return 'text/plain';
    case 'md':
    case 'markdown':
      return 'text/markdown';
    case 'html':
      return 'text/html';
    case 'json':
      return 'application/json';
    default:
      return undefined;
  }
};

const convertData = (fragment, data, targetType) => {
  if (fragment.type === targetType) {
    return data;
  }

  if (fragment.type === 'text/markdown' && targetType === 'text/html') {
    const rendered = markdown.render(data.toString('utf8'));
    return Buffer.from(rendered);
  }

  return null;
};

module.exports = async (req, res, next) => {
  try {
    const ownerId = req.user?.ownerId || req.ownerId;
    const fragment = await Fragment.byId(ownerId, req.params.id);

    if (!fragment) {
      return res.status(404).json(createErrorResponse(404, 'fragment not found'));
    }

    const targetType = extensionToType(req.params.ext);
    if (!targetType) {
      return res.status(415).json(createErrorResponse(415, 'unsupported extension'));
    }

    const data = await fragment.getData();
    if (!data) {
      return res.status(404).json(createErrorResponse(404, 'fragment data not found'));
    }

    const converted = convertData(fragment, data, targetType);
    if (!converted) {
      return res.status(415).json(createErrorResponse(415, 'conversion not supported'));
    }

    res.setHeader('Content-Type', targetType);
    return res.status(200).send(converted);
  } catch (err) {
    return next(err);
  }
};
