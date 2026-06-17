const ActivityLog = require('../models/ActivityLog');
const { sendSuccess } = require('../utils/response');

// GET /api/activity
const getActivityLogs = async (req, res, next) => {
  try {
    const { targetType, action, performedBy, auditId, page = 1, limit = 20 } = req.query;

    const filter = { companyName: req.user.companyName };
    if (targetType) filter.targetType = targetType;
    if (action) filter.action = action;
    if (auditId) filter.auditId = auditId;

    // Analysts and reviewers only see their own activity; managers and above see all
    const restrictedRoles = new Set(['analyst', 'reviewer']);
    if (restrictedRoles.has(req.user.role)) {
      filter.performedBy = req.user._id;
    } else if (performedBy) {
      filter.performedBy = performedBy;
    }

    const parsedPage = Math.max(parseInt(page) || 1, 1);
    const parsedLimit = Math.min(Math.max(parseInt(limit) || 20, 1), 200);
    const skip = (parsedPage - 1) * parsedLimit;
    const [logs, total] = await Promise.all([
      ActivityLog.find(filter)
        .populate('performedBy', 'name email role')
        .populate('auditId', 'name organization')
        .populate('flagId', 'group severity status')
        .populate('findingId', 'observation status risk')
        .populate('handbookId', 'name fileName status')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parsedLimit),
      ActivityLog.countDocuments(filter),
    ]);

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
        finding: log.findingId
          ? { id: log.findingId._id, observation: log.findingId.observation, status: log.findingId.status }
          : null,
        handbook: log.handbookId
          ? { id: log.handbookId._id, name: log.handbookId.name, status: log.handbookId.status }
          : null,
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
          page: parsedPage,
          limit: parsedLimit,
          totalPages: Math.ceil(total / parsedLimit),
        },
      },
    });
  } catch (err) {
    next(err);
  }
};

module.exports = { getActivityLogs };