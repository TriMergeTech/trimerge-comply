const { Router } = require('express');
const {
  createFinding,
  listFindings,
  getFindingById,
  updateFinding,
  updateFindingStatus,
  regenerateDraft,
} = require('../controllers/finding.controller');
const { addEvidence, listEvidence, deleteEvidence, uploadEvidenceFile, getEvidenceDownloadUrl } = require('../controllers/evidence.controller');
const { protect, requireRole } = require('../middleware/auth.middleware');

const router = Router();

router.use(protect);

// GET /api/findings — list all findings (scoped to company)
router.get('/', requireRole('analyst', 'reviewer', 'manager', 'director', 'admin', 'viewer'), listFindings);

// POST /api/findings — analyst and above can create
router.post('/', requireRole('analyst', 'manager', 'director', 'admin'), createFinding);

// GET /api/findings/:id — all roles
router.get('/:id', requireRole('analyst', 'reviewer', 'manager', 'director', 'admin', 'viewer'), getFindingById);

// PATCH /api/findings/:id — analyst and above can edit content
router.patch('/:id', requireRole('analyst', 'reviewer', 'manager', 'director', 'admin'), updateFinding);

// PATCH /api/findings/:id/status — status transitions (reviewer validates, director approves)
router.patch('/:id/status', requireRole('analyst', 'reviewer', 'manager', 'director', 'admin'), updateFindingStatus);

// POST /api/findings/:id/regenerate-draft — analyst and above
router.post('/:id/regenerate-draft', requireRole('analyst', 'manager', 'director', 'admin'), regenerateDraft);

// ── Evidence sub-resource ─────────────────────────────────────────────────────
// GET  /api/findings/:findingId/evidence              — all roles
router.get('/:findingId/evidence', requireRole('analyst', 'reviewer', 'manager', 'director', 'admin', 'viewer'), listEvidence);

// POST /api/findings/:findingId/evidence              — JSON text entry (analyst and above)
router.post('/:findingId/evidence', requireRole('analyst', 'manager', 'director', 'admin'), addEvidence);

// POST /api/findings/:findingId/evidence/upload       — file upload (multipart/form-data)
// Must be registered BEFORE /:evidenceId to avoid the static "upload" segment being captured as a param
router.post(
  '/:findingId/evidence/upload',
  requireRole('analyst', 'manager', 'director', 'admin'),
  require('express').raw({
    type: [
      'multipart/form-data',
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'text/csv',
      'text/plain',
      'image/png',
      'image/jpeg',
    ],
    limit: '10mb',
  }),
  uploadEvidenceFile
);

// GET /api/findings/:findingId/evidence/:evidenceId/file — returns signed download URL (5-min expiry)
// Must be before /:evidenceId to avoid "file" being captured as an evidenceId param
router.get('/:findingId/evidence/:evidenceId/file', requireRole('analyst', 'reviewer', 'manager', 'director', 'admin', 'viewer'), getEvidenceDownloadUrl);

// DELETE /api/findings/:findingId/evidence/:evidenceId — analyst (own) or manager+
router.delete('/:findingId/evidence/:evidenceId', requireRole('analyst', 'manager', 'director', 'admin'), deleteEvidence);

module.exports = router;
