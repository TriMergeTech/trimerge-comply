const DEFAULT_REQUIRED_COLUMNS = Object.freeze(['group', 'selected', 'total']);

const normalizeHeader = (header) =>
  String(header || '')
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
      rowCount: rows.length,
      validRowCount: normalizedRows.length,
      columns: headers,
    },
  };
};

module.exports = {
  DEFAULT_REQUIRED_COLUMNS,
  normalizeHeader,
  parseCsvLine,
  parseCsvText,
  validateAnalyticsRows,
};
