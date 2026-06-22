const express = require('express');
const rateLimit = require('express-rate-limit');
const {
  createDemoRequest,
  listDemoRequests,
  updateDemoRequestStatus,
} = require('../controllers/demoRequest.controller');
const { protect, requireRole } = require('../middleware/auth.middleware');
const {
  demoRequestRules,
  demoRequestStatusRules,
  validate,
} = require('../middleware/validate.middleware');

const router = express.Router();

const demoRequestLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many demo requests submitted. Please try again later.',
  },
});

router.post('/', demoRequestLimiter, demoRequestRules, validate, createDemoRequest);

router.get(
  '/',
  protect,
  requireRole('manager', 'director', 'admin'),
  listDemoRequests
);

router.patch(
  '/:id/status',
  protect,
  requireRole('manager', 'director', 'admin'),
  demoRequestStatusRules,
  validate,
  updateDemoRequestStatus
);

module.exports = router;
