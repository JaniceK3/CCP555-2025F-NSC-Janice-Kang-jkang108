// fragments/src/routes/api/get-by-id-ext.js

const Fragment = require('../../model/fragment');
const { createErrorResponse } = require('../../response');
const MarkdownIt = require('markdown-it');

const sharp = require('sharp');

const markdown = new MarkdownIt();

const IMAGE_TYPES = ['image/png', 'image/jpeg', 'image/webp'];

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
    case 'png':
      return 'image/png';
    case 'jpg':
    case 'jpeg':
      return 'image/jpeg';
    case 'webp':
      return 'image/webp';
    default:
      return undefined;
  }
};

const isImage = (type) => IMAGE_TYPES.includes(type);

const convertData = async (fragment, data, targetType) => {
  if (fragment.type === targetType) {
    return data;
  }

  // Image conversions via sharp
  if (isImage(fragment.type) && isImage(targetType)) {
    const format = targetType.split('/')[1]; // png | jpeg | webp
    const converted = await sharp(data).toFormat(format).toBuffer();
    return converted;
  }

  // Text conversions
  if (fragment.type === 'text/markdown' && targetType === 'text/html') {
    const rendered = markdown.render(data.toString('utf8'));
    return Buffer.from(rendered);
  }

  // Any text/* -> text/plain (strip to plain text)
  if (fragment.type.startsWith('text/') && targetType === 'text/plain') {
    return Buffer.from(data.toString('utf8'));
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

    const converted = await convertData(fragment, data, targetType);
    if (!converted) {
      return res.status(415).json(createErrorResponse(415, 'conversion not supported'));
    }

    res.setHeader('Content-Type', targetType);
    return res.status(200).send(converted);
  } catch (err) {
    return next(err);
  }
};
