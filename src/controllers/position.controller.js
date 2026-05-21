const PositionDocument = require('../models/PositionDocument');
const { analyzePositionDescription } = require('../services/ai/openai.service');
const { extractPositionText } = require('../services/position/positionText.service');
const { buildPositionUiRow } = require('../services/position/positionUi.service');
const { uploadRawToCloudinary } = require('../services/storage/cloudinary.service');
const { extractFileFromMultipart } = require('../utils/multipart');
const { getUploadedBy } = require('../utils/uploadedBy');
const { sendSuccess, sendError } = require('../utils/response');

const POSITION_DOCUMENT_FOLDER = 'trimerge-comply/position-documents';

const getPositionPayloadFromRequest = (req) => {
  const contentType = req.headers['content-type'] || '';

  if (Buffer.isBuffer(req.body)) {
    if (contentType.includes('multipart/form-data')) {
      return extractFileFromMultipart(req.body, contentType);
    }

    return {
      fileBuffer: req.body,
      fileName: 'raw-position-upload.txt',
      mimeType: contentType || 'text/plain',
    };
  }

  if (req.body && typeof req.body.documentText === 'string') {
    return {
      fileBuffer: Buffer.from(req.body.documentText, 'utf8'),
      fileName: req.body.fileName || 'json-position-upload.txt',
      mimeType: 'text/plain',
    };
  }

  return null;
};

// POST /api/position/upload
const uploadPositionDocument = async (req, res, next) => {
  try {
    const payload = getPositionPayloadFromRequest(req);

    if (!payload?.fileBuffer?.length) {
      return sendError(res, {
        statusCode: 400,
        message: 'Position document content is required. Upload a .txt, .csv, .pdf, or .docx file.',
      });
    }

    const { fileBuffer, fileName, mimeType } = payload;
    const extraction = await extractPositionText({ fileBuffer, fileName, mimeType });

    if (!extraction.supported) {
      return sendError(res, {
        statusCode: 415,
        message: extraction.reason,
      });
    }

    if (!extraction.text) {
      return sendError(res, {
        statusCode: 422,
        message: extraction.reason || 'Position document text is empty.',
      });
    }

    const storage = await uploadRawToCloudinary({
      fileContent: fileBuffer,
      fileName,
      mimeType,
      folder: POSITION_DOCUMENT_FOLDER,
    });

    const aiResult = await analyzePositionDescription({
      text: extraction.text,
      fileName,
    });

    const documentRecord = await PositionDocument.create({
      fileName,
      mimeType,
      sizeBytes: fileBuffer.length,
      storage,
      uploadedBy: getUploadedBy(req.user),
      textLength: extraction.text.length,
      extractedTextPreview: extraction.text.slice(0, 500),
      aiConfigured: aiResult.configured,
      analysisStatus: aiResult.skipped ? 'skipped' : 'completed',
      analysis: aiResult.analysis,
    });

    return sendSuccess(res, {
      message: aiResult.skipped
        ? 'Position document uploaded and stored. AI analysis skipped because OPENAI_API_KEY is not configured.'
        : 'Position document uploaded, stored, and analyzed successfully.',
      data: {
        documentId: documentRecord._id,
        fileName,
        mimeType,
        fileType: extraction.fileType,
        storage,
        aiConfigured: aiResult.configured,
        analysisStatus: documentRecord.analysisStatus,
        uiRow: buildPositionUiRow(documentRecord),
        analysis: aiResult.analysis || {
          summary: '',
          overallRisk: null,
          findings: [],
        },
      },
    });
  } catch (err) {
    next(err);
  }
};

// GET /api/position
const listPositionDocuments = async (req, res, next) => {
  try {
    const documents = await PositionDocument.find({})
      .sort({ createdAt: -1 })
      .limit(100)
      .lean();

    return sendSuccess(res, {
      message: 'Position documents retrieved successfully.',
      data: {
        documents: documents.map(buildPositionUiRow),
      },
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  listPositionDocuments,
  uploadPositionDocument,
};
