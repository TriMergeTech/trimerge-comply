const Handbook = require('../models/Handbook');
const ActivityLog = require('../models/ActivityLog');
const { extractPositionText } = require('../services/position/positionText.service');
const { chunkText } = require('../services/handbook/handbookSearch.service');
const { uploadRawToCloudinary } = require('../services/storage/cloudinary.service');
const { extractFileFromMultipart } = require('../utils/multipart');
const { sendSuccess, sendError } = require('../utils/response');

const HANDBOOK_FOLDER = 'trimerge-comply/handbooks';

// POST /api/handbooks/upload
const uploadHandbook = async (req, res, next) => {
  try {
    const contentType = req.headers['content-type'] || '';
    let payload = null;

    if (Buffer.isBuffer(req.body)) {
      if (contentType.includes('multipart/form-data')) {
        payload = extractFileFromMultipart(req.body, contentType);
      } else {
        const fileName = req.headers['x-file-name'] || 'handbook.pdf';
        payload = { fileBuffer: req.body, fileName, mimeType: contentType.split(';')[0].trim() };
      }
    }

    if (!payload?.fileBuffer?.length) {
      return sendError(res, {
        statusCode: 400,
        message: 'Handbook file is required. Upload a .pdf or .docx file.',
      });
    }

    const { fileBuffer, fileName, mimeType } = payload;

    // Use the x-handbook-name header or query param as the display name, fallback to filename
    const displayName =
      req.headers['x-handbook-name'] ||
      req.query.name ||
      fileName.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ');

    const extraction = await extractPositionText({ fileBuffer, fileName, mimeType });

    if (!extraction.supported) {
      return sendError(res, { statusCode: 415, message: extraction.reason });
    }
    if (!extraction.text?.trim()) {
      return sendError(res, {
        statusCode: 422,
        message: 'Could not extract text from this handbook. Ensure it is not a scanned image PDF.',
      });
    }

    // Upload original file to Cloudinary for archival
    const storage = await uploadRawToCloudinary({
      fileContent: fileBuffer,
      fileName,
      mimeType,
      folder: HANDBOOK_FOLDER,
    });

    const chunks = chunkText(extraction.text);

    const handbook = await Handbook.create({
      name: displayName,
      fileName,
      mimeType,
      sizeBytes: fileBuffer.length,
      storage,
      uploadedBy: {
        userId: req.user._id,
        email: req.user.email,
        companyName: req.user.companyName,
        role: req.user.role,
      },
      companyName: req.user.companyName,
      textLength: extraction.text.length,
      chunkCount: chunks.length,
      chunks,
      status: 'ready',
    });

    await ActivityLog.create({
      targetType: 'handbook',
      targetId: handbook._id,
      handbookId: handbook._id,
      performedBy: req.user._id,
      companyName: req.user.companyName,
      action: 'handbook_uploaded',
      details: {
        name: handbook.name,
        fileName,
        textLength: extraction.text.length,
        chunkCount: chunks.length,
      },
    });

    return sendSuccess(res, {
      statusCode: 201,
      message: `Handbook "${displayName}" uploaded and indexed into ${chunks.length} searchable sections.`,
      data: {
        handbookId: handbook._id,
        name: handbook.name,
        fileName,
        textLength: extraction.text.length,
        chunkCount: chunks.length,
        status: handbook.status,
        storageUrl: storage.secureUrl,
      },
    });
  } catch (err) {
    next(err);
  }
};

// GET /api/handbooks
const listHandbooks = async (req, res, next) => {
  try {
    const handbooks = await Handbook.find({ companyName: req.user.companyName })
      .select('-chunks')
      .sort({ createdAt: -1 })
      .lean();

    return sendSuccess(res, {
      message: 'Handbooks retrieved successfully.',
      data: { handbooks, total: handbooks.length },
    });
  } catch (err) {
    next(err);
  }
};

// GET /api/handbooks/:id
const getHandbookById = async (req, res, next) => {
  try {
    const handbook = await Handbook.findOne({
      _id: req.params.id,
      companyName: req.user.companyName,
    })
      .select('-chunks')
      .lean();

    if (!handbook) return sendError(res, { statusCode: 404, message: 'Handbook not found.' });

    return sendSuccess(res, {
      message: 'Handbook retrieved successfully.',
      data: { handbook },
    });
  } catch (err) {
    next(err);
  }
};

// DELETE /api/handbooks/:id
const deleteHandbook = async (req, res, next) => {
  try {
    const handbook = await Handbook.findOne({
      _id: req.params.id,
      companyName: req.user.companyName,
    });
    if (!handbook) return sendError(res, { statusCode: 404, message: 'Handbook not found.' });

    await Handbook.findByIdAndDelete(req.params.id);

    await ActivityLog.create({
      targetType: 'handbook',
      targetId: handbook._id,
      handbookId: handbook._id,
      performedBy: req.user._id,
      companyName: req.user.companyName,
      action: 'handbook_deleted',
      details: { name: handbook.name, fileName: handbook.fileName },
    });

    return sendSuccess(res, { message: `Handbook "${handbook.name}" deleted.` });
  } catch (err) {
    next(err);
  }
};

module.exports = { uploadHandbook, listHandbooks, getHandbookById, deleteHandbook };
