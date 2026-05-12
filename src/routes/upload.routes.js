const express = require('express');
const { processCsvUpload } = require('../controllers/upload.controller');

const router = express.Router();

// Temporary service-test endpoint. Later this can be replaced with file upload
// middleware and Cloudinary storage while keeping the analytics service call.
router.post(
  '/csv',
  express.text({ type: ['text/csv', 'text/plain'], limit: '1mb' }),
  processCsvUpload
);

module.exports = router;
