const Audit = require('../models/Audit');
const Flag = require('../models/Flag');
const { sendSuccess } = require('../utils/response');

// ─── Risk Summary Helper ──────────────────────────────────────
const calculateAuditRisk = (flagCounts) => {
  if (flagCounts.high > 0) return 'high';
  if (flagCounts.medium > 0) return 'medium';
  if (flagCounts.low > 0) return 'low';
  return 'none';
};

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
      flagsPerAudit,
    ] = await Promise.all([
      Audit.countDocuments(),
      Audit.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }]),
      Flag.countDocuments(),
      Flag.aggregate([{ $group: { _id: '$severity', count: { $sum: 1 } } }]),
      Flag.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }]),
      Audit.find().sort({ createdAt: -1 }).limit(5).populate('createdBy', 'email role'),
      Flag.find().sort({ createdAt: -1 }).limit(5).populate('auditId', 'name organization'),
      Flag.aggregate([
        {
          $group: {
            _id: { auditId: '$auditId', severity: '$severity', status: '$status' },
            count: { $sum: 1 },
          },
        },
      ]),
    ]);

    const normalizeAgg = (arr) =>
      arr.reduce((acc, item) => {
        acc[item._id] = item.count;
        return acc;
      }, {});

    // Build per-audit risk summaries
    const auditRiskMap = {};
    for (const item of flagsPerAudit) {
      const auditId = item._id.auditId?.toString();
      if (!auditId) continue;
      if (!auditRiskMap[auditId]) {
        auditRiskMap[auditId] = {
          flagsBySeverity: { low: 0, medium: 0, high: 0 },
          flagsByStatus: { open: 0, reviewed: 0, dismissed: 0 },
          totalFlags: 0,
        };
      }
      if (item._id.severity) {
        auditRiskMap[auditId].flagsBySeverity[item._id.severity] =
          (auditRiskMap[auditId].flagsBySeverity[item._id.severity] || 0) + item.count;
      }
      if (item._id.status) {
        auditRiskMap[auditId].flagsByStatus[item._id.status] =
          (auditRiskMap[auditId].flagsByStatus[item._id.status] || 0) + item.count;
      }
      auditRiskMap[auditId].totalFlags += item.count;
    }

    // Add risk level to each audit
    const auditRiskSummaries = Object.entries(auditRiskMap).map(([auditId, data]) => ({
      auditId,
      ...data,
      riskLevel: calculateAuditRisk(data.flagsBySeverity),
    }));

    // Sort by risk — high first
    const riskOrder = { high: 0, medium: 1, low: 2, none: 3 };
    auditRiskSummaries.sort((a, b) => riskOrder[a.riskLevel] - riskOrder[b.riskLevel]);

    // Overall platform risk
    const severityCounts = normalizeAgg(flagsBySeverity);
    const overallRisk =
      (severityCounts.high || 0) > 0
        ? 'high'
        : (severityCounts.medium || 0) > 0
        ? 'medium'
        : (severityCounts.low || 0) > 0
        ? 'low'
        : 'none';

    return sendSuccess(res, {
      message: 'Dashboard summary retrieved successfully',
      data: {
        totalAudits,
        auditsByStatus: normalizeAgg(auditsByStatus),
        totalFlags,
        flagsBySeverity: severityCounts,
        flagsByStatus: normalizeAgg(flagsByStatus),
        overallRisk,
        auditRiskSummaries,
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