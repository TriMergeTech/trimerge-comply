const router = require('express').Router();
const { protect, requireVerified, requireRole } = require('../middleware/auth.middleware');
const { getDashboardSummary, getDashboardExport } = require('../controllers/dashboard.controller');

// GET /api/dashboard/summary — any authenticated, verified user
router.get('/summary', protect, requireVerified, getDashboardSummary);

// GET /api/dashboard/export — analyst or admin only
router.get('/export', protect, requireVerified, requireRole('analyst', 'admin'), getDashboardExport);

module.exports = router;
