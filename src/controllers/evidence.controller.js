const Finding           = require('../models/Finding');
const Evidence          = require('../models/Evidence');
const Flag              = require('../models/Flag');
const PayEquityAnalysis = require('../models/PayEquityAnalysis');
const PositionDocument  = require('../models/PositionDocument');
const ActivityLog       = require('../models/ActivityLog');
const { uploadRawToCloudinary } = require('../services/storage/cloudinary.service');
const { extractFileFromMultipart } = require('../utils/multipart');
const { sendSuccess, sendError } = require('../utils/response');

// Findings that are locked from further evidence changes
const LOCKED = ['approved', 'closed'];

const EVIDENCE_FOLDER = 'trimerge-comply/evidence';

const ALLOWED_MIME_TYPES = new Set([
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'text/csv',
  'text/plain',
  'image/png',
  'image/jpeg',
  'image/jpg',
]);

const FRIENDLY_TYPES = {
  'application/pdf': 'PDF',
  'application/msword': 'Word document',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'Word document',
  'application/vnd.ms-excel': 'Excel spreadsheet',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': 'Excel spreadsheet',
  'text/csv': 'CSV file',
  'text/plain': 'text file',
  'image/png': 'image',
  'image/jpeg': 'image',
  'image/jpg': 'image',
};

const MAX_FILE_BYTES = 10 * 1024 * 1024; // 10 MB

// ── Auto-population helpers ───────────────────────────────────────────────────

const fromFlag = (flag) => {
  const lines = [];
  if (flag.name)                 lines.push(`Flag: ${flag.name}`);
  if (flag.group)                lines.push(`Group: ${flag.group}`);
  if (flag.referenceGroup)       lines.push(`Reference Group: ${flag.referenceGroup}`);
  if (flag.selectionRate != null) lines.push(`Selection Rate: ${(flag.selectionRate * 100).toFixed(1)}%`);
  if (flag.impactRatio   != null) lines.push(`Impact Ratio: ${(flag.impactRatio * 100).toFixed(1)}%`);
  if (flag.threshold     != null) lines.push(`Threshold (Four-Fifths Rule): ${(flag.threshold * 100).toFixed(0)}%`);
  if (flag.testType)             lines.push(`Statistical Test: ${flag.testType}`);
  if (flag.pValue        != null) lines.push(`P-Value: ${flag.pValue.toFixed(4)}`);
  if (flag.severity)             lines.push(`Severity: ${flag.severity}`);
  const r = flag.results;
  if (r) {
    if (r.jobTitle)          lines.push(`Job Title: ${r.jobTitle}`);
    if (r.stage)             lines.push(`Selection Stage: ${r.stage}`);
    if (r.demographicGroup)  lines.push(`Demographic Group: ${r.demographicGroup}`);
    if (r.fourFifthsRule != null) lines.push(`Four-Fifths Rule Ratio: ${(r.fourFifthsRule * 100).toFixed(1)}%`);
    if (r.chiSquare      != null) lines.push(`Chi-Square Statistic: ${r.chiSquare.toFixed(4)}`);
    if (r.fishersExact   != null) lines.push(`Fisher's Exact P-Value: ${r.fishersExact.toFixed(4)}`);
  }
  return {
    type:    'statistical_result',
    title:   `Adverse Impact Flag: ${flag.name || flag.group || 'Statistical Flag'}`,
    content: lines.join('\n'),
  };
};

const fromPayEquity = (analysis, gapIndex = 0) => {
  const lines = [`Analysis File: ${analysis.fileName}`];
  const gap = Array.isArray(analysis.payGaps) ? analysis.payGaps[gapIndex] : null;
  if (gap) {
    if (gap.group)            lines.push(`Group: ${gap.group}`);
    if (gap.referenceGroup)   lines.push(`Reference Group: ${gap.referenceGroup}`);
    if (gap.adjustedGap   != null) lines.push(`Adjusted Pay Gap: ${(gap.adjustedGap * 100).toFixed(1)}%`);
    if (gap.unadjustedGap != null) lines.push(`Unadjusted Pay Gap: ${(gap.unadjustedGap * 100).toFixed(1)}%`);
    if (gap.pValue        != null) lines.push(`P-Value: ${gap.pValue.toFixed(4)}`);
    if (gap.significant   != null) lines.push(`Statistically Significant: ${gap.significant ? 'Yes' : 'No'}`);
    if (gap.sampleSize    != null) lines.push(`Sample Size: ${gap.sampleSize}`);
  } else if (analysis.summary) {
    const s = analysis.summary;
    lines.push(typeof s === 'string' ? s.slice(0, 1000) : JSON.stringify(s).slice(0, 1000));
  }
  const label = gap?.group
    ? `${gap.group} vs ${gap.referenceGroup || 'Reference'}`
    : analysis.fileName;
  return {
    type:    'statistical_result',
    title:   `Pay Equity Analysis: ${label}`,
    content: lines.join('\n'),
  };
};

const fromPosition = (doc) => {
  const lines = [`Document: ${doc.fileName}`];
  if (doc.standardsReview) {
    lines.push('Standards Review:');
    const r = doc.standardsReview;
    lines.push(typeof r === 'string' ? r.slice(0, 1500)
      : r.summary ? r.summary.slice(0, 1500)
      : JSON.stringify(r).slice(0, 1500));
  } else if (doc.extractedTextPreview) {
    lines.push('Document Extract:');
    lines.push(doc.extractedTextPreview.slice(0, 1000));
  }
  return {
    type:    'data_extract',
    title:   `Position Document: ${doc.fileName}`,
    content: lines.join('\n'),
  };
};

// ── Route handlers ────────────────────────────────────────────────────────────

// POST /api/findings/:findingId/evidence
const addEvidence = async (req, res, next) => {
  try {
    const { findingId } = req.params;
    const {
      source = 'manual', sourceId, gapIndex,
      type, title, description = '', content = '',
      interviewee, interviewDate,
    } = req.body;

    const finding = await Finding.findOne({ _id: findingId, organizationId: req.user.organizationId });
    if (!finding) return sendError(res, { statusCode: 404, message: 'Finding not found.' });
    if (LOCKED.includes(finding.status)) {
      return sendError(res, {
        statusCode: 400,
        message: `Evidence cannot be added to a finding with status "${finding.status}".`,
      });
    }

    // Build payload — auto-populate when a known source is given
    let payload = { type, title, description, content };

    if (source === 'flag' && sourceId) {
      const flag = await Flag.findOne({ _id: sourceId, organizationId: req.user.organizationId });
      if (!flag) return sendError(res, { statusCode: 404, message: 'Flag not found.' });
      const auto = fromFlag(flag);
      payload = { ...auto, title: title || auto.title, description, content: content || auto.content };

    } else if (source === 'payequity' && sourceId) {
      const analysis = await PayEquityAnalysis.findOne({ _id: sourceId, organizationId: req.user.organizationId });
      if (!analysis) return sendError(res, { statusCode: 404, message: 'Pay equity analysis not found.' });
      const auto = fromPayEquity(analysis, gapIndex ?? 0);
      payload = { ...auto, title: title || auto.title, description, content: content || auto.content };

    } else if (source === 'position' && sourceId) {
      const doc = await PositionDocument.findOne({ _id: sourceId, organizationId: req.user.organizationId });
      if (!doc) return sendError(res, { statusCode: 404, message: 'Position document not found.' });
      const auto = fromPosition(doc);
      payload = { ...auto, title: title || auto.title, description, content: content || auto.content };
    }

    if (!payload.type)       return sendError(res, { statusCode: 400, message: 'type is required.' });
    if (!payload.title?.trim()) return sendError(res, { statusCode: 400, message: 'title is required.' });

    const evidence = await Evidence.create({
      findingId:     finding._id,
      auditId:       finding.auditId,
      organizationId: req.user.organizationId,
      type:          payload.type,
      source,
      sourceId:      sourceId || null,
      title:         payload.title.trim(),
      description:   payload.description,
      content:       payload.content,
      interviewee:   interviewee || null,
      interviewDate: interviewDate || null,
      collectedBy:   req.user._id,
      collectedAt:   new Date(),
    });

    await ActivityLog.create({
      targetType:     'finding',
      targetId:       finding._id,
      auditId:        finding.auditId,
      findingId:      finding._id,
      performedBy:    req.user._id,
      organizationId: req.user.organizationId,
      action:         'evidence_added',
      details:        { evidenceId: evidence._id, type: evidence.type, source, title: evidence.title },
    });

    return sendSuccess(res, { statusCode: 201, message: 'Evidence added.', data: { evidence } });
  } catch (err) {
    next(err);
  }
};

// GET /api/findings/:findingId/evidence
const listEvidence = async (req, res, next) => {
  try {
    const { findingId } = req.params;
    const finding = await Finding.findOne({ _id: findingId, organizationId: req.user.organizationId });
    if (!finding) return sendError(res, { statusCode: 404, message: 'Finding not found.' });

    const evidence = await Evidence.find({ findingId: finding._id })
      .populate('collectedBy', 'name email role')
      .sort({ createdAt: 1 });

    return sendSuccess(res, { message: 'Evidence retrieved.', data: { evidence, total: evidence.length } });
  } catch (err) {
    next(err);
  }
};

// DELETE /api/findings/:findingId/evidence/:evidenceId
const deleteEvidence = async (req, res, next) => {
  try {
    const { findingId, evidenceId } = req.params;

    const finding = await Finding.findOne({ _id: findingId, organizationId: req.user.organizationId });
    if (!finding) return sendError(res, { statusCode: 404, message: 'Finding not found.' });
    if (LOCKED.includes(finding.status)) {
      return sendError(res, {
        statusCode: 400,
        message: `Evidence cannot be removed from a finding with status "${finding.status}".`,
      });
    }

    const evidence = await Evidence.findOne({ _id: evidenceId, findingId: finding._id });
    if (!evidence) return sendError(res, { statusCode: 404, message: 'Evidence not found.' });

    const canDelete =
      ['manager', 'director', 'admin'].includes(req.user.role) ||
      evidence.collectedBy.toString() === req.user._id.toString();
    if (!canDelete) {
      return sendError(res, { statusCode: 403, message: 'You can only remove evidence you added.' });
    }

    await Evidence.findByIdAndDelete(evidenceId);

    await ActivityLog.create({
      targetType:     'finding',
      targetId:       finding._id,
      auditId:        finding.auditId,
      findingId:      finding._id,
      performedBy:    req.user._id,
      organizationId: req.user.organizationId,
      action:         'evidence_removed',
      details:        { evidenceId: evidence._id, type: evidence.type, source: evidence.source, title: evidence.title },
    });

    return sendSuccess(res, { message: 'Evidence removed.' });
  } catch (err) {
    next(err);
  }
};

// POST /api/findings/:findingId/evidence/upload  (multipart/form-data)
// Form fields: file (binary, required), type (string), title (string), description (string), content (string)
const VALID_EVIDENCE_TYPES = [
  'document', 'statistical_result', 'interview_note',
  'policy_excerpt', 'data_extract', 'observation_note',
];

const uploadEvidenceFile = async (req, res, next) => {
  try {
    const { findingId } = req.params;

    const finding = await Finding.findOne({ _id: findingId, organizationId: req.user.organizationId });
    if (!finding) return sendError(res, { statusCode: 404, message: 'Finding not found.' });
    if (LOCKED.includes(finding.status)) {
      return sendError(res, {
        statusCode: 400,
        message: `Evidence cannot be added to a finding with status "${finding.status}".`,
      });
    }

    const contentType = req.headers['content-type'] || '';
    const payload = extractFileFromMultipart(req.body, contentType);
    if (!payload?.fileBuffer?.length) {
      return sendError(res, { statusCode: 400, message: 'No file found in request. Send a multipart/form-data body with a "file" field.' });
    }

    const { fileBuffer, fileName, mimeType } = payload;
    const normalizedMime = mimeType.split(';')[0].trim().toLowerCase();

    if (!ALLOWED_MIME_TYPES.has(normalizedMime)) {
      return sendError(res, {
        statusCode: 415,
        message: `File type "${normalizedMime}" is not supported. Allowed: PDF, Word, Excel, CSV, plain text, PNG, JPEG.`,
      });
    }

    if (fileBuffer.length > MAX_FILE_BYTES) {
      return sendError(res, { statusCode: 413, message: 'File exceeds the 10 MB limit.' });
    }

    const title       = (req.query.title       || fileName).trim();
    const description = (req.query.description || '').trim();
    const content     = (req.query.content     || '').trim();
    const type        = VALID_EVIDENCE_TYPES.includes(req.query.type) ? req.query.type : 'document';

    const storage = await uploadRawToCloudinary({
      fileContent:  fileBuffer,
      fileName,
      mimeType:     normalizedMime,
      folder:       EVIDENCE_FOLDER,
      publicAccess: true,
    });

    const evidence = await Evidence.create({
      findingId:      finding._id,
      auditId:        finding.auditId,
      organizationId: req.user.organizationId,
      type,
      source:         'manual',
      title,
      description,
      content,
      file: {
        fileName,
        fileUrl:   storage.secureUrl,
        publicId:  storage.publicId,
        mimeType:  normalizedMime,
        sizeBytes: fileBuffer.length,
      },
      collectedBy: req.user._id,
      collectedAt: new Date(),
    });

    await ActivityLog.create({
      targetType:     'finding',
      targetId:       finding._id,
      auditId:        finding.auditId,
      findingId:      finding._id,
      performedBy:    req.user._id,
      organizationId: req.user.organizationId,
      action:         'evidence_added',
      details: {
        evidenceId: evidence._id,
        type,
        source:    'manual',
        title,
        fileType:  FRIENDLY_TYPES[normalizedMime] || normalizedMime,
        sizeBytes: fileBuffer.length,
      },
    });

    return sendSuccess(res, {
      statusCode: 201,
      message:    `${FRIENDLY_TYPES[normalizedMime] || 'File'} uploaded and attached to finding.`,
      data:       { evidence },
    });
  } catch (err) {
    next(err);
  }
};

// GET /api/findings/:findingId/evidence/:evidenceId/file
// Returns a short-lived (5-min) signed Cloudinary URL so the frontend can open/download the file.
const getEvidenceDownloadUrl = async (req, res, next) => {
  try {
    const { findingId, evidenceId } = req.params;

    const finding = await Finding.findOne({ _id: findingId, organizationId: req.user.organizationId });
    if (!finding) return sendError(res, { statusCode: 404, message: 'Finding not found.' });

    const evidence = await Evidence.findOne({ _id: evidenceId, findingId: finding._id });
    if (!evidence) return sendError(res, { statusCode: 404, message: 'Evidence not found.' });
    if (!evidence.file?.publicId) {
      return sendError(res, { statusCode: 404, message: 'This evidence item has no attached file.' });
    }

    return sendSuccess(res, {
      message: 'Download URL generated.',
      data: {
        url:      evidence.file.fileUrl,
        fileName: evidence.file.fileName,
        mimeType: evidence.file.mimeType,
      },
    });
  } catch (err) {
    next(err);
  }
};

module.exports = { addEvidence, listEvidence, deleteEvidence, uploadEvidenceFile, getEvidenceDownloadUrl };
