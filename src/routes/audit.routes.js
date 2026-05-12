const { Router } = require('express');
const {
  createAudit,
  getAudits,
  getAuditById,
  updateAudit,
  deleteAudit,
} = require('../controllers/audit.controller');
const { protect, requireRole } = require('../middleware/auth.middleware');

const router = Router();

// All audit routes require authentication
router.use(protect);

// POST /api/audits — analyst, admin
router.post('/', requireRole('analyst', 'admin'), createAudit);

// GET /api/audits — all roles
router.get('/', requireRole('analyst', 'admin', 'viewer'), getAudits);

// GET /api/audits/:id — all roles
router.get('/:id', requireRole('analyst', 'admin', 'viewer'), getAuditById);

// PATCH /api/audits/:id — analyst, admin
router.patch('/:id', requireRole('analyst', 'admin'), updateAudit);

// DELETE /api/audits/:id — admin only
router.delete('/:id', requireRole('admin'), deleteAudit);

module.exports = router;