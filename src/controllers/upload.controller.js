const { processAdverseImpactCsv } = require('../services/analytics/csvAdverseImpactProcessor');
const { sendSuccess, sendError } = require('../utils/response');

const getBoundary = (contentType = '') => {
  const match = contentType.match(/boundary=(?:"([^"]+)"|([^;]+))/i);
  return match ? match[1] || match[2] : null;
};

const extractCsvFromMultipart = (bodyBuffer, contentType) => {
  const boundary = getBoundary(contentType);

  if (!boundary) {
    return '';
  }

  const body = bodyBuffer.toString('utf8');
  const parts = body.split(`--${boundary}`);

  for (const part of parts) {
    if (!part.includes('Content-Disposition')) {
      continue;
    }

    const [rawHeaders, ...contentParts] = part.split('\r\n\r\n');
    const contentDisposition = rawHeaders || '';
    const isFileField = /name="file"/i.test(contentDisposition);

    if (!isFileField) {
      continue;
    }

    return contentParts
      .join('\r\n\r\n')
      .replace(/\r\n--$/, '')
      .replace(/\r\n$/, '')
      .trim();
  }

  return '';
};

const getCsvTextFromRequest = (req) => {
  if (typeof req.body === 'string') {
    return req.body;
  }

  if (Buffer.isBuffer(req.body)) {
    const contentType = req.headers['content-type'] || '';

    if (contentType.includes('multipart/form-data')) {
      return extractCsvFromMultipart(req.body, contentType);
    }

    return req.body.toString('utf8');
  }

  if (req.body && typeof req.body.csvText === 'string') {
    return req.body.csvText;
  }

  return '';
};

// POST /api/upload/csv
const processCsvUpload = (req, res, next) => {
  try {
    const csvText = getCsvTextFromRequest(req);

    if (!csvText.trim()) {
      return sendError(res, {
        statusCode: 400,
        message: 'CSV content is required. Upload a CSV file, send raw text/csv, or send JSON with csvText.',
      });
    }

    const result = processAdverseImpactCsv(csvText);

    if (!result.valid) {
      return sendError(res, {
        statusCode: 422,
        message: 'CSV validation failed.',
        errors: result.errors,
      });
    }

    return sendSuccess(res, {
      message: 'CSV processed successfully.',
      data: result,
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  processCsvUpload,
};
