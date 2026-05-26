const PayEquity = require('../models/PayEquity');
const { sendSuccess, sendError } = require('../utils/response');

// ─── CSV Parsing ─────────────────────────────────────────────────────────────
// Parses a CSV buffer into an array of row objects.
// Required column: salary. All other columns are captured as-is.
function parseCsv(buffer) {
  const text = buffer.toString('utf8');
  const lines = text.split(/\r?\n/).filter((l) => l.trim());
  if (lines.length < 2) return null;

  const headers = lines[0].split(',').map((h) => h.trim().toLowerCase());
  const salaryIdx = headers.indexOf('salary');
  if (salaryIdx === -1) return null; // salary column required

  return lines.slice(1).map((line) => {
    const cols = line.split(',').map((c) => c.trim());
    const row = {};
    headers.forEach((h, i) => {
      row[h] = cols[i] ?? '';
    });
    return row;
  }).filter((r) => r.salary && !isNaN(Number(r.salary)));
}

// ─── Column Classification ────────────────────────────────────────────────────
// Detects which columns are demographic groups (non-numeric, ≤20 unique values,
// not salary/department) vs department (column named "department").
function classifyColumns(rows) {
  if (!rows || rows.length === 0) return { demographicCols: [], hasDepartment: false };

  const headers = Object.keys(rows[0]).filter((h) => h !== 'salary');
  const hasDepartment = headers.includes('department');

  const demographicCols = headers.filter((h) => {
    if (h === 'department') return false;
    // Check if all values for this column are non-numeric (treat as categorical)
    const values = rows.map((r) => r[h]).filter(Boolean);
    const uniqueValues = new Set(values);
    const isNumeric = values.every((v) => !isNaN(Number(v)));
    return !isNumeric && uniqueValues.size >= 2 && uniqueValues.size <= 20;
  });

  return { demographicCols, hasDepartment };
}

// ─── Gap Analysis ─────────────────────────────────────────────────────────────
// For a given demographic column, computes the pay gap for each group
// relative to the group with the highest mean salary (reference group).
function analyzeDemographicGaps(rows, col) {
  // Group rows by the column's value
  const groups = {};
  for (const row of rows) {
    const groupName = row[col];
    if (!groupName) continue;
    if (!groups[groupName]) groups[groupName] = [];
    groups[groupName].push(Number(row.salary));
  }

  // Compute mean salary per group
  const groupMeans = Object.entries(groups).map(([name, salaries]) => ({
    name,
    mean: salaries.reduce((sum, s) => sum + s, 0) / salaries.length,
  }));

  if (groupMeans.length < 2) return [];

  // Reference = highest mean salary group
  const refMean = Math.max(...groupMeans.map((g) => g.mean));

  return groupMeans
    .filter((g) => g.mean < refMean) // skip the reference group itself
    .map((g) => {
      const gap = +((((g.mean - refMean) / refMean) * 100).toFixed(2));
      return {
        group: g.name,
        unadjustedGap: gap,
        adjustedGap: gap, // bivariate OLS without controls equals the unadjusted gap
        flagged: gap <= -5, // flag if more than 5% below reference
      };
    });
}

// ─── Department Gap Analysis ──────────────────────────────────────────────────
// Computes mean salary gap for each department vs the overall mean.
function analyzeDepartmentGaps(rows) {
  const overall = rows.reduce((sum, r) => sum + Number(r.salary), 0) / rows.length;

  const departments = {};
  for (const row of rows) {
    const dept = row.department;
    if (!dept) continue;
    if (!departments[dept]) departments[dept] = [];
    departments[dept].push(Number(row.salary));
  }

  return Object.entries(departments).map(([dept, salaries]) => {
    const mean = salaries.reduce((sum, s) => sum + s, 0) / salaries.length;
    const gap = +(((mean - overall) / overall * 100).toFixed(2));
    return { department: dept, gap };
  }).sort((a, b) => a.gap - b.gap); // sort by gap ascending (most negative first)
}

// ────────────────────────────────────────────────────────────────────────────
// POST /api/payequity/upload
// ────────────────────────────────────────────────────────────────────────────
const uploadPayEquity = async (req, res, next) => {
  try {
    if (!req.file) {
      return sendError(res, { statusCode: 400, message: 'No file provided.' });
    }

    const rows = parseCsv(req.file.buffer);

    if (rows === null) {
      return sendError(res, {
        statusCode: 422,
        message: 'Validation failed. Required column: salary. Ensure the file is a valid CSV.',
      });
    }

    if (rows.length < 2) {
      return sendError(res, {
        statusCode: 422,
        message: 'Validation failed. CSV must contain at least 2 valid data rows.',
      });
    }

    const { demographicCols, hasDepartment } = classifyColumns(rows);

    // Compute department gaps
    const departmentGaps = hasDepartment ? analyzeDepartmentGaps(rows) : [];

    // Compute demographic gaps across all detected demographic columns
    const allDemographicGaps = [];
    for (const col of demographicCols) {
      const gaps = analyzeDemographicGaps(rows, col);
      allDemographicGaps.push(...gaps);
    }

    const flagsGenerated = allDemographicGaps.filter((g) => g.flagged).length;
    const uniqueDepts = hasDepartment
      ? new Set(rows.map((r) => r.department).filter(Boolean)).size
      : 0;

    // Count total unique demographic group values across all demographic columns
    const allGroupValues = new Set();
    for (const col of demographicCols) {
      rows.forEach((r) => { if (r[col]) allGroupValues.add(r[col]); });
    }

    const analysis = await PayEquity.create({
      fileName: req.file.originalname,
      uploadedBy: req.user._id,
      totalEmployees: rows.length,
      departmentsAnalyzed: uniqueDepts,
      demographicGroupsCount: allGroupValues.size,
      flagsGenerated,
      departmentGaps,
      demographicGaps: allDemographicGaps,
    });

    return sendSuccess(res, {
      statusCode: 200,
      message: `Pay equity analysis complete. ${flagsGenerated} group(s) flagged.`,
      data: { analysis },
    });
  } catch (err) {
    next(err);
  }
};

// ────────────────────────────────────────────────────────────────────────────
// GET /api/payequity
// ────────────────────────────────────────────────────────────────────────────
const getPayEquityAnalyses = async (req, res, next) => {
  try {
    const analyses = await PayEquity.find()
      .sort('-createdAt')
      .populate('uploadedBy', 'email name');

    return sendSuccess(res, {
      message: 'Pay equity analyses retrieved successfully.',
      data: { analyses },
    });
  } catch (err) {
    next(err);
  }
};

module.exports = { uploadPayEquity, getPayEquityAnalyses };
