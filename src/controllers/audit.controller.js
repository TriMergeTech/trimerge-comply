const Audit = require('../models/Audit');
const Finding = require('../models/Finding');
const ActivityLog = require('../models/ActivityLog');
const { renderFindingsRegisterPdf } = require('../services/findings/findingsReport.service');
const { sendSuccess, sendError } = require('../utils/response');

// POST /api/audits
const createAudit = async (req, res, next) => {
  try {
    const { name, description, organization, clientName, auditType } = req.body;
    const audit = await Audit.create({
      name,
      description,
      organization,
      clientName,
      auditType,
      createdBy: req.user._id,
      companyName: req.user.companyName,
    });

    await ActivityLog.create({
      targetType: 'audit',
      targetId: audit._id,
      auditId: audit._id,
      performedBy: req.user._id,
      companyName: req.user.companyName,
      action: 'audit_created',
      details: {
        name: audit.name,
        description: audit.description,
        organization: audit.organization,
        clientName: audit.clientName,
        auditType: audit.auditType,
      },
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
    const { clientName, auditType, auditName, status } = req.query;
    const filter = { companyName: req.user.companyName };

    if (clientName) {
      filter.$or = [
        { clientName: { $regex: clientName, $options: 'i' } },
        { organization: { $regex: clientName, $options: 'i' } },
      ];
    }
    if (auditType) filter.auditType = { $regex: auditType, $options: 'i' };
    if (auditName) filter.name = { $regex: auditName, $options: 'i' };
    if (status) filter.status = status;

    const audits = await Audit.find(filter)
      .populate('createdBy', 'name email role companyName')
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
    const audit = await Audit.findOne({
      _id: req.params.id,
      companyName: req.user.companyName,
    }).populate('createdBy', 'name email role companyName');

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
    const { name, description, organization, status, clientName, auditType } = req.body;
    const audit = await Audit.findOne({
      _id: req.params.id,
      companyName: req.user.companyName,
    });

    if (!audit) {
      return sendError(res, { statusCode: 404, message: 'Audit not found' });
    }

    const ownerOnlyRoles = new Set(['analyst', 'reviewer']);
    if (ownerOnlyRoles.has(req.user.role) && audit.createdBy.toString() !== req.user._id.toString()) {
      return sendError(res, { statusCode: 403, message: 'You can only update audits you created.' });
    }

    const changes = {};
    if (name !== undefined) { changes.name = { from: audit.name, to: name }; audit.name = name; }
    if (description !== undefined) { changes.description = { from: audit.description, to: description }; audit.description = description; }
    if (organization !== undefined) { changes.organization = { from: audit.organization, to: organization }; audit.organization = organization; }
    if (status !== undefined) { changes.status = { from: audit.status, to: status }; audit.status = status; }
    if (clientName !== undefined) { changes.clientName = { from: audit.clientName, to: clientName }; audit.clientName = clientName; }
    if (auditType !== undefined) { changes.auditType = { from: audit.auditType, to: auditType }; audit.auditType = auditType; }

    await audit.save();

    await ActivityLog.create({
      targetType: 'audit',
      targetId: audit._id,
      auditId: audit._id,
      performedBy: req.user._id,
      companyName: req.user.companyName,
      action: 'audit_updated',
      details: { changes },
    });

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
    const audit = await Audit.findOne({
      _id: req.params.id,
      companyName: req.user.companyName,
    });

    if (!audit) {
      return sendError(res, { statusCode: 404, message: 'Audit not found' });
    }

    const ownerOnlyRoles = new Set(['analyst', 'manager']);
    if (ownerOnlyRoles.has(req.user.role) && audit.createdBy.toString() !== req.user._id.toString()) {
      return sendError(res, { statusCode: 403, message: 'You can only delete audits you created.' });
    }

    await Audit.findByIdAndDelete(req.params.id);

    await ActivityLog.create({
      targetType: 'audit',
      targetId: audit._id,
      auditId: audit._id,
      performedBy: req.user._id,
      companyName: req.user.companyName,
      action: 'audit_deleted',
      details: { name: audit.name, organization: audit.organization },
    });

    return sendSuccess(res, { message: 'Audit deleted successfully' });
  } catch (err) {
    next(err);
  }
};

// GET /api/audits/export
const exportAudits = async (req, res, next) => {
  try {
    const { clientName, auditType, status, ids, auditName } = req.query;
    const filter = { companyName: req.user.companyName };

    if (clientName) {
      filter.$or = [
        { clientName: { $regex: clientName, $options: 'i' } },
        { organization: { $regex: clientName, $options: 'i' } },
      ];
    }
    if (auditType) filter.auditType = { $regex: auditType, $options: 'i' };
    if (auditName) filter.name = { $regex: auditName, $options: 'i' };
    if (status) filter.status = status;
    if (ids) {
      const idArray = ids.split(',').map((id) => id.trim());
      filter._id = { $in: idArray };
    }

    const audits = await Audit.find(filter)
      .populate('createdBy', 'name email role')
      .sort({ createdAt: -1 });

    const headers = [
      'Audit ID', 'Name', 'Description', 'Status', 'Organization',
      'Client Name', 'Audit Type', 'Created By (Name)', 'Created By (Email)',
      'Created By (Role)', 'Created At', 'Updated At',
    ];

    const rows = audits.map((audit) => [
      audit._id,
      audit.name || '',
      audit.description || '',
      audit.status || '',
      audit.organization || '',
      audit.clientName || '',
      audit.auditType || '',
      audit.createdBy?.name || '',
      audit.createdBy?.email || '',
      audit.createdBy?.role || '',
      audit.createdAt ? new Date(audit.createdAt).toISOString() : '',
      audit.updatedAt ? new Date(audit.updatedAt).toISOString() : '',
    ]);

    const csvLines = [headers, ...rows].map((row) =>
      row.map((field) => `"${String(field).replace(/"/g, '""')}"`).join(',')
    );

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="audits-export.csv"');
    return res.send(csvLines.join('\n'));
  } catch (err) {
    next(err);
  }
};

// GET /api/audits/:id/report — streams Findings Register PDF
const getAuditReport = async (req, res, next) => {
  try {
    const audit = await Audit.findOne({
      _id: req.params.id,
      companyName: req.user.companyName,
    }).populate('createdBy', 'name email');

    if (!audit) {
      return sendError(res, { statusCode: 404, message: 'Audit not found.' });
    }

    const findings = await Finding.find({ auditId: audit._id })
      .populate('flagId', 'group referenceGroup severity testType pValue selectionRate impactRatio')
      .populate('assignedTo', 'name')
      .populate('reviewedBy', 'name')
      .populate('handbookReference.handbookId', 'name')
      .sort({ 'risk.level': 1, createdAt: 1 })
      .lean();

    const safeName = (audit.name || 'audit').toLowerCase().replace(/[^a-z0-9]+/g, '-');
    const dateStamp = new Date().toISOString().slice(0, 10);

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="findings-register-${safeName}-${dateStamp}.pdf"`
    );

    renderFindingsRegisterPdf({
      outputStream: res,
      audit,
      findings,
      generatedBy: req.user.name || req.user.email,
    });
  } catch (err) {
    next(err);
  }
};

module.exports = { createAudit, getAudits, getAuditById, updateAudit, deleteAudit, exportAudits, getAuditReport };