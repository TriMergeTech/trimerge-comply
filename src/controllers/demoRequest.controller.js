const mongoose = require('mongoose');
const DemoRequest = require('../models/DemoRequest');
const { sendSuccess, sendError } = require('../utils/response');

const DEMO_STATUSES = new Set(['new', 'contacted', 'scheduled', 'closed']);
const STATUS_TRANSITIONS = {
  new: ['contacted'],
  contacted: ['scheduled'],
  scheduled: ['closed'],
  closed: [],
};

// POST /api/demo-requests
const createDemoRequest = async (req, res, next) => {
  try {
    const {
      firstName,
      lastName,
      workEmail,
      organization,
      jobTitle,
      phoneNumber = '',
      companySize,
      role,
      interests = [],
      additionalDetails = '',
    } = req.body;

    const demoRequest = await DemoRequest.create({
      firstName,
      lastName,
      workEmail,
      organization,
      jobTitle,
      phoneNumber,
      companySize,
      role,
      interests: Array.from(new Set(interests)),
      additionalDetails,
    });

    return sendSuccess(res, {
      statusCode: 201,
      message: 'Demo request submitted successfully.',
      data: {
        requestId: demoRequest._id,
        status: demoRequest.status,
        submittedAt: demoRequest.createdAt,
      },
    });
  } catch (err) {
    next(err);
  }
};

// GET /api/demo-requests
const listDemoRequests = async (req, res, next) => {
  try {
    const page = Math.max(Number.parseInt(req.query.page, 10) || 1, 1);
    const limit = Math.min(Math.max(Number.parseInt(req.query.limit, 10) || 20, 1), 100);
    const filter = {};

    if (req.query.status) {
      if (!DEMO_STATUSES.has(req.query.status)) {
        return sendError(res, {
          statusCode: 422,
          message: 'Invalid demo request status.',
          errors: [{
            field: 'status',
            message: 'Use one of: new, contacted, scheduled, closed.',
          }],
        });
      }

      filter.status = req.query.status;
    }

    const [requests, total] = await Promise.all([
      DemoRequest.find(filter)
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      DemoRequest.countDocuments(filter),
    ]);

    return sendSuccess(res, {
      message: 'Demo requests retrieved successfully.',
      data: {
        requests,
        pagination: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit),
        },
      },
    });
  } catch (err) {
    next(err);
  }
};

// PATCH /api/demo-requests/:id/status
const updateDemoRequestStatus = async (req, res, next) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return sendError(res, {
        statusCode: 400,
        message: 'Invalid demo request id.',
      });
    }

    const demoRequest = await DemoRequest.findById(req.params.id);

    if (!demoRequest) {
      return sendError(res, {
        statusCode: 404,
        message: 'Demo request not found.',
      });
    }

    const nextStatus = req.body.status;

    if (demoRequest.status !== nextStatus) {
      const allowedStatuses = STATUS_TRANSITIONS[demoRequest.status] || [];

      if (!allowedStatuses.includes(nextStatus)) {
        return sendError(res, {
          statusCode: 400,
          message: `Cannot change demo request status from ${demoRequest.status} to ${nextStatus}.`,
          errors: [{
            field: 'status',
            message: allowedStatuses.length
              ? `Allowed next status: ${allowedStatuses.join(', ')}.`
              : 'This demo request is already closed.',
          }],
        });
      }

      demoRequest.status = nextStatus;
      await demoRequest.save();
    }

    return sendSuccess(res, {
      message: 'Demo request status updated successfully.',
      data: {
        request: demoRequest,
      },
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  createDemoRequest,
  listDemoRequests,
  updateDemoRequestStatus,
};
