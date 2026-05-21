const { Router } = require('express');
const { getActivityLogs } = require('../controllers/activity.controller');
const { protect, requireRole } = require('../middleware/auth.middleware');

const router = Router();

router.use(protect);

// GET /api/activity — analyst, admin
router.get('/', requireRole('analyst', 'admin'), getActivityLogs);

module.exports = router;