const PayEquityAnalysis = require('../models/PayEquityAnalysis');
const { extractPayEquityCsvFromFile } = require('../services/payequity/payEquityFile.service');
const { processPayEquityCsv } = require('../services/payequity/payEquityProcessor');
const { uploadRawToCloudinary } = require('../services/storage/cloudinary.service');
const { extractFileFromMultipart } = require('../utils/multipart');
const { getUploadedBy, getUploaderLabel } = require('../utils/uploadedBy');
const { sendSuccess, sendError } = require('../utils/response');

const PAY_EQUITY_FOLDER = 'trimerge-comply/pay-equity-uploads';

const buildPayEquityListItem = (analysis) => {
  const flaggedPayGaps = analysis.payGaps?.filter((gap) => gap.flagged).length || 0;
  const uiSummary = analysis.uiSummary && Object.keys(analysis.uiSummary).length
    ? analysis.uiSummary
    : {
        departmentsAnalyzed: 0,
        demographicGroups: analysis.payGaps?.length || 0,
        totalEmployees: analysis.dataset?.rowCount || 0,
        flagsGenerated: flaggedPayGaps,
        payGapsByDepartment: [],
        demographicGapsOverall: analysis.payGaps?.map((gap) => ({
          demographicGroup: gap.group,
          field: gap.field,
          comparisonGroup: gap.comparisonGroup,
          unadjustedGapPercent: null,
          adjustedGapPercent: gap.estimatedGapPercent,
          flagged: gap.flagged,
        })) || [],
      };
  const summary = analysis.summary && Object.keys(analysis.summary).length
    ? analysis.summary
    : {
        flaggedPayGaps,
        flagsGenerated: uiSummary.flagsGenerated,
        highestSeverity: flaggedPayGaps ? 'high' : 'low',
      };

  return {
    id: analysis._id,
    fileName: analysis.fileName,
    status: analysis.status,
    uploadedBy: getUploaderLabel(analysis.uploadedBy),
    date: analysis.createdAt,
    uiSummary,
    summary,
  };
};

const getPayEquityPayloadFromRequest = async (req) => {
  const contentType = req.headers['content-type'] || '';

  if (Buffer.isBuffer(req.body)) {
    if (contentType.includes('multipart/form-data')) {
      const file = extractFileFromMultipart(req.body, contentType);

      if (!file) {
        return null;
      }

      return {
        fileName: file.fileName || 'pay-equity-upload.csv',
        mimeType: file.mimeType || 'text/csv',
        fileBuffer: file.fileBuffer,
      };
    }

    return {
      fileName: 'raw-pay-equity-upload.csv',
      mimeType: contentType || 'text/csv',
      fileBuffer: req.body,
    };
  }

  if (req.body && typeof req.body.csvText === 'string') {
    const fileBuffer = Buffer.from(req.body.csvText, 'utf8');

    return {
      csvText: req.body.csvText,
      fileName: req.body.fileName || 'json-pay-equity-upload.csv',
      mimeType: 'text/csv',
      fileBuffer,
    };
  }

  return null;
};

// POST /api/payequity/upload
const uploadPayEquityCsv = async (req, res, next) => {
  try {
    const payload = await getPayEquityPayloadFromRequest(req);

    if (!payload?.fileBuffer?.length) {
      return sendError(res, {
        statusCode: 400,
        message: 'Pay equity file content is required. Upload .csv, .xlsx, .xls, .pdf, or .docx.',
      });
    }

    const { fileName, mimeType, fileBuffer } = payload;
    const extracted = await extractPayEquityCsvFromFile({ fileBuffer, fileName, mimeType });

    if (!extracted.supported) {
      return sendError(res, {
        statusCode: 415,
        message: extracted.error,
      });
    }

    if (!extracted.csvText?.trim()) {
      return sendError(res, {
        statusCode: 422,
        message: extracted.error || 'Could not extract pay equity rows from uploaded file.',
      });
    }

    const { csvText } = extracted;
    const result = processPayEquityCsv(csvText);

    if (!result.valid) {
      return sendError(res, {
        statusCode: 422,
        message: 'Pay equity CSV validation failed.',
        errors: result.errors,
      });
    }

    const storage = await uploadRawToCloudinary({
      fileContent: fileBuffer,
      fileName,
      mimeType,
      folder: PAY_EQUITY_FOLDER,
    });

    const analysisRecord = await PayEquityAnalysis.create({
      fileName,
      mimeType,
      sizeBytes: fileBuffer.length,
      storage,
      uploadedBy: getUploadedBy(req.user),
      companyName: req.user.companyName,
      organizationId: req.user.organizationId,
      dataset: result.dataset,
      model: result.model,
      payGaps: result.payGaps,
      summary: result.summary,
      warnings: [...extracted.warnings, ...result.warnings],
      uiSummary: result.uiSummary,
      status: 'processed',
    });

    return sendSuccess(res, {
      message: 'Pay equity file uploaded, stored, and analyzed successfully.',
      data: {
        analysisId: analysisRecord._id,
        fileName,
        mimeType,
        fileType: extracted.fileType,
        storage,
        dataset: result.dataset,
        model: result.model,
        payGaps: result.payGaps,
        uploadedBy: getUploaderLabel(analysisRecord.uploadedBy),
        uiSummary: result.uiSummary,
        summary: result.summary,
        warnings: [...extracted.warnings, ...result.warnings],
      },
    });
  } catch (err) {
    next(err);
  }
};

// GET /api/payequity
const listPayEquityAnalyses = async (req, res, next) => {
  try {
    const analyses = await PayEquityAnalysis.find({ organizationId: req.user.organizationId })
      .sort({ createdAt: -1 })
      .limit(100)
      .lean();

    return sendSuccess(res, {
      message: 'Pay equity analyses retrieved successfully.',
      data: {
        analyses: analyses.map(buildPayEquityListItem),
      },
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  listPayEquityAnalyses,
  uploadPayEquityCsv,
};
