const Audit = require('../models/Audit');
const AuditDeletionRequest = require('../models/AuditDeletionRequest');
const ActivityLog = require('../models/ActivityLog');
const User = require('../models/User');
const { sendSuccess, sendError } = require('../utils/response');

const MIN_NOTES_LENGTH = 10;

const validateNotes = (notes, label) => {
  if (!notes?.trim()) return `${label} are required.`;
  if (notes.trim().length < MIN_NOTES_LENGTH) return `${label} must be at least ${MIN_NOTES_LENGTH} characters.`;
  return null;
};

// POST /api/audits/:id/deletion-request
// Roles: manager, analyst, reviewer
const requestDeletion = async (req, res, next) => {
  try {
    const { deletionNotes, directorId } = req.body;

    const notesError = validateNotes(deletionNotes, 'Deletion notes');
    if (notesError) return sendError(res, { statusCode: 400, message: notesError });

    if (!directorId) {
      return sendError(res, { statusCode: 400, message: 'An Engagement Director must be selected to route the deletion request.' });
    }

    const audit = await Audit.findOne({
      _id: req.params.id,
      organizationId: req.user.organizationId,
    });
    if (!audit) return sendError(res, { statusCode: 404, message: 'Audit not found.' });

    // Verify the selected director exists, is in this org, and holds the director role
    const director = await User.findOne({
      _id: directorId,
      organizationId: req.user.organizationId,
      role: 'director',
    }).select('_id name email role');
    if (!director) {
      return sendError(res, { statusCode: 400, message: 'Selected user is not an Engagement Director in this organization.' });
    }

    // Block duplicate pending requests for the same audit
    const existingPending = await AuditDeletionRequest.findOne({
      auditId: audit._id,
      status: 'pending',
    });
    if (existingPending) {
      return sendError(res, {
        statusCode: 409,
        message: 'A deletion request for this audit is already pending review by the Engagement Director.',
      });
    }

    // Capture audit state at request time — preserved for compliance even after deletion
    const auditSnapshot = {
      name: audit.name,
      description: audit.description,
      organization: audit.organization,
      clientName: audit.clientName,
      auditType: audit.auditType,
      status: audit.status,
      createdAt: audit.createdAt,
    };

    const request = await AuditDeletionRequest.create({
      auditId: audit._id,
      auditSnapshot,
      organizationId: req.user.organizationId,
      requestedBy: req.user._id,
      deletionNotes: deletionNotes.trim(),
      directorId: director._id,
    });

    await ActivityLog.create({
      targetType: 'audit',
      targetId: audit._id,
      auditId: audit._id,
      performedBy: req.user._id,
      organizationId: req.user.organizationId,
      action: 'deletion_requested',
      details: {
        requestId: request._id,
        deletionNotes: deletionNotes.trim(),
        routedTo: { id: director._id, name: director.name, email: director.email },
        auditName: audit.name,
      },
    });

    return sendSuccess(res, {
      statusCode: 201,
      message: 'Deletion request submitted and routed to the Engagement Director for review.',
      data: {
        request: {
          _id: request._id,
          auditId: audit._id,
          auditName: audit.name,
          directorId: director._id,
          directorName: director.name,
          status: request.status,
          createdAt: request.createdAt,
        },
      },
    });
  } catch (err) {
    next(err);
  }
};

// GET /api/audits/deletion-requests
// Directors see only requests routed to them; admins see all in org
const listDeletionRequests = async (req, res, next) => {
  try {
    const { status } = req.query;

    const filter = { organizationId: req.user.organizationId };
    if (req.user.role === 'director') filter.directorId = req.user._id;
    if (status) filter.status = status;

    const requests = await AuditDeletionRequest.find(filter)
      .populate('requestedBy', 'name email role')
      .populate('directorId', 'name email role')
      .populate('reviewedBy', 'name email role')
      .populate('auditId', 'name organization status')
      .sort({ createdAt: -1 });

    return sendSuccess(res, {
      message: 'Deletion requests retrieved successfully.',
      data: { requests, total: requests.length },
    });
  } catch (err) {
    next(err);
  }
};

// PATCH /api/audits/deletion-requests/:requestId/review
// Director only — approve or reject with mandatory notes
const reviewDeletionRequest = async (req, res, next) => {
  try {
    const { decision, approvalNotes } = req.body;

    if (!['approved', 'rejected'].includes(decision)) {
      return sendError(res, { statusCode: 400, message: 'Decision must be "approved" or "rejected".' });
    }

    const notesError = validateNotes(approvalNotes, 'Approval/rejection notes');
    if (notesError) return sendError(res, { statusCode: 400, message: notesError });

    const deletionRequest = await AuditDeletionRequest.findOne({
      _id: req.params.requestId,
      directorId: req.user._id,
      organizationId: req.user.organizationId,
    }).populate('requestedBy', 'name email');

    if (!deletionRequest) {
      return sendError(res, { statusCode: 404, message: 'Deletion request not found or not assigned to you.' });
    }
    if (deletionRequest.status !== 'pending') {
      return sendError(res, { statusCode: 409, message: `This request has already been ${deletionRequest.status}.` });
    }

    const now = new Date();

    if (decision === 'approved') {
      const audit = await Audit.findOne({
        _id: deletionRequest.auditId,
        organizationId: req.user.organizationId,
      });
      if (!audit) {
        return sendError(res, { statusCode: 404, message: 'Audit no longer exists.' });
      }

      await Audit.findByIdAndDelete(deletionRequest.auditId);

      await ActivityLog.create({
        targetType: 'audit',
        targetId: deletionRequest.auditId,
        auditId: deletionRequest.auditId,
        performedBy: req.user._id,
        organizationId: req.user.organizationId,
        action: 'deletion_approved',
        details: {
          requestId: deletionRequest._id,
          approvalNotes: approvalNotes.trim(),
          requestedBy: { id: deletionRequest.requestedBy._id, name: deletionRequest.requestedBy.name },
          originalDeletionNotes: deletionRequest.deletionNotes,
          auditSnapshot: deletionRequest.auditSnapshot,
        },
      });

      await ActivityLog.create({
        targetType: 'audit',
        targetId: deletionRequest.auditId,
        auditId: deletionRequest.auditId,
        performedBy: req.user._id,
        organizationId: req.user.organizationId,
        action: 'audit_deleted',
        details: {
          deletedVia: 'approval_workflow',
          requestId: deletionRequest._id,
          auditSnapshot: deletionRequest.auditSnapshot,
        },
      });
    } else {
      await ActivityLog.create({
        targetType: 'audit',
        targetId: deletionRequest.auditId,
        auditId: deletionRequest.auditId,
        performedBy: req.user._id,
        organizationId: req.user.organizationId,
        action: 'deletion_rejected',
        details: {
          requestId: deletionRequest._id,
          approvalNotes: approvalNotes.trim(),
          requestedBy: { id: deletionRequest.requestedBy._id, name: deletionRequest.requestedBy.name },
          originalDeletionNotes: deletionRequest.deletionNotes,
        },
      });
    }

    await AuditDeletionRequest.findByIdAndUpdate(deletionRequest._id, {
      status: decision === 'approved' ? 'approved' : 'rejected',
      reviewedBy: req.user._id,
      reviewedAt: now,
      approvalNotes: approvalNotes.trim(),
    });

    return sendSuccess(res, {
      message: `Deletion request ${decision}.`,
      data: {
        requestId: deletionRequest._id,
        decision,
        auditId: deletionRequest.auditId,
        reviewedAt: now,
      },
    });
  } catch (err) {
    next(err);
  }
};

module.exports = { requestDeletion, listDeletionRequests, reviewDeletionRequest };
