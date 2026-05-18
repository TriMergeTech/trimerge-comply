const Audit = require('../models/Audit');
const Flag = require('../models/Flag');
const { sendSuccess } = require('../utils/response');

// GET /api/dashboard/summary
const getDashboardSummary = async (req, res, next) => {
  try {
    const [
      totalAudits,
      auditsByStatus,
      totalFlags,
      flagsBySeverity,
      flagsByStatus,
      recentAudits,
      recentFlags,
    ] = await Promise.all([
      // Total audits
      Audit.countDocuments(),

      // Audits grouped by status
      Audit.aggregate([
        { $group: { _id: '$status', count: { $sum: 1 } } },
      ]),

      // Total flags
      Flag.countDocuments(),

      // Flags grouped by severity
      Flag.aggregate([
        { $group: { _id: '$severity', count: { $sum: 1 } } },
      ]),

      // Flags grouped by status
      Flag.aggregate([
        { $group: { _id: '$status', count: { $sum: 1 } } },
      ]),

      // 5 most recent audits
      Audit.find()
        .sort({ createdAt: -1 })
        .limit(5)
        .populate('createdBy', 'email role'),

      // 5 most recent flags
      Flag.find()
        .sort({ createdAt: -1 })
        .limit(5)
        .populate('auditId', 'name organization'),
    ]);

    // Normalize aggregation arrays into objects
    const normalizeAgg = (arr) =>
      arr.reduce((acc, item) => {
        acc[item._id] = item.count;
        return acc;
      }, {});

    return sendSuccess(res, {
      message: 'Dashboard summary retrieved successfully',
      data: {
        totalAudits,
        auditsByStatus: normalizeAgg(auditsByStatus),
        totalFlags,
        flagsBySeverity: normalizeAgg(flagsBySeverity),
        flagsByStatus: normalizeAgg(flagsByStatus),
        recentAudits,
        recentFlags,
      },
    });
  } catch (err) {
    next(err);
  }
};

// GET /api/dashboard/export
const exportDashboard = async (req, res, next) => {
  try {
    const [audits, flags] = await Promise.all([
      Audit.find().sort({ createdAt: -1 }).populate('createdBy', 'email role'),
      Flag.find().sort({ createdAt: -1 }).populate('auditId', 'name organization'),
    ]);

    return sendSuccess(res, {
      message: 'Export data retrieved successfully',
      data: { audits, flags },
    });
  } catch (err) {
    next(err);
  }
};

module.exports = { getDashboardSummary, exportDashboard };