const Flag = require('../models/Flag');
const { chiSquarePValue1df } = require('../services/analytics/statisticalEngine');
const { sendSuccess, sendError } = require('../utils/response');

const SEVERITY_SUFFIX = {
  critical: ' This flag is rated CRITICAL severity and requires immediate escalation.',
  high: ' This flag is rated HIGH severity and requires immediate review.',
  medium: ' This flag is rated MEDIUM severity and should be reviewed promptly.',
  low: ' This flag is rated LOW severity.',
};

const generateExplanation = (flag) => {
  const { threshold = 0.8, severity, testType, pValue } = flag;
  const thresholdPct = (threshold * 100).toFixed(1);
  const severitySuffix = SEVERITY_SUFFIX[severity] || '';

  // CSV-based adverse impact flag — data lives in results object
  if (flag.results && flag.results.demographicGroup) {
    const { jobTitle, stage, demographicGroup, fourFifthsRule, chiSquare, fishersExact } = flag.results;
    const ratioPct = fourFifthsRule != null ? (fourFifthsRule * 100).toFixed(1) : 'N/A';
    const belowThreshold = fourFifthsRule != null && fourFifthsRule < threshold;

    let explanation = `The ${demographicGroup} group`;
    if (jobTitle) explanation += ` in the "${jobTitle}" role`;
    if (stage) explanation += ` (${stage} stage)`;
    explanation += ` has a four-fifths rule ratio of ${ratioPct}% — `;
    explanation += belowThreshold
      ? `below the ${thresholdPct}% threshold, indicating potential adverse impact.`
      : `at or above the ${thresholdPct}% threshold, no adverse impact detected.`;

    if (fishersExact != null) {
      explanation += ` Fisher's Exact Test p-value: ${fishersExact} (${fishersExact < 0.05 ? 'statistically significant' : 'not statistically significant'}).`;
    }
    if (chiSquare != null) {
      const chiPValue = Number(chiSquarePValue1df(chiSquare).toFixed(4));
      explanation += ` Chi-Square p-value: ${chiPValue} (${chiPValue < 0.05 ? 'statistically significant' : 'not statistically significant'}).`;
    }

    return explanation + severitySuffix;
  }

  // Audit-linked flag — data on top-level fields
  const { group, referenceGroup, selectionRate, impactRatio } = flag;
  const selectionPct = selectionRate != null ? (selectionRate * 100).toFixed(1) : 'N/A';
  const impactPct = impactRatio != null ? (impactRatio * 100).toFixed(1) : 'N/A';
  const belowThreshold = impactRatio != null && impactRatio < threshold;

  let explanation = `The ${group || 'unknown'} group has a selection rate of ${selectionPct}%`;
  if (referenceGroup) explanation += ` compared to the reference group (${referenceGroup})`;
  explanation += `, resulting in an impact ratio of ${impactPct}% — `;
  explanation += belowThreshold
    ? `below the ${thresholdPct}% threshold, indicating potential adverse impact.`
    : `at or above the ${thresholdPct}% threshold, no adverse impact detected.`;

  if (pValue != null) {
    const label = testType === 'fisher_exact' ? "Fisher's Exact Test" : 'Chi-Square Test';
    explanation += ` ${label} p-value: ${pValue} (${pValue < 0.05 ? 'statistically significant (p < 0.05)' : 'not statistically significant (p ≥ 0.05)'}).`;
  }

  return explanation + severitySuffix;
};

// GET /api/flags
const getFlags = async (req, res, next) => {
  try {
    const { auditId, status, severity, testType, page = 1, limit = 20 } = req.query;

    const filter = { organizationId: req.user.organizationId };
    if (auditId) filter.auditId = auditId;
    if (status) filter.status = status;
    if (severity) filter.severity = severity;
    if (testType) filter.testType = testType;

    const parsedPage = Math.max(parseInt(page) || 1, 1);
    const parsedLimit = Math.min(Math.max(parseInt(limit) || 20, 1), 100);
    const skip = (parsedPage - 1) * parsedLimit;
    const [flags, total] = await Promise.all([
      Flag.find(filter)
        .populate('auditId', 'name organization status')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parsedLimit),
      Flag.countDocuments(filter),
    ]);

    return sendSuccess(res, {
      message: 'Flags retrieved successfully',
      data: {
        flags,
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

// GET /api/flags/:id
const getFlagById = async (req, res, next) => {
  try {
    const flag = await Flag.findOne({
      _id: req.params.id,
      organizationId: req.user.organizationId,
    }).populate('auditId', 'name organization status');

    if (!flag) {
      return sendError(res, { statusCode: 404, message: 'Flag not found' });
    }

    const explanation = generateExplanation(flag);
    return sendSuccess(res, {
      message: 'Flag retrieved successfully',
      data: { flag, explanation },
    });
  } catch (err) {
    next(err);
  }
};

module.exports = { getFlags, getFlagById };