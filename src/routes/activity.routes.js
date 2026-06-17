const { Router } = require('express');
const { getActivityLogs } = require('../controllers/activity.controller');
const { protect, requireRole } = require('../middleware/auth.middleware');

const router = Router();

router.use(protect);

// GET /api/activity — all internal roles (not client viewer)
router.get('/', requireRole('analyst', 'reviewer', 'manager', 'director', 'admin'), getActivityLogs);

module.exports = router;