const { Router } = require('express');
const { getFlags, getFlagById } = require('../controllers/flag.controller');
const { decideFlag, assignFlag } = require('../controllers/analyst.controller');
const { protect, requireRole } = require('../middleware/auth.middleware');

const router = Router();

// All flag routes require authentication
router.use(protect);

// GET /api/flags — all roles
router.get('/', requireRole('analyst', 'admin', 'viewer'), getFlags);

// GET /api/flags/:id — all roles
router.get('/:id', requireRole('analyst', 'admin', 'viewer'), getFlagById);

// POST /api/flags/:id/decide — analyst, admin
router.post('/:id/decide', requireRole('analyst', 'admin'), decideFlag);

// PATCH /api/flags/:id/assign — analyst, admin
router.patch('/:id/assign', requireRole('analyst', 'admin'), assignFlag);

module.exports = router;