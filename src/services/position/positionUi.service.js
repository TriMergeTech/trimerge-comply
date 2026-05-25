const { getUploaderLabel } = require('../../utils/uploadedBy');

const countPositionFlags = (analysis) =>
  Array.isArray(analysis?.findings) ? analysis.findings.length : 0;

const normalizePositionStatus = (status) => {
  if (status === 'completed' || status === 'failed') {
    return status;
  }

  return 'processing';
};

const normalizeSeverity = (severity) => {
  if (['low', 'medium', 'high'].includes(severity)) {
    return severity;
  }

  return 'low';
};

const buildFlagSummary = (analysis) =>
  Array.isArray(analysis?.findings)
    ? analysis.findings.map((finding, index) => ({
        id: finding.id || `ai-finding-${index + 1}`,
        title: finding.finding || finding.explanation || 'AI finding',
        severity: normalizeSeverity(finding.severity),
        category: finding.category || 'other',
        evidence: finding.evidence || '',
        explanation: finding.explanation || '',
      }))
    : [];

const buildAiRecommendations = (analysis) => {
  if (!Array.isArray(analysis?.findings)) {
    return [];
  }

  return Array.from(
    new Set(
      analysis.findings
        .map((finding) => finding.suggestedImprovement)
        .filter(Boolean)
    )
  );
};

const buildPositionUiRow = (documentRecord) => ({
  id: documentRecord._id,
  documentName: documentRecord.fileName,
  status: normalizePositionStatus(documentRecord.analysisStatus),
  flags: countPositionFlags(documentRecord.analysis),
  uploadedBy: getUploaderLabel(documentRecord.uploadedBy),
  date: documentRecord.createdAt,
  view: null,
});

const buildPositionDetailView = (documentRecord) => ({
  ...buildPositionUiRow(documentRecord),
  fileName: documentRecord.fileName,
  mimeType: documentRecord.mimeType,
  storage: documentRecord.storage,
  summary: documentRecord.analysis?.summary || '',
  overallRisk: documentRecord.analysis?.overallRisk || null,
  flagSummary: buildFlagSummary(documentRecord.analysis),
  aiRecommendations: buildAiRecommendations(documentRecord.analysis),
  analystNotes: documentRecord.analystNotes || '',
  resolutionStatus: documentRecord.resolutionStatus || 'not_reviewed',
  reviewedBy: documentRecord.reviewedBy || null,
  reviewedAt: documentRecord.reviewedAt || null,
  textPreview: documentRecord.extractedTextPreview || '',
});

module.exports = {
  buildAiRecommendations,
  buildFlagSummary,
  buildPositionDetailView,
  buildPositionUiRow,
  countPositionFlags,
  normalizePositionStatus,
};
