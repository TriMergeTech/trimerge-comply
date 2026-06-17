const { Router } = require('express');
const {
  createAudit,
  getAudits,
  getAuditById,
  updateAudit,
  deleteAudit,
  exportAudits,
  getAuditReport,
} = require('../controllers/audit.controller');
const { listFindings } = require('../controllers/finding.controller');
const { protect, requireRole } = require('../middleware/auth.middleware');

const router = Router();

// All audit routes require authentication
router.use(protect);

// POST /api/audits — analyst and above (not reviewer or viewer)
router.post('/', requireRole('analyst', 'manager', 'director', 'admin'), createAudit);

// GET /api/audits/export — must be BEFORE /:id or Express will treat 'export' as an ID
router.get('/export', requireRole('analyst', 'manager', 'director', 'admin'), exportAudits);

// GET /api/audits — all roles
router.get('/', requireRole('analyst', 'reviewer', 'manager', 'director', 'admin', 'viewer'), getAudits);

// GET /api/audits/:id — all roles
router.get('/:id', requireRole('analyst', 'reviewer', 'manager', 'director', 'admin', 'viewer'), getAuditById);

// PATCH /api/audits/:id — manager and above
router.patch('/:id', requireRole('analyst', 'manager', 'director', 'admin'), updateAudit);

// DELETE /api/audits/:id — director and admin only
router.delete('/:id', requireRole('director', 'admin'), deleteAudit);

// GET /api/audits/:auditId/findings — all roles
router.get('/:auditId/findings', requireRole('analyst', 'reviewer', 'manager', 'director', 'admin', 'viewer'), listFindings);

// GET /api/audits/:id/report — all roles except viewer can download
router.get('/:id/report', requireRole('analyst', 'reviewer', 'manager', 'director', 'admin'), getAuditReport);

module.exports = router;