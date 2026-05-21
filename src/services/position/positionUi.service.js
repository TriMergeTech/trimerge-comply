const { getUploaderLabel } = require('../../utils/uploadedBy');

const countPositionFlags = (analysis) =>
  Array.isArray(analysis?.findings) ? analysis.findings.length : 0;

const normalizePositionStatus = (status) => {
  if (status === 'completed' || status === 'failed') {
    return status;
  }

  return 'processing';
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

module.exports = {
  buildPositionUiRow,
  countPositionFlags,
  normalizePositionStatus,
};
