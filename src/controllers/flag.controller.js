const Flag = require('../models/Flag');
const { sendSuccess, sendError } = require('../utils/response');

// ────────────────────────────────────────────────────────────
// GET /api/flags
// ────────────────────────────────────────────────────────────
const getFlags = async (req, res, next) => {
  try {
    const { auditId, status, severity, testType, page = 1, limit = 20 } = req.query;

    const filter = {};
    if (auditId) filter.auditId = auditId;
    if (status) filter.status = status;
    if (severity) filter.severity = severity;
    if (testType) filter.testType = testType;

    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.min(100, Math.max(1, parseInt(limit)));
    const skip = (pageNum - 1) * limitNum;

    const [flags, total] = await Promise.all([
      Flag.find(filter).sort('-createdAt').skip(skip).limit(limitNum),
      Flag.countDocuments(filter),
    ]);

    return sendSuccess(res, {
      data: {
        flags,
        total,
        page: pageNum,
        pages: Math.ceil(total / limitNum),
      },
    });
  } catch (err) {
    next(err);
  }
};

// ────────────────────────────────────────────────────────────
// GET /api/flags/:id
// ────────────────────────────────────────────────────────────
const getFlagById = async (req, res, next) => {
  try {
    const flag = await Flag.findById(req.params.id);
    if (!flag) {
      return sendError(res, { statusCode: 404, message: 'Flag not found.' });
    }
    return sendSuccess(res, { data: flag });
  } catch (err) {
    next(err);
  }
};

module.exports = { getFlags, getFlagById };
