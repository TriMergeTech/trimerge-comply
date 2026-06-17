const express = require('express');
const { listPayEquityAnalyses, uploadPayEquityCsv } = require('../controllers/payequity.controller');
const { protect, requireRole } = require('../middleware/auth.middleware');

const router = express.Router();

router.get('/', protect, requireRole('analyst', 'reviewer', 'manager', 'director', 'admin'), listPayEquityAnalyses);

router.post(
  '/upload',
  protect,
  requireRole('analyst', 'manager', 'director', 'admin'),
  express.raw({
    type: [
      'multipart/form-data',
      'text/csv',
      'text/plain',
      'application/pdf',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    ],
    limit: '8mb',
  }),
  uploadPayEquityCsv
);

module.exports = router;
