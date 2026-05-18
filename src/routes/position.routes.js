const express = require('express');
const { uploadPositionDocument } = require('../controllers/position.controller');

const router = express.Router();

router.post(
  '/upload',
  express.raw({
    type: [
      'multipart/form-data',
      'text/plain',
      'text/csv',
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    ],
    limit: '8mb',
  }),
  uploadPositionDocument
);

module.exports = router;
