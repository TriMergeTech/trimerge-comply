const router = require('express').Router();
const multer = require('multer');
const { protect } = require('../middleware/auth.middleware');
const { uploadCsv, getUploads } = require('../controllers/upload.controller');

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const allowed = ['text/csv', 'application/vnd.ms-excel', 'application/octet-stream'];
    if (allowed.includes(file.mimetype) || file.originalname.endsWith('.csv')) {
      cb(null, true);
    } else {
      cb(new Error('Only CSV files are accepted'));
    }
  },
});

router.post('/csv', protect, upload.single('file'), uploadCsv);
router.get('/', protect, getUploads);

module.exports = router;
