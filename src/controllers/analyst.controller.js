const Flag = require('../models/Flag');
const ActivityLog = require('../models/ActivityLog');
const { sendSuccess, sendError } = require('../utils/response');

// POST /api/flags/:id/decide
const decideFlag = async (req, res, next) => {
  try {
    const { decision, reason } = req.body;

    if (!['approved', 'dismissed'].includes(decision)) {
      return sendError(res, {
        statusCode: 400,
        message: 'Decision must be either approved or dismissed.',
      });
    }

    const flag = await Flag.findOne({
      _id: req.params.id,
      organizationId: req.user.organizationId,
    });

    if (!flag) {
      return sendError(res, { statusCode: 404, message: 'Flag not found' });
    }

    if (flag.status !== 'open') {
      return sendError(res, { statusCode: 400, message: 'Flag has already been reviewed.' });
    }

    const newStatus = decision === 'approved' ? 'reviewed' : 'dismissed';

    const updated = await Flag.findByIdAndUpdate(
      flag._id,
      { $set: { status: newStatus } },
      { new: true }
    );

    await ActivityLog.create({
      targetType: 'flag',
      targetId: flag._id,
      flagId: flag._id,
      auditId: flag.auditId,
      performedBy: req.user._id,
      organizationId: req.user.organizationId,
      action: 'flag_decided',
      details: { decision, reason: reason || null },
    });

    return sendSuccess(res, {
      message: `Flag ${decision} successfully.`,
      data: { flag: updated },
    });
  } catch (err) {
    next(err);
  }
};

// PATCH /api/flags/:id/assign
const assignFlag = async (req, res, next) => {
  try {
    const { assignedTo } = req.body;

    if (!assignedTo) {
      return sendError(res, { statusCode: 400, message: 'assignedTo user ID is required.' });
    }

    const flag = await Flag.findOneAndUpdate(
      { _id: req.params.id, organizationId: req.user.organizationId },
      { $set: { assignedTo } },
      { new: true }
    );

    if (!flag) {
      return sendError(res, { statusCode: 404, message: 'Flag not found' });
    }

    await ActivityLog.create({
      targetType: 'flag',
      targetId: flag._id,
      flagId: flag._id,
      auditId: flag.auditId,
      performedBy: req.user._id,
      organizationId: req.user.organizationId,
      action: 'flag_assigned',
      details: { assignedTo },
    });

    return sendSuccess(res, {
      message: 'Flag assigned successfully.',
      data: { flag, assignedTo },
    });
  } catch (err) {
    next(err);
  }
};

module.exports = { decideFlag, assignFlag };
