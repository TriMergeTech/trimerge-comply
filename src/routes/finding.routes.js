const { Router } = require('express');
const {
  createFinding,
  listFindings,
  getFindingById,
  updateFinding,
  updateFindingStatus,
  regenerateDraft,
} = require('../controllers/finding.controller');
const { protect, requireRole } = require('../middleware/auth.middleware');

const router = Router();

router.use(protect);

// GET /api/findings — list all findings (scoped to company)
router.get('/', requireRole('analyst', 'reviewer', 'manager', 'director', 'admin', 'viewer'), listFindings);

// POST /api/findings — analyst and above can create
router.post('/', requireRole('analyst', 'manager', 'director', 'admin'), createFinding);

// GET /api/findings/:id — all roles
router.get('/:id', requireRole('analyst', 'reviewer', 'manager', 'director', 'admin', 'viewer'), getFindingById);

// PATCH /api/findings/:id — analyst and above can edit content
router.patch('/:id', requireRole('analyst', 'reviewer', 'manager', 'director', 'admin'), updateFinding);

// PATCH /api/findings/:id/status — status transitions (reviewer validates, director approves)
router.patch('/:id/status', requireRole('analyst', 'reviewer', 'manager', 'director', 'admin'), updateFindingStatus);

// POST /api/findings/:id/regenerate-draft — analyst and above
router.post('/:id/regenerate-draft', requireRole('analyst', 'manager', 'director', 'admin'), regenerateDraft);

module.exports = router;
