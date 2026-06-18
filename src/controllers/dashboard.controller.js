const Audit = require('../models/Audit');
const Flag = require('../models/Flag');
const { sendSuccess } = require('../utils/response');

const calculateAuditRisk = (flagCounts) => {
  if (flagCounts.high > 0) return 'high';
  if (flagCounts.medium > 0) return 'medium';
  if (flagCounts.low > 0) return 'low';
  return 'none';
};

const toCSV = (headers, rows) => {
  const lines = [headers, ...rows].map((row) =>
    row.map((field) => `"${String(field ?? '').replace(/"/g, '""')}"`).join(',')
  );
  return lines.join('\n');
};

// GET /api/dashboard/summary
const getDashboardSummary = async (req, res, next) => {
  try {
    const company = { organizationId: req.user.organizationId };

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
      Audit.countDocuments(company),
      Audit.aggregate([{ $match: company }, { $group: { _id: '$status', count: { $sum: 1 } } }]),
      Flag.countDocuments(company),
      Flag.aggregate([{ $match: company }, { $group: { _id: '$severity', count: { $sum: 1 } } }]),
      Flag.aggregate([{ $match: company }, { $group: { _id: '$status', count: { $sum: 1 } } }]),
      Audit.find(company).sort({ createdAt: -1 }).limit(5).populate('createdBy', 'email role'),
      Flag.find(company).sort({ createdAt: -1 }).limit(5).populate('auditId', 'name organization'),
      Flag.aggregate([
        { $match: company },
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

    const auditRiskSummaries = Object.entries(auditRiskMap).map(([auditId, data]) => ({
      auditId,
      ...data,
      riskLevel: calculateAuditRisk(data.flagsBySeverity),
    }));

    const riskOrder = { high: 0, medium: 1, low: 2, none: 3 };
    auditRiskSummaries.sort((a, b) => riskOrder[a.riskLevel] - riskOrder[b.riskLevel]);

    const severityCounts = normalizeAgg(flagsBySeverity);
    const overallRisk =
      (severityCounts.high || 0) > 0 ? 'high'
      : (severityCounts.medium || 0) > 0 ? 'medium'
      : (severityCounts.low || 0) > 0 ? 'low'
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
    const company = { organizationId: req.user.organizationId };

    const [audits, flags] = await Promise.all([
      Audit.find(company).sort({ createdAt: -1 }).populate('createdBy', 'name email role'),
      Flag.find(company).sort({ createdAt: -1 }).populate('auditId', 'name organization'),
    ]);

    const auditHeaders = [
      'Audit ID', 'Name', 'Description', 'Status', 'Organization',
      'Client Name', 'Audit Type', 'Created By (Name)', 'Created By (Email)',
      'Created By (Role)', 'Created At', 'Updated At',
    ];
    const auditRows = audits.map((a) => [
      a._id,
      a.name || '',
      a.description || '',
      a.status || '',
      a.organization || '',
      a.clientName || '',
      a.auditType || '',
      a.createdBy?.name || '',
      a.createdBy?.email || '',
      a.createdBy?.role || '',
      a.createdAt ? new Date(a.createdAt).toISOString() : '',
      a.updatedAt ? new Date(a.updatedAt).toISOString() : '',
    ]);

    const flagHeaders = [
      'Flag ID', 'Audit Name', 'Audit Organization', 'Group', 'Reference Group',
      'Selected', 'Total', 'Selection Rate', 'Impact Ratio', 'Threshold',
      'Test Type', 'P-Value', 'Severity', 'Status', 'Created At',
    ];
    const flagRows = flags.map((f) => [
      f._id,
      f.auditId?.name || '',
      f.auditId?.organization || '',
      f.group || '',
      f.referenceGroup || '',
      f.selected ?? '',
      f.total ?? '',
      f.selectionRate ?? '',
      f.impactRatio ?? '',
      f.threshold ?? '',
      f.testType || '',
      f.pValue ?? '',
      f.severity || '',
      f.status || '',
      f.createdAt ? new Date(f.createdAt).toISOString() : '',
    ]);

    const combined = `AUDITS\n${toCSV(auditHeaders, auditRows)}\n\nFLAGS\n${toCSV(flagHeaders, flagRows)}`;

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="dashboard-export.csv"');
    return res.send(combined);
  } catch (err) {
    next(err);
  }
};

module.exports = { getDashboardSummary, exportDashboard };