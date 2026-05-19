const Upload = require('../models/Upload');
const Flag = require('../models/Flag');
const { sendSuccess, sendError } = require('../utils/response');

// Parse a simple CSV buffer into row objects
// Expects header: group,selected,total (case-insensitive)
function parseCsv(buffer) {
  const text = buffer.toString('utf8');
  const lines = text.split(/\r?\n/).filter((l) => l.trim());
  if (lines.length < 2) return [];

  const headers = lines[0].toLowerCase().split(',').map((h) => h.trim());
  const groupIdx = headers.indexOf('group');
  const selectedIdx = headers.indexOf('selected');
  const totalIdx = headers.indexOf('total');
  const jobTitleIdx = headers.indexOf('jobtitle');
  const stageIdx = headers.indexOf('stage');

  if (groupIdx === -1 || selectedIdx === -1 || totalIdx === -1) return null;

  return lines.slice(1).map((line) => {
    const cols = line.split(',').map((c) => c.trim());
    return {
      group: cols[groupIdx] ?? '',
      selected: Number(cols[selectedIdx]) || 0,
      total: Number(cols[totalIdx]) || 0,
      jobTitle: jobTitleIdx !== -1 ? cols[jobTitleIdx] : undefined,
      stage: stageIdx !== -1 ? cols[stageIdx] : undefined,
    };
  }).filter((r) => r.group && r.total > 0);
}

// Compute chi-square p-value approximation for a 2x2 table
// Groups: (a=group selected, b=group not-selected) vs (c=ref selected, d=ref not-selected)
function computeStats(groupSelected, groupTotal, refSelected, refTotal) {
  const a = groupSelected;
  const b = groupTotal - groupSelected;
  const c = refSelected;
  const d = refTotal - refSelected;
  const N = a + b + c + d;

  const denom = (a + b) * (c + d) * (a + c) * (b + d);
  let chiSquare = 0;
  if (denom > 0) {
    chiSquare = (N * Math.pow(Math.abs(a * d - b * c), 2)) / denom;
  }

  // p-value approximation for 1 df (chi-square distribution CDF complement)
  const pValue = Math.exp(-chiSquare / 2);

  return { chiSquare: +chiSquare.toFixed(4), pValue: +pValue.toFixed(4) };
}

function getSeverity(ratio) {
  if (ratio < 0.5) return 'Critical';
  if (ratio < 0.65) return 'High';
  return 'Medium';
}

// ────────────────────────────────────────────────────────────
// POST /api/upload/csv
// ────────────────────────────────────────────────────────────
const uploadCsv = async (req, res, next) => {
  try {
    if (!req.file) {
      return sendError(res, { statusCode: 400, message: 'No file provided.' });
    }

    const rows = parseCsv(req.file.buffer);
    if (rows === null) {
      return sendError(res, {
        statusCode: 400,
        message: 'Invalid CSV format. Required columns: group, selected, total',
      });
    }
    if (rows.length === 0) {
      return sendError(res, { statusCode: 400, message: 'CSV contains no valid data rows.' });
    }

    const auditId = req.body.auditId || null;

    // Create upload record immediately (processing state)
    const uploadRecord = await Upload.create({
      fileName: req.file.originalname,
      uploadedBy: req.user._id,
      auditId,
      status: 'processing',
    });

    // Find majority group (highest selection rate)
    const groupRates = rows.map((r) => ({ ...r, rate: r.selected / r.total }));
    const majority = groupRates.reduce((max, g) => (g.rate > max.rate ? g : max));

    const generatedFlags = [];

    for (const group of groupRates) {
      if (group.group === majority.group) continue;
      const ratio = majority.rate > 0 ? group.rate / majority.rate : 0;
      if (ratio >= 0.8) continue; // no adverse impact

      const { chiSquare, pValue } = computeStats(
        group.selected, group.total,
        majority.selected, majority.total
      );

      const jobTitle = group.jobTitle ?? rows[0]?.jobTitle ?? 'Position';
      const stage = group.stage ?? rows[0]?.stage ?? 'Selection';
      const severity = getSeverity(ratio);

      const flag = await Flag.create({
        name: `${jobTitle} – ${stage} – ${group.group}`,
        testType: 'adverse_impact',
        auditId,
        uploadId: uploadRecord._id,
        severity,
        results: {
          jobTitle,
          stage,
          demographicGroup: group.group,
          fourFifthsRule: +ratio.toFixed(4),
          chiSquare,
          fishersExact: pValue,
        },
      });

      generatedFlags.push(flag);
    }

    // Update upload record
    uploadRecord.status = 'completed';
    uploadRecord.rowsProcessed = rows.length;
    uploadRecord.flagsGenerated = generatedFlags.length;
    await uploadRecord.save();

    return sendSuccess(res, {
      statusCode: 201,
      message: `Upload complete. ${generatedFlags.length} flag(s) generated.`,
      data: { upload: uploadRecord, flags: generatedFlags },
    });
  } catch (err) {
    next(err);
  }
};

// ────────────────────────────────────────────────────────────
// GET /api/upload
// ────────────────────────────────────────────────────────────
const getUploads = async (req, res, next) => {
  try {
    const uploads = await Upload.find({ uploadedBy: req.user._id })
      .sort('-createdAt')
      .limit(20);
    return sendSuccess(res, { data: { uploads } });
  } catch (err) {
    next(err);
  }
};

module.exports = { uploadCsv, getUploads };
