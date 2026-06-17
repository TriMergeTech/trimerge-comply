const router  = require('express').Router();
const multer  = require('multer');
const { protect, requireVerified } = require('../middleware/auth.middleware');
const { uploadPosition, getPositions, getPositionById } = require('../controllers/position.controller');

const upload = multer({
  storage: multer.memoryStorage(),
  limits:  { fileSize: 10 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (/\.(txt|csv|pdf|docx)$/i.test(file.originalname)) {
      cb(null, true);
    } else {
      cb(new Error('Only .txt, .csv, .pdf, or .docx files are accepted'));
    }
  },
});

router.post('/upload', protect, requireVerified, upload.single('file'), uploadPosition);
router.get('/',        protect, requireVerified, getPositions);
router.get('/:id',     protect, requireVerified, getPositionById);

module.exports = router;
