// Dashboard controller
// Aggregates data from Audit and Flag collections for the dashboard endpoints

const Audit = require('../models/Audit');
const Flag  = require('../models/Flag');
const { sendSuccess } = require('../utils/response');

const POPULATE_CREATED_BY = { path: 'createdBy', select: 'email role' };

/**
 * GET /api/dashboard/summary
 * Returns totals, status/severity breakdowns, and the 5 most recent audits & flags.
 */
const getDashboardSummary = async (req, res, next) => {
  try {
    // Run all queries in parallel for performance
    const [
      totalAudits,
      draftCount,
      processingCount,
      completedCount,
      flaggedCount,
      totalFlags,
      flagsBySeverityRaw,
      flagsByStatusRaw,
      recentAudits,
      recentFlags,
    ] = await Promise.all([
      Audit.countDocuments(),
      Audit.countDocuments({ status: 'draft' }),
      Audit.countDocuments({ status: 'processing' }),
      Audit.countDocuments({ status: 'completed' }),
      Audit.countDocuments({ status: 'flagged' }),
      Flag.countDocuments(),

      // Aggregate flag severity — Flag model uses 'Critical','High','Medium','Low'
      // Map to API spec: Critical+High → high, Medium → medium, Low → low
      Flag.aggregate([
        { $group: { _id: '$severity', count: { $sum: 1 } } },
      ]),

      // Aggregate flag status — Flag model uses 'Pending','Confirmed','Dismissed','Escalated'
      // Map to API spec: Pending+Escalated → open, Confirmed → reviewed, Dismissed → dismissed
      Flag.aggregate([
        { $group: { _id: '$status', count: { $sum: 1 } } },
      ]),

      Audit.find()
        .sort({ createdAt: -1 })
        .limit(5)
        .populate(POPULATE_CREATED_BY),

      Flag.find()
        .sort({ createdAt: -1 })
        .limit(5),
    ]);

    // Map severity aggregation to low/medium/high
    const flagsBySeverity = { low: 0, medium: 0, high: 0 };
    for (const { _id, count } of flagsBySeverityRaw) {
      const key = _id ? _id.toLowerCase() : '';
      if (key === 'low')                    flagsBySeverity.low    += count;
      else if (key === 'medium')            flagsBySeverity.medium += count;
      else if (key === 'high' || key === 'critical') flagsBySeverity.high += count;
    }

    // Map status aggregation to open/reviewed/dismissed
    const flagsByStatus = { open: 0, reviewed: 0, dismissed: 0 };
    for (const { _id, count } of flagsByStatusRaw) {
      const key = _id ? _id.toLowerCase() : '';
      if (key === 'pending' || key === 'escalated') flagsByStatus.open      += count;
      else if (key === 'confirmed')                 flagsByStatus.reviewed  += count;
      else if (key === 'dismissed')                 flagsByStatus.dismissed += count;
    }

    return sendSuccess(res, {
      message: 'Dashboard summary retrieved successfully',
      data: {
        totalAudits,
        auditsByStatus: {
          draft:      draftCount,
          processing: processingCount,
          completed:  completedCount,
          flagged:    flaggedCount,
        },
        totalFlags,
        flagsBySeverity,
        flagsByStatus,
        recentAudits,
        recentFlags,
      },
    });
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/dashboard/export
 * Returns all audits and flags. Requires analyst or admin role (enforced in the route).
 */
const getDashboardExport = async (req, res, next) => {
  try {
    const [audits, flags] = await Promise.all([
      Audit.find().sort({ createdAt: -1 }).populate(POPULATE_CREATED_BY),
      Flag.find().sort({ createdAt: -1 }),
    ]);

    return sendSuccess(res, {
      message: 'Export data retrieved successfully',
      data: { audits, flags },
    });
  } catch (err) {
    next(err);
  }
};

module.exports = { getDashboardSummary, getDashboardExport };
