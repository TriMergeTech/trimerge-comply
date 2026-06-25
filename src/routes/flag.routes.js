const { Router } = require('express');
const { getFlags, getFlagById } = require('../controllers/flag.controller');
const { decideFlag, assignFlag } = require('../controllers/analyst.controller');
const { protect, requireRole } = require('../middleware/auth.middleware');

const router = Router();

// All flag routes require authentication
router.use(protect);

// GET /api/flags — all roles
router.get('/', requireRole('analyst', 'reviewer', 'manager', 'director', 'admin', 'viewer'), getFlags);

// GET /api/flags/:id — all roles
router.get('/:id', requireRole('analyst', 'reviewer', 'manager', 'director', 'admin', 'viewer'), getFlagById);

// POST /api/flags/:id/decide — analyst and above (not viewer)
router.post('/:id/decide', requireRole('analyst', 'reviewer', 'manager', 'director', 'admin'), decideFlag);

// PATCH /api/flags/:id/assign — manager and above only
router.patch('/:id/assign', requireRole('manager', 'director', 'admin'), assignFlag);

module.exports = router;