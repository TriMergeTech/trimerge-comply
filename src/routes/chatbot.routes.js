const express = require('express');
const {
  askSupportChat,
  getSupportRagStatus,
  reindexSupportRag,
} = require('../controllers/chatbot.controller');
const { protect, requireRole } = require('../middleware/auth.middleware');
const { chatbotAskRules, validate } = require('../middleware/validate.middleware');

const router = express.Router();

const ALL_ROLES = ['analyst', 'reviewer', 'manager', 'director', 'admin', 'viewer'];

router.use(protect);

router.post('/support/ask', requireRole(...ALL_ROLES), chatbotAskRules, validate, askSupportChat);
router.get('/support/rag/status', requireRole('admin'), getSupportRagStatus);
router.post('/support/rag/reindex', requireRole('admin'), reindexSupportRag);

module.exports = router;
