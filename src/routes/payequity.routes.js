const express = require('express');
const { listPayEquityAnalyses, uploadPayEquityCsv } = require('../controllers/payequity.controller');
const { optionalProtect } = require('../middleware/auth.middleware');

const router = express.Router();

router.get('/', optionalProtect, listPayEquityAnalyses);

router.post(
  '/upload',
  optionalProtect,
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
