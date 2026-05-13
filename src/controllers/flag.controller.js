const Flag = require('../models/Flag');
const { sendSuccess, sendError } = require('../utils/response');

// GET /api/flags
const getFlags = async (req, res, next) => {
  try {
    const {
      auditId,
      status,
      severity,
      testType,
      page = 1,
      limit = 20,
    } = req.query;

    const filter = {};
    if (auditId) filter.auditId = auditId;
    if (status) filter.status = status;
    if (severity) filter.severity = severity;
    if (testType) filter.testType = testType;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [flags, total] = await Promise.all([
      Flag.find(filter)
        .populate('auditId', 'name organization status')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit)),
      Flag.countDocuments(filter),
    ]);

    return sendSuccess(res, {
      message: 'Flags retrieved successfully',
      data: {
        flags,
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

// GET /api/flags/:id
const getFlagById = async (req, res, next) => {
  try {
    const flag = await Flag.findById(req.params.id).populate(
      'auditId',
      'name organization status'
    );
    if (!flag) {
      return sendError(res, { statusCode: 404, message: 'Flag not found' });
    }
    return sendSuccess(res, {
      message: 'Flag retrieved successfully',
      data: { flag },
    });
  } catch (err) {
    next(err);
  }
};

module.exports = { getFlags, getFlagById };
