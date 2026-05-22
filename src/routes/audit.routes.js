const router = require('express').Router();
const { protect, requireVerified } = require('../middleware/auth.middleware');
const {
  getAudits,
  getAuditById,
  createAudit,
  updateAudit,
  deleteAudit,
} = require('../controllers/audit.controller');

// All audit routes require a valid, verified user
router.use(protect, requireVerified);

router.get('/',     getAudits);
router.get('/:id',  getAuditById);
router.post('/',    createAudit);
router.patch('/:id', updateAudit);
router.delete('/:id', deleteAudit);

module.exports = router;
