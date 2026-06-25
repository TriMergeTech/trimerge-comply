const express = require('express');
const { Router } = express;
const {
  uploadHandbook,
  listHandbooks,
  getHandbookById,
  deleteHandbook,
} = require('../controllers/handbook.controller');
const { protect, requireRole } = require('../middleware/auth.middleware');

const router = Router();

router.use(protect);

// GET /api/handbooks
router.get('/', requireRole('analyst', 'reviewer', 'manager', 'director', 'admin', 'viewer'), listHandbooks);

// GET /api/handbooks/:id
router.get('/:id', requireRole('analyst', 'reviewer', 'manager', 'director', 'admin', 'viewer'), getHandbookById);

// DELETE /api/handbooks/:id — director and admin (handbook is company-wide, high impact)
router.delete('/:id', requireRole('director', 'admin'), deleteHandbook);

// POST /api/handbooks/upload — must be after /:id to avoid Express treating 'upload' as an ID
router.post(
  '/upload',
  requireRole('manager', 'director', 'admin'),
  express.raw({
    type: [
      'multipart/form-data',
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    ],
    limit: '20mb',
  }),
  uploadHandbook
);

module.exports = router;
