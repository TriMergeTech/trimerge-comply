const { Router } = require('express');
const { listDirectors } = require('../controllers/user.controller');
const { protect, requireRole } = require('../middleware/auth.middleware');

const router = Router();

router.use(protect);

// GET /api/users/directors — roles that route deletion requests need to pick a director
router.get('/directors', requireRole('analyst', 'reviewer', 'manager', 'director', 'admin'), listDirectors);

module.exports = router;
