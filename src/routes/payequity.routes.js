const express = require('express');
const { uploadPayEquityCsv } = require('../controllers/payequity.controller');

const router = express.Router();

router.post(
  '/upload',
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
