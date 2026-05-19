const router = require('express').Router();
const { protect } = require('../middleware/auth.middleware');
const { getFlags, getFlagById } = require('../controllers/flag.controller');

router.get('/', protect, getFlags);
router.get('/:id', protect, getFlagById);

module.exports = router;
