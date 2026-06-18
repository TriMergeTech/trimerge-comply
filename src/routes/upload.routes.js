const express = require('express');
const { processCsvUpload, listAdverseImpactAnalyses } = require('../controllers/upload.controller');
const { protect, requireRole } = require('../middleware/auth.middleware');

const router = express.Router();

router.get(
  '/csv',
  protect,
  requireRole('analyst', 'reviewer', 'manager', 'director', 'admin'),
  listAdverseImpactAnalyses
);

router.post(
  '/csv',
  protect,
  requireRole('analyst', 'manager', 'director', 'admin'),
  express.raw({
    type: ['multipart/form-data', 'text/csv', 'text/plain'],
    limit: '2mb',
  }),
  processCsvUpload
);

module.exports = router;
