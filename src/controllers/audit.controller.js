const Audit = require('../models/Audit');
const { sendSuccess, sendError } = require('../utils/response');

// POST /api/audits
const createAudit = async (req, res, next) => {
  try {
    const { name, description, organization } = req.body;
    const audit = await Audit.create({
      name,
      description,
      organization,
      createdBy: req.user._id,
    });
    return sendSuccess(res, {
      statusCode: 201,
      message: 'Audit created successfully',
      data: { audit },
    });
  } catch (err) {
    next(err);
  }
};

// GET /api/audits
const getAudits = async (req, res, next) => {
  try {
    const audits = await Audit.find()
      .populate('createdBy', 'email role')
      .sort({ createdAt: -1 });
    return sendSuccess(res, {
      message: 'Audits retrieved successfully',
      data: { audits, total: audits.length },
    });
  } catch (err) {
    next(err);
  }
};

// GET /api/audits/:id
const getAuditById = async (req, res, next) => {
  try {
    const audit = await Audit.findById(req.params.id).populate('createdBy', 'email role');
    if (!audit) {
      return sendError(res, { statusCode: 404, message: 'Audit not found' });
    }
    return sendSuccess(res, {
      message: 'Audit retrieved successfully',
      data: { audit },
    });
  } catch (err) {
    next(err);
  }
};

// PATCH /api/audits/:id
const updateAudit = async (req, res, next) => {
  try {
    const { name, description, organization, status } = req.body;
    const audit = await Audit.findById(req.params.id);
    if (!audit) {
      return sendError(res, { statusCode: 404, message: 'Audit not found' });
    }
    if (name !== undefined) audit.name = name;
    if (description !== undefined) audit.description = description;
    if (organization !== undefined) audit.organization = organization;
    if (status !== undefined) audit.status = status;
    await audit.save();
    return sendSuccess(res, {
      message: 'Audit updated successfully',
      data: { audit },
    });
  } catch (err) {
    next(err);
  }
};

// DELETE /api/audits/:id
const deleteAudit = async (req, res, next) => {
  try {
    const audit = await Audit.findByIdAndDelete(req.params.id);
    if (!audit) {
      return sendError(res, { statusCode: 404, message: 'Audit not found' });
    }
    return sendSuccess(res, { message: 'Audit deleted successfully' });
  } catch (err) {
    next(err);
  }
};

module.exports = { createAudit, getAudits, getAuditById, updateAudit, deleteAudit };