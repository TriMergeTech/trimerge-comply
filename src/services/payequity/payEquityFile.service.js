const path = require('path');
const mammoth = require('mammoth');
const { PDFParse } = require('pdf-parse');
const XLSX = require('xlsx');
const { normalizeHeader } = require('../analytics/csvValidation');

const EXCEL_MIME_TYPES = new Set([
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/vnd.ms-excel',
]);
const PDF_MIME_TYPES = new Set(['application/pdf']);
const DOCX_MIME_TYPES = new Set([
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
]);
const CSV_MIME_TYPES = new Set(['text/csv', 'text/plain', 'application/csv']);

const normalizeMimeType = (mimeType = '') => mimeType.split(';')[0].trim().toLowerCase();

const getPayEquityFileType = ({ fileName = '', mimeType = '' }) => {
  const extension = path.extname(fileName).toLowerCase();
  const normalizedMimeType = normalizeMimeType(mimeType);

  if (CSV_MIME_TYPES.has(normalizedMimeType) || extension === '.csv' || extension === '.txt') {
    return 'csv';
  }

  if (EXCEL_MIME_TYPES.has(normalizedMimeType) || extension === '.xlsx' || extension === '.xls') {
    return 'spreadsheet';
  }

  if (PDF_MIME_TYPES.has(normalizedMimeType) || extension === '.pdf') {
    return 'pdf';
  }

  if (DOCX_MIME_TYPES.has(normalizedMimeType) || extension === '.docx') {
    return 'docx';
  }

  return null;
};

const escapeCsvValue = (value) => {
  const text = String(value ?? '');

  if (/[",\n\r]/.test(text)) {
    return `"${text.replace(/"/g, '""')}"`;
  }

  return text;
};

const rowsToCsv = (rows) => rows.map((row) => row.map(escapeCsvValue).join(',')).join('\n');

const spreadsheetToCsv = (fileBuffer) => {
  const workbook = XLSX.read(fileBuffer, { type: 'buffer', cellDates: false });
  const sheetName = workbook.SheetNames[0];

  if (!sheetName) {
    return '';
  }

  return XLSX.utils.sheet_to_csv(workbook.Sheets[sheetName]);
};

const extractPdfText = async (fileBuffer) => {
  const parser = new PDFParse({ data: fileBuffer });

  try {
    const result = await parser.getText();
    return result.text || '';
  } finally {
    await parser.destroy();
  }
};

const extractDocxText = async (fileBuffer) => {
  const result = await mammoth.extractRawText({ buffer: fileBuffer });
  return result.value || '';
};

const splitTableLine = (line) => {
  const trimmed = line.trim();

  if (!trimmed) {
    return [];
  }

  if (trimmed.includes(',')) {
    return trimmed.split(',').map((value) => value.trim());
  }

  if (trimmed.includes('\t')) {
    return trimmed.split(/\t+/).map((value) => value.trim());
  }

  return trimmed.split(/\s{2,}/).map((value) => value.trim());
};

const repairMergedPerformanceGenderColumn = (rows) => {
  if (!rows.length) {
    return { rows, warnings: [] };
  }

  const headers = rows[0];
  const mergedColumnIndex = headers.findIndex((header) => {
    const normalizedHeader = normalizeHeader(header);
    return normalizedHeader.includes('gender') && normalizedHeader.startsWith('perform');
  });

  if (mergedColumnIndex === -1) {
    return { rows, warnings: [] };
  }

  const repairedRows = rows.map((row, rowIndex) => {
    if (rowIndex === 0) {
      return [
        ...row.slice(0, mergedColumnIndex),
        'performance',
        'gender',
        ...row.slice(mergedColumnIndex + 1),
      ];
    }

    const mergedValue = String(row[mergedColumnIndex] || '').trim();
    const match = mergedValue.match(/^(-?\d+(?:\.\d+)?)\s+(.+)$/);
    const performance = match?.[1] || mergedValue;
    const gender = match?.[2] || '';

    return [
      ...row.slice(0, mergedColumnIndex),
      performance,
      gender,
      ...row.slice(mergedColumnIndex + 1),
    ];
  });

  return {
    rows: repairedRows,
    warnings: [{
      row: null,
      field: 'performance/gender',
      message: 'Merged performance and gender columns were repaired after document text extraction.',
    }],
  };
};

const textTableToCsv = (text) => {
  const rows = text
    .split(/\r?\n/)
    .map(splitTableLine)
    .filter((row) => row.length > 1);

  const headerIndex = rows.findIndex((row) => row.map(normalizeHeader).includes('salary'));

  if (headerIndex === -1) {
    return { csvText: '', warnings: [] };
  }

  const headers = rows[headerIndex];
  const dataRows = rows
    .slice(headerIndex + 1)
    .filter((row) => row.length === headers.length);
  const repaired = repairMergedPerformanceGenderColumn([headers, ...dataRows]);

  return {
    csvText: rowsToCsv(repaired.rows),
    warnings: repaired.warnings,
  };
};

const extractPayEquityCsvFromFile = async ({ fileBuffer, fileName = '', mimeType = '' }) => {
  const fileType = getPayEquityFileType({ fileName, mimeType });

  if (!fileType) {
    return {
      supported: false,
      fileType: null,
      csvText: '',
      warnings: [],
      error: 'Unsupported pay equity file type. Upload .csv, .xlsx, .xls, .pdf, or .docx.',
    };
  }

  if (fileType === 'csv') {
    return {
      supported: true,
      fileType,
      csvText: fileBuffer.toString('utf8').replace(/^\uFEFF/, ''),
      warnings: [],
      error: null,
    };
  }

  if (fileType === 'spreadsheet') {
    return {
      supported: true,
      fileType,
      csvText: spreadsheetToCsv(fileBuffer),
      warnings: [],
      error: null,
    };
  }

  const extractedText = fileType === 'pdf'
    ? await extractPdfText(fileBuffer)
    : await extractDocxText(fileBuffer);
  const tableResult = textTableToCsv(extractedText);
  const csvText = tableResult.csvText;

  return {
    supported: true,
    fileType,
    csvText,
    warnings: csvText
      ? [{
          row: null,
          field: null,
          message: `${fileType.toUpperCase()} text was converted into a CSV-like table before analysis.`,
        },
        ...tableResult.warnings]
      : [],
    error: csvText
      ? null
      : `Could not detect a pay equity table in the ${fileType.toUpperCase()} file. Include a table with a salary column.`,
  };
};

module.exports = {
  extractPayEquityCsvFromFile,
  getPayEquityFileType,
};
