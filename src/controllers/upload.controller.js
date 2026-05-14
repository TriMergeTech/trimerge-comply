const { processAdverseImpactCsv } = require('../services/analytics/csvAdverseImpactProcessor');
const { uploadCsvToCloudinary } = require('../services/storage/cloudinary.service');
const { sendSuccess, sendError } = require('../utils/response');

const getBoundary = (contentType = '') => {
  const match = contentType.match(/boundary=(?:"([^"]+)"|([^;]+))/i);
  return match ? match[1] || match[2] : null;
};

const extractCsvFromMultipart = (bodyBuffer, contentType) => {
  const boundary = getBoundary(contentType);

  if (!boundary) {
    return { csvText: '', fileName: 'upload.csv', mimeType: 'text/csv' };
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
    const fileNameMatch = contentDisposition.match(/filename="([^"]+)"/i);
    const contentTypeMatch = rawHeaders.match(/Content-Type:\s*([^\r\n]+)/i);

    if (!isFileField) {
      continue;
    }

    const csvText = contentParts
      .join('\r\n\r\n')
      .replace(/\r\n--$/, '')
      .replace(/\r\n$/, '')
      .trim();

    return {
      csvText,
      fileName: fileNameMatch?.[1] || 'upload.csv',
      mimeType: contentTypeMatch?.[1] || 'text/csv',
    };
  }

  return { csvText: '', fileName: 'upload.csv', mimeType: 'text/csv' };
};

const getCsvPayloadFromRequest = (req) => {
  if (typeof req.body === 'string') {
    return {
      csvText: req.body,
      fileName: 'raw-upload.csv',
      mimeType: req.headers['content-type'] || 'text/csv',
    };
  }

  if (Buffer.isBuffer(req.body)) {
    const contentType = req.headers['content-type'] || '';

    if (contentType.includes('multipart/form-data')) {
      return extractCsvFromMultipart(req.body, contentType);
    }

    return {
      csvText: req.body.toString('utf8'),
      fileName: 'raw-upload.csv',
      mimeType: contentType || 'text/csv',
    };
  }

  if (req.body && typeof req.body.csvText === 'string') {
    return {
      csvText: req.body.csvText,
      fileName: req.body.fileName || 'json-upload.csv',
      mimeType: 'application/json',
    };
  }

  return { csvText: '', fileName: 'upload.csv', mimeType: 'text/csv' };
};

// POST /api/upload/csv
const processCsvUpload = async (req, res, next) => {
  try {
    const csvPayload = getCsvPayloadFromRequest(req);
    const { csvText, fileName, mimeType } = csvPayload;

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

    const storage = await uploadCsvToCloudinary({
      csvText,
      fileName,
    });

    return sendSuccess(res, {
      message: 'CSV processed and stored successfully.',
      data: {
        ...result,
        upload: {
          fileName,
          mimeType,
          storage,
        },
      },
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  processCsvUpload,
};
