const express = require('express');
const { uploadPositionDocument } = require('../controllers/position.controller');

const router = express.Router();

router.post(
  '/upload',
  express.raw({
    type: ['multipart/form-data', 'text/plain', 'text/csv'],
    limit: '2mb',
  }),
  uploadPositionDocument
);

module.exports = router;
