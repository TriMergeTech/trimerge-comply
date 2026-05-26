const router = require('express').Router();
const multer = require('multer');
const { protect, requireVerified } = require('../middleware/auth.middleware');
const { uploadPayEquity, getPayEquityAnalyses } = require('../controllers/payequity.controller');

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB max
  fileFilter: (_req, file, cb) => {
    if (file.originalname.endsWith('.csv') || file.mimetype === 'text/csv') {
      cb(null, true);
    } else {
      cb(new Error('Only CSV files are accepted'));
    }
  },
});

// POST /api/payequity/upload — upload CSV, run analysis, return result
router.post('/upload', protect, requireVerified, upload.single('file'), uploadPayEquity);

// GET /api/payequity — list all pay equity analyses (newest first)
router.get('/', protect, requireVerified, getPayEquityAnalyses);

module.exports = router;
