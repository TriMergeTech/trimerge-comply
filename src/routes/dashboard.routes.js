const { Router } = require('express');
const { getDashboardSummary, exportDashboard } = require('../controllers/dashboard.controller');
const { protect, requireRole } = require('../middleware/auth.middleware');

const router = Router();

// All dashboard routes require authentication
router.use(protect);

// GET /api/dashboard/summary — all roles
router.get('/summary', requireRole('analyst', 'admin', 'viewer'), getDashboardSummary);

// GET /api/dashboard/export — analyst, admin only
router.get('/export', requireRole('analyst', 'admin'), exportDashboard);

module.exports = router;