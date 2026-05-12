const { processAdverseImpactCsv } = require('../services/analytics/csvAdverseImpactProcessor');
const { sendSuccess, sendError } = require('../utils/response');

const getCsvTextFromRequest = (req) => {
  if (typeof req.body === 'string') {
    return req.body;
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
        message: 'CSV content is required. Send raw text/csv or JSON with csvText.',
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
