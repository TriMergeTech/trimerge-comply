const { Router } = require('express');
const { getFlags, getFlagById } = require('../controllers/flag.controller');
const { protect, requireRole } = require('../middleware/auth.middleware');

const router = Router();

// All flag routes require authentication
router.use(protect);

// GET /api/flags — all roles
router.get('/', requireRole('analyst', 'admin', 'viewer'), getFlags);

// GET /api/flags/:id — all roles
router.get('/:id', requireRole('analyst', 'admin', 'viewer'), getFlagById);

module.exports = router;