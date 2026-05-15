const path = require('path');

const TEXT_MIME_TYPES = new Set(['text/plain', 'text/csv', 'application/csv']);
const TEXT_EXTENSIONS = new Set(['.txt', '.csv']);

const normalizeMimeType = (mimeType = '') => mimeType.split(';')[0].trim().toLowerCase();

const isTextPositionFile = ({ fileName = '', mimeType = '' }) => {
  const normalizedMimeType = normalizeMimeType(mimeType);
  const extension = path.extname(fileName).toLowerCase();

  return TEXT_MIME_TYPES.has(normalizedMimeType) || TEXT_EXTENSIONS.has(extension);
};

const extractPositionText = ({ fileBuffer, fileName = '', mimeType = '' }) => {
  if (!Buffer.isBuffer(fileBuffer)) {
    return {
      supported: false,
      text: '',
      reason: 'Uploaded document content must be a file buffer.',
    };
  }

  if (!isTextPositionFile({ fileName, mimeType })) {
    return {
      supported: false,
      text: '',
      reason: 'Only .txt and .csv position description uploads are supported right now. PDF and DOCX extraction will be added next.',
    };
  }

  const text = fileBuffer.toString('utf8').replace(/^\uFEFF/, '').trim();

  if (!text) {
    return {
      supported: true,
      text: '',
      reason: 'The uploaded document did not contain readable text.',
    };
  }

  return {
    supported: true,
    text,
    reason: null,
  };
};

module.exports = {
  extractPositionText,
  isTextPositionFile,
};
