const path = require('path');
const mammoth = require('mammoth');
const { PDFParse } = require('pdf-parse');

const TEXT_MIME_TYPES = new Set(['text/plain', 'text/csv', 'application/csv']);
const TEXT_EXTENSIONS = new Set(['.txt', '.csv']);
const PDF_MIME_TYPES = new Set(['application/pdf']);
const DOCX_MIME_TYPES = new Set([
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
]);

const normalizeMimeType = (mimeType = '') => mimeType.split(';')[0].trim().toLowerCase();

const getPositionFileType = ({ fileName = '', mimeType = '' }) => {
  const normalizedMimeType = normalizeMimeType(mimeType);
  const extension = path.extname(fileName).toLowerCase();

  if (TEXT_MIME_TYPES.has(normalizedMimeType) || TEXT_EXTENSIONS.has(extension)) {
    return 'text';
  }

  if (PDF_MIME_TYPES.has(normalizedMimeType) || extension === '.pdf') {
    return 'pdf';
  }

  if (DOCX_MIME_TYPES.has(normalizedMimeType) || extension === '.docx') {
    return 'docx';
  }

  return null;
};

const extractPdfText = async (fileBuffer) => {
  const parser = new PDFParse({ data: fileBuffer });

  try {
    const result = await parser.getText();
    return result.text || '';
  } finally {
    await parser.destroy();
  }
};

const extractDocxText = async (fileBuffer) => {
  const result = await mammoth.extractRawText({ buffer: fileBuffer });
  return result.value || '';
};

const extractPositionText = async ({ fileBuffer, fileName = '', mimeType = '' }) => {
  if (!Buffer.isBuffer(fileBuffer)) {
    return {
      supported: false,
      text: '',
      fileType: null,
      reason: 'Uploaded document content must be a file buffer.',
    };
  }

  const fileType = getPositionFileType({ fileName, mimeType });

  if (!fileType) {
    return {
      supported: false,
      text: '',
      fileType: null,
      reason: 'Only .txt, .csv, .pdf, and .docx position description uploads are supported.',
    };
  }

  let text = '';

  if (fileType === 'pdf') {
    text = await extractPdfText(fileBuffer);
  } else if (fileType === 'docx') {
    text = await extractDocxText(fileBuffer);
  } else {
    text = fileBuffer.toString('utf8');
  }

  text = text.replace(/^\uFEFF/, '').trim();

  if (!text) {
    return {
      supported: true,
      text: '',
      fileType,
      reason: 'The uploaded document did not contain readable text.',
    };
  }

  return {
    supported: true,
    text,
    fileType,
    reason: null,
  };
};

module.exports = {
  extractPositionText,
  getPositionFileType,
};
