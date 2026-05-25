const express = require('express');
const {
  getPositionDocumentDetail,
  getPositionDocumentReport,
  listPositionDocuments,
  updatePositionDocumentReview,
  uploadPositionDocument,
} = require('../controllers/position.controller');
const { optionalProtect } = require('../middleware/auth.middleware');

const router = express.Router();

router.get('/', optionalProtect, listPositionDocuments);
router.get('/:id', optionalProtect, getPositionDocumentDetail);
router.patch('/:id/review', optionalProtect, updatePositionDocumentReview);
router.get('/:id/report', optionalProtect, getPositionDocumentReport);

router.post(
  '/upload',
  optionalProtect,
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
