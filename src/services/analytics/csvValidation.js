const DEFAULT_REQUIRED_COLUMNS = Object.freeze(['group', 'selected', 'total']);
const APPLICANT_FLOW_COLUMNS = Object.freeze(['job', 'stage', 'demographicgroup', 'selected']);
const PAY_EQUITY_COLUMNS = Object.freeze(['salary', 'grade', 'tenure', 'performance', 'gender', 'race', 'department']);

const normalizeHeader = (header) =>
  String(header || '')
    .replace(/^\uFEFF/, '')
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '_');

const parseCsvLine = (line) => {
  const values = [];
  let current = '';
  let insideQuotes = false;

  for (let i = 0; i < line.length; i += 1) {
    const char = line[i];
    const nextChar = line[i + 1];

    if (char === '"' && insideQuotes && nextChar === '"') {
      current += '"';
      i += 1;
      continue;
    }

    if (char === '"') {
      insideQuotes = !insideQuotes;
      continue;
    }

    if (char === ',' && !insideQuotes) {
      values.push(current.trim());
      current = '';
      continue;
    }

    current += char;
  }

  values.push(current.trim());
  return values;
};

const parseCsvText = (csvText) => {
  if (!csvText || typeof csvText !== 'string') {
    return { headers: [], rows: [] };
  }

  const lines = csvText
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

  if (lines.length === 0) {
    return { headers: [], rows: [] };
  }

  const headers = parseCsvLine(lines[0]).map(normalizeHeader);

  const rows = lines.slice(1).map((line, index) => {
    const values = parseCsvLine(line);
    const row = {};

    headers.forEach((header, headerIndex) => {
      row[header] = values[headerIndex] ?? '';
    });

    return {
      rowNumber: index + 2,
      data: row,
    };
  });

  return { headers, rows };
};

const toNumber = (value) => {
  if (value === null || value === undefined || value === '') {
    return Number.NaN;
  }

  return Number(String(value).replace(/,/g, '').trim());
};

const toBoolean = (value) => {
  const normalizedValue = String(value || '').trim().toLowerCase();
  return ['true', 'yes', 'y', '1', 'selected', 'hired', 'pass'].includes(normalizedValue);
};

const hasColumns = (headers, requiredColumns) =>
  requiredColumns.every((column) => headers.includes(column));

const detectCsvType = (headers) => {
  if (hasColumns(headers, DEFAULT_REQUIRED_COLUMNS)) {
    return 'grouped_adverse_impact';
  }

  if (hasColumns(headers, APPLICANT_FLOW_COLUMNS)) {
    return 'applicant_flow';
  }

  if (hasColumns(headers, PAY_EQUITY_COLUMNS)) {
    return 'pay_equity';
  }

  return 'unknown';
};

const aggregateApplicantFlowRows = (rows) => {
  const grouped = new Map();
  const errors = [];

  rows.forEach(({ rowNumber, data }) => {
    const group = String(data.demographicgroup || '').trim();

    if (!group) {
      errors.push({ row: rowNumber, field: 'demographicGroup', message: 'Demographic group is required.' });
      return;
    }

    const current = grouped.get(group) || { group, selected: 0, total: 0 };
    current.total += 1;

    if (toBoolean(data.selected)) {
      current.selected += 1;
    }

    grouped.set(group, current);
  });

  return {
    errors,
    normalizedRows: Array.from(grouped.values()),
  };
};

const validatePayEquityRows = (rows, headers) => {
  const errors = [];
  const departments = new Set();
  const genders = new Set();
  const races = new Set();

  rows.forEach(({ rowNumber, data }) => {
    const salary = toNumber(data.salary);
    const grade = toNumber(data.grade);
    const tenure = toNumber(data.tenure);
    const performance = toNumber(data.performance);

    if (!Number.isFinite(salary) || salary <= 0) {
      errors.push({ row: rowNumber, field: 'salary', message: 'Salary must be a number greater than zero.' });
    }

    if (!Number.isFinite(grade)) {
      errors.push({ row: rowNumber, field: 'grade', message: 'Grade must be numeric.' });
    }

    if (!Number.isFinite(tenure) || tenure < 0) {
      errors.push({ row: rowNumber, field: 'tenure', message: 'Tenure must be a non-negative number.' });
    }

    if (!Number.isFinite(performance)) {
      errors.push({ row: rowNumber, field: 'performance', message: 'Performance must be numeric.' });
    }

    if (!data.gender) {
      errors.push({ row: rowNumber, field: 'gender', message: 'Gender is required.' });
    }

    if (!data.race) {
      errors.push({ row: rowNumber, field: 'race', message: 'Race is required.' });
    }

    if (!data.department) {
      errors.push({ row: rowNumber, field: 'department', message: 'Department is required.' });
    }

    if (data.department) departments.add(data.department);
    if (data.gender) genders.add(data.gender);
    if (data.race) races.add(data.race);
  });

  return {
    valid: errors.length === 0,
    errors,
    warnings: [{
      row: null,
      field: null,
      message: 'Pay equity CSV validated. Regression/pay gap analysis is handled by a later pay equity engine.',
    }],
    normalizedRows: [],
    summary: {
      datasetType: 'pay_equity',
      rowCount: rows.length,
      validRowCount: errors.length === 0 ? rows.length : 0,
      columns: headers,
      departments: Array.from(departments),
      genders: Array.from(genders),
      races: Array.from(races),
    },
  };
};

const validateAnalyticsRows = (csvText, options = {}) => {
  const requiredColumns = options.requiredColumns || DEFAULT_REQUIRED_COLUMNS;
  const { headers, rows } = parseCsvText(csvText);
  const errors = [];
  const warnings = [];

  if (headers.length === 0) {
    return {
      valid: false,
      errors: [{ row: null, field: null, message: 'CSV must include a header row.' }],
      warnings,
      normalizedRows: [],
      summary: { rowCount: 0 },
    };
  }

  const csvType = detectCsvType(headers);

  if (csvType === 'applicant_flow') {
    const applicantFlow = aggregateApplicantFlowRows(rows);

    if (applicantFlow.normalizedRows.length < 2 && applicantFlow.errors.length === 0) {
      warnings.push({
        row: null,
        field: 'demographicGroup',
        message: 'At least two demographic groups are recommended for adverse impact comparison.',
      });
    }

    return {
      valid: applicantFlow.errors.length === 0,
      errors: applicantFlow.errors,
      warnings,
      normalizedRows: applicantFlow.normalizedRows,
      summary: {
        datasetType: csvType,
        rowCount: rows.length,
        validRowCount: applicantFlow.normalizedRows.reduce((sum, row) => sum + row.total, 0),
        columns: headers,
      },
    };
  }

  if (csvType === 'pay_equity') {
    return validatePayEquityRows(rows, headers);
  }

  requiredColumns.forEach((column) => {
    if (!headers.includes(column)) {
      errors.push({
        row: null,
        field: column,
        message: `Missing required column: ${column}`,
      });
    }
  });

  const normalizedRows = [];

  rows.forEach(({ rowNumber, data }) => {
    const group = String(data.group || '').trim();
    const selected = toNumber(data.selected);
    const total = toNumber(data.total);

    if (!group) {
      errors.push({ row: rowNumber, field: 'group', message: 'Group is required.' });
    }

    if (!Number.isFinite(selected) || selected < 0) {
      errors.push({ row: rowNumber, field: 'selected', message: 'Selected must be a non-negative number.' });
    }

    if (!Number.isFinite(total) || total <= 0) {
      errors.push({ row: rowNumber, field: 'total', message: 'Total must be a number greater than zero.' });
    }

    if (Number.isFinite(selected) && Number.isFinite(total) && selected > total) {
      errors.push({ row: rowNumber, field: 'selected', message: 'Selected cannot exceed total.' });
    }

    if (group && Number.isFinite(selected) && Number.isFinite(total) && selected <= total && total > 0) {
      normalizedRows.push({
        group,
        selected,
        total,
      });
    }
  });

  if (normalizedRows.length < 2 && errors.length === 0) {
    warnings.push({
      row: null,
      field: 'group',
      message: 'At least two valid groups are recommended for adverse impact comparison.',
    });
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
    normalizedRows,
    summary: {
      datasetType: csvType,
      rowCount: rows.length,
      validRowCount: normalizedRows.length,
      columns: headers,
    },
  };
};

module.exports = {
  DEFAULT_REQUIRED_COLUMNS,
  APPLICANT_FLOW_COLUMNS,
  PAY_EQUITY_COLUMNS,
  detectCsvType,
  normalizeHeader,
  parseCsvLine,
  parseCsvText,
  validateAnalyticsRows,
};
