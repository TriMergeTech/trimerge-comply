// Audit controller
// Handles CRUD operations for audits
// Follows the same try/catch → sendSuccess/next(err) pattern as flag.controller.js

const Audit = require('../models/Audit');
const { sendSuccess, sendError } = require('../utils/response');

// Populate helper — always include email and role from the creator
const POPULATE_CREATED_BY = { path: 'createdBy', select: 'email role' };

/**
 * GET /api/audits
 * Returns all audits with pagination.
 */
const getAudits = async (req, res, next) => {
  try {
    const page  = Math.max(1, parseInt(req.query.page)  || 1);
    const limit = Math.min(100, parseInt(req.query.limit) || 20);
    const skip  = (page - 1) * limit;

    const [audits, total] = await Promise.all([
      Audit.find()
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate(POPULATE_CREATED_BY),
      Audit.countDocuments(),
    ]);

    return sendSuccess(res, {
      message: 'OK',
      data: { audits, total, page, pages: Math.ceil(total / limit) },
    });
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/audits/:id
 * Returns a single audit by ID, or 404.
 */
const getAuditById = async (req, res, next) => {
  try {
    const audit = await Audit.findById(req.params.id).populate(POPULATE_CREATED_BY);
    if (!audit) {
      return sendError(res, { statusCode: 404, message: 'Audit not found' });
    }
    return sendSuccess(res, { message: 'OK', data: audit });
  } catch (err) {
    next(err);
  }
};

/**
 * POST /api/audits
 * Creates a new audit. Sets createdBy to the authenticated user.
 */
const createAudit = async (req, res, next) => {
  try {
    const { name, description, organization } = req.body;

    const audit = await Audit.create({
      name,
      description,
      organization,
      createdBy: req.user._id,
    });

    // Populate createdBy before returning
    await audit.populate(POPULATE_CREATED_BY);

    return sendSuccess(res, { statusCode: 201, message: 'Audit created', data: audit });
  } catch (err) {
    next(err);
  }
};

/**
 * PATCH /api/audits/:id
 * Updates an audit. Returns the updated document or 404.
 */
const updateAudit = async (req, res, next) => {
  try {
    const { name, description, organization, status } = req.body;

    const audit = await Audit.findByIdAndUpdate(
      req.params.id,
      { name, description, organization, status },
      { new: true, runValidators: true }
    ).populate(POPULATE_CREATED_BY);

    if (!audit) {
      return sendError(res, { statusCode: 404, message: 'Audit not found' });
    }

    return sendSuccess(res, { message: 'Audit updated', data: audit });
  } catch (err) {
    next(err);
  }
};

/**
 * DELETE /api/audits/:id
 * Deletes an audit. Returns 404 if not found.
 */
const deleteAudit = async (req, res, next) => {
  try {
    const audit = await Audit.findByIdAndDelete(req.params.id);
    if (!audit) {
      return sendError(res, { statusCode: 404, message: 'Audit not found' });
    }
    return sendSuccess(res, { message: 'Audit deleted', data: null });
  } catch (err) {
    next(err);
  }
};

module.exports = { getAudits, getAuditById, createAudit, updateAudit, deleteAudit };
