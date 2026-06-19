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
const { requestDeletion, listDeletionRequests, reviewDeletionRequest } = require('../controllers/auditDeletion.controller');
const { listFindings } = require('../controllers/finding.controller');
const { protect, requireRole } = require('../middleware/auth.middleware');

const router = Router();

// All audit routes require authentication
router.use(protect);

// POST /api/audits — analyst and above (not reviewer or viewer)
router.post('/', requireRole('analyst', 'manager', 'director', 'admin'), createAudit);

// ── Static paths first (must come before /:id to avoid param capture) ──

// GET /api/audits/export
router.get('/export', requireRole('analyst', 'manager', 'director', 'admin'), exportAudits);

// GET /api/audits/deletion-requests — director sees own, admin sees all
router.get('/deletion-requests', requireRole('director', 'admin'), listDeletionRequests);

// PATCH /api/audits/deletion-requests/:requestId/review — director only
router.patch('/deletion-requests/:requestId/review', requireRole('director'), reviewDeletionRequest);

// ── Collection routes ──

// GET /api/audits — all roles
router.get('/', requireRole('analyst', 'reviewer', 'manager', 'director', 'admin', 'viewer'), getAudits);

// ── Param routes ──

// GET /api/audits/:id
router.get('/:id', requireRole('analyst', 'reviewer', 'manager', 'director', 'admin', 'viewer'), getAuditById);

// PATCH /api/audits/:id
router.patch('/:id', requireRole('analyst', 'manager', 'director', 'admin'), updateAudit);

// DELETE /api/audits/:id — director and admin only, mandatory deletionNotes in body
router.delete('/:id', requireRole('director', 'admin'), deleteAudit);

// POST /api/audits/:id/deletion-request — manager, analyst, reviewer (not viewer, not director/admin who delete directly)
router.post('/:id/deletion-request', requireRole('manager', 'analyst', 'reviewer'), requestDeletion);

// GET /api/audits/:auditId/findings
router.get('/:auditId/findings', requireRole('analyst', 'reviewer', 'manager', 'director', 'admin', 'viewer'), listFindings);

// GET /api/audits/:id/report
router.get('/:id/report', requireRole('analyst', 'reviewer', 'manager', 'director', 'admin'), getAuditReport);

module.exports = router;