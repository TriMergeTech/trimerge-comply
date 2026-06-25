const { Router } = require('express');
const { getDashboardSummary, exportDashboard } = require('../controllers/dashboard.controller');
const { protect, requireRole } = require('../middleware/auth.middleware');

const router = Router();

// All dashboard routes require authentication
router.use(protect);

// GET /api/dashboard/summary — all roles
router.get('/summary', requireRole('analyst', 'reviewer', 'manager', 'director', 'admin', 'viewer'), getDashboardSummary);

// GET /api/dashboard/export — manager and above only
router.get('/export', requireRole('manager', 'director', 'admin'), exportDashboard);

module.exports = router;