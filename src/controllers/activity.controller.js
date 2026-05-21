const ActivityLog = require('../models/ActivityLog');
const { sendSuccess } = require('../utils/response');

// GET /api/activity
const getActivityLogs = async (req, res, next) => {
  try {
    const {
      targetType,
      action,
      performedBy,
      auditId,
      page = 1,
      limit = 20,
    } = req.query;

    const filter = {};
    if (targetType) filter.targetType = targetType;
    if (action) filter.action = action;
    if (performedBy) filter.performedBy = performedBy;
    if (auditId) filter.auditId = auditId;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [logs, total] = await Promise.all([
      ActivityLog.find(filter)
        .populate('performedBy', 'name email role')
        .populate('auditId', 'name organization')
        .populate('flagId', 'group severity status')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit)),
      ActivityLog.countDocuments(filter),
    ]);

    // Format into table-friendly shape
    const formatted = logs.map((log) => ({
      id: log._id,
      user: log.performedBy
        ? { name: log.performedBy.name, email: log.performedBy.email, role: log.performedBy.role }
        : null,
      action: log.action,
      target: {
        type: log.targetType,
        audit: log.auditId ? { id: log.auditId._id, name: log.auditId.name } : null,
        flag: log.flagId ? { id: log.flagId._id, group: log.flagId.group, severity: log.flagId.severity } : null,
      },
      details: log.details,
      date: log.createdAt,
    }));

    return sendSuccess(res, {
      message: 'Activity logs retrieved successfully',
      data: {
        logs: formatted,
        pagination: {
          total,
          page: parseInt(page),
          limit: parseInt(limit),
          totalPages: Math.ceil(total / parseInt(limit)),
        },
      },
    });
  } catch (err) {
    next(err);
  }
};

module.exports = { getActivityLogs };