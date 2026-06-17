const Flag = require('../models/Flag');
const { sendSuccess, sendError } = require('../utils/response');

const generateExplanation = (flag) => {
  const { group, referenceGroup, selectionRate, impactRatio, threshold, testType, pValue, severity, flagged } = flag;
  const selectionPct = (selectionRate * 100).toFixed(1);
  const impactPct = (impactRatio * 100).toFixed(1);
  const thresholdPct = (threshold * 100).toFixed(1);
  let explanation = `The ${group} group has a selection rate of ${selectionPct}% compared to the reference group (${referenceGroup}), resulting in an impact ratio of ${impactPct}% — `;
  explanation += flagged
    ? `below the ${thresholdPct}% threshold, indicating potential adverse impact.`
    : `above the ${thresholdPct}% threshold, no adverse impact detected.`;
  if (pValue !== null && pValue !== undefined) {
    const significant = pValue < 0.05;
    explanation += ` ${testType === 'fisher_exact' ? "Fisher's Exact Test" : 'Chi-Square Test'} returned a p-value of ${pValue}, which is ${significant ? 'statistically significant (p < 0.05)' : 'not statistically significant (p ≥ 0.05)'}.`;
  }
  if (severity === 'high') {
    explanation += ' This flag is rated HIGH severity and requires immediate review.';
  } else if (severity === 'medium') {
    explanation += ' This flag is rated MEDIUM severity and should be reviewed promptly.';
  } else {
    explanation += ' This flag is rated LOW severity.';
  }
  return explanation;
};

// GET /api/flags
const getFlags = async (req, res, next) => {
  try {
    const { auditId, status, severity, testType, page = 1, limit = 20 } = req.query;

    const filter = { companyName: req.user.companyName };
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
      companyName: req.user.companyName,
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