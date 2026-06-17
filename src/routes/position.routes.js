const express = require('express');
const {
  getPositionDocumentDetail,
  getPositionDocumentReport,
  listPositionDocuments,
  updatePositionDocumentReview,
  uploadPositionDocument,
} = require('../controllers/position.controller');
const { protect, requireRole } = require('../middleware/auth.middleware');

const ALL_INTERNAL = ['analyst', 'reviewer', 'manager', 'director', 'admin'];

const router = express.Router();

router.get('/', protect, requireRole(...ALL_INTERNAL, 'viewer'), listPositionDocuments);
router.get('/:id', protect, requireRole(...ALL_INTERNAL, 'viewer'), getPositionDocumentDetail);
router.patch('/:id/review', protect, requireRole(...ALL_INTERNAL), updatePositionDocumentReview);
router.get('/:id/report', protect, requireRole(...ALL_INTERNAL), getPositionDocumentReport);

router.post(
  '/upload',
  protect,
  requireRole('analyst', 'manager', 'director', 'admin'),
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
