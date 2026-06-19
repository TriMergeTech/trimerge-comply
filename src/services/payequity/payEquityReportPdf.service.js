const PDFDocument = require('pdfkit');

const PAGE_LEFT = 48;
const PAGE_RIGHT = 564;
const CONTENT_WIDTH = PAGE_RIGHT - PAGE_LEFT;
const BRAND_COLOR = '#11154a';
const TEXT_COLOR = '#111827';
const MUTED_COLOR = '#4b5563';
const BORDER_COLOR = '#d1d5db';
const SEVERITY_COLORS = {
  high: '#dc2626',
  medium: '#d97706',
  low: '#16a34a',
};

const truncate = (value = '', maxLength = 120) => {
  const text = String(value || '').replace(/\s+/g, ' ').trim();
  return text.length > maxLength ? `${text.slice(0, maxLength - 3)}...` : text;
};

const formatDate = (value) =>
  value
    ? new Date(value).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      })
    : 'N/A';

const formatCurrency = (value) =>
  Number.isFinite(Number(value))
    ? new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        maximumFractionDigits: 0,
      }).format(Number(value))
    : 'N/A';

const formatPercent = (value, digits = 1) =>
  Number.isFinite(Number(value)) ? `${Number(value).toFixed(digits)}%` : 'N/A';

const formatDecimal = (value, digits = 2) =>
  Number.isFinite(Number(value)) ? Number(value).toFixed(digits) : 'N/A';

const labelForValue = (value = '') =>
  String(value || '')
    .split('_')
    .filter(Boolean)
    .map((part) => part[0].toUpperCase() + part.slice(1))
    .join(' ') || 'N/A';

const drawHeader = (doc, title, subtitle) => {
  doc.rect(0, 0, 612, 72).fill(BRAND_COLOR);
  doc
    .font('Helvetica-Bold')
    .fontSize(21)
    .fillColor('#ffffff')
    .text(title, PAGE_LEFT, 22, { width: CONTENT_WIDTH, align: 'center' });
  doc
    .font('Helvetica')
    .fontSize(8.5)
    .fillColor('#e5e7eb')
    .text(subtitle, PAGE_LEFT, 49, { width: CONTENT_WIDTH, align: 'center' });
};

const drawFooter = (doc, pageNumber) => {
  doc
    .font('Helvetica-Oblique')
    .fontSize(7)
    .fillColor(MUTED_COLOR)
    .text(
      `TriMerge Comply | Pay equity statistical review | Page ${pageNumber} of 2`,
      PAGE_LEFT,
      742,
      { width: CONTENT_WIDTH, align: 'center' }
    );
};

const drawSectionTitle = (doc, title, y = doc.y) => {
  doc
    .font('Helvetica-Bold')
    .fontSize(10.5)
    .fillColor(TEXT_COLOR)
    .text(title, PAGE_LEFT, y, { width: CONTENT_WIDTH });
  doc
    .moveTo(PAGE_LEFT, y + 15)
    .lineTo(PAGE_RIGHT, y + 15)
    .strokeColor(BORDER_COLOR)
    .lineWidth(0.6)
    .stroke();
  doc.y = y + 22;
};

const drawMetaRow = (doc, label, value, x, y, valueWidth = 170) => {
  doc.font('Helvetica-Bold').fontSize(7.5).fillColor(MUTED_COLOR).text(label, x, y, { width: 72 });
  doc
    .font('Helvetica')
    .fontSize(7.5)
    .fillColor(TEXT_COLOR)
    .text(truncate(value, 58), x + 76, y, { width: valueWidth });
};

const drawKpi = (doc, x, y, width, label, value, color = BRAND_COLOR) => {
  doc.roundedRect(x, y, width, 48, 4).strokeColor(BORDER_COLOR).lineWidth(0.7).stroke();
  doc
    .font('Helvetica-Bold')
    .fontSize(15)
    .fillColor(color)
    .text(String(value), x + 8, y + 9, { width: width - 16, align: 'center' });
  doc
    .font('Helvetica')
    .fontSize(7.2)
    .fillColor(MUTED_COLOR)
    .text(label, x + 6, y + 30, { width: width - 12, align: 'center' });
};

const drawTableHeader = (doc, columns, y) => {
  doc.rect(PAGE_LEFT, y, CONTENT_WIDTH, 20).fill('#f3f4f6');
  columns.forEach((column) => {
    doc
      .font('Helvetica-Bold')
      .fontSize(7)
      .fillColor(MUTED_COLOR)
      .text(column.label, PAGE_LEFT + column.x, y + 6, {
        width: column.width,
        align: column.align || 'left',
      });
  });
};

const drawTableRow = (doc, columns, row, y, index, options = {}) => {
  if (index % 2 === 1) {
    doc.rect(PAGE_LEFT, y, CONTENT_WIDTH, options.height || 24).fill('#f9fafb');
  }

  columns.forEach((column) => {
    const value = typeof column.value === 'function' ? column.value(row) : row[column.value];
    doc
      .font(column.bold ? 'Helvetica-Bold' : 'Helvetica')
      .fontSize(options.fontSize || 7.2)
      .fillColor(typeof column.color === 'function' ? column.color(row) : TEXT_COLOR)
      .text(truncate(value, column.maxLength || 48), PAGE_LEFT + column.x, y + 7, {
        width: column.width,
        align: column.align || 'left',
      });
  });
};

const renderPayEquityReportPdf = ({
  outputStream,
  reportView,
  plainLanguageSummary,
  recommendations,
}) => {
  const doc = new PDFDocument({
    size: 'LETTER',
    margins: { top: 36, bottom: 36, left: PAGE_LEFT, right: 612 - PAGE_RIGHT },
    bufferPages: false,
    autoFirstPage: true,
  });
  const riskColor = SEVERITY_COLORS[reportView.overallRisk] || BRAND_COLOR;

  doc.pipe(outputStream);

  drawHeader(
    doc,
    'Pay Equity Analysis',
    `${reportView.companyName || 'TriMerge Comply'} | Statistical Summary`
  );

  const metaY = 91;
  doc.roundedRect(PAGE_LEFT, metaY, CONTENT_WIDTH, 62, 4).strokeColor(BORDER_COLOR).lineWidth(0.8).stroke();
  drawMetaRow(doc, 'Document', reportView.fileName, PAGE_LEFT + 14, metaY + 12);
  drawMetaRow(doc, 'Company', reportView.companyName || 'Not provided', PAGE_LEFT + 14, metaY + 31);
  drawMetaRow(doc, 'Uploaded By', reportView.uploadedBy, PAGE_LEFT + 268, metaY + 12);
  drawMetaRow(doc, 'Analysis Date', formatDate(reportView.createdAt), PAGE_LEFT + 268, metaY + 31);

  const kpiY = 169;
  const kpiGap = 8;
  const kpiWidth = (CONTENT_WIDTH - kpiGap * 3) / 4;
  drawKpi(doc, PAGE_LEFT, kpiY, kpiWidth, 'Employees Analyzed', reportView.dataset.employeeCount);
  drawKpi(
    doc,
    PAGE_LEFT + (kpiWidth + kpiGap),
    kpiY,
    kpiWidth,
    'Average Salary',
    formatCurrency(reportView.dataset.averageSalary)
  );
  drawKpi(
    doc,
    PAGE_LEFT + (kpiWidth + kpiGap) * 2,
    kpiY,
    kpiWidth,
    'Flags Generated',
    reportView.summary.flagsGenerated,
    reportView.summary.flagsGenerated ? SEVERITY_COLORS.high : SEVERITY_COLORS.low
  );
  drawKpi(
    doc,
    PAGE_LEFT + (kpiWidth + kpiGap) * 3,
    kpiY,
    kpiWidth,
    'Overall Risk',
    labelForValue(reportView.overallRisk),
    riskColor
  );

  drawSectionTitle(doc, 'What This Means', 230);
  (plainLanguageSummary || []).slice(0, 3).forEach((summary) => {
    doc
      .font('Helvetica')
      .fontSize(8)
      .fillColor(TEXT_COLOR)
      .text(`- ${truncate(summary, 180)}`, PAGE_LEFT, doc.y, {
        width: CONTENT_WIDTH,
        lineGap: 1,
      });
  });

  drawSectionTitle(doc, 'Adjusted Pay Gap Findings', doc.y + 10);
  doc
    .font('Helvetica')
    .fontSize(7.5)
    .fillColor(MUTED_COLOR)
    .text(
      'Adjusted results compare estimated pay after accounting for the available job and employee factors.',
      PAGE_LEFT,
      doc.y,
      { width: CONTENT_WIDTH }
    );

  const adjustedColumns = [
    { label: 'Field / Group', x: 8, width: 150, value: (row) => `${labelForValue(row.field)}: ${row.group}`, bold: true },
    { label: 'Comparison', x: 166, width: 105, value: 'comparisonGroup' },
    { label: 'Adjusted Gap', x: 278, width: 76, value: (row) => formatPercent(row.gapPercent), align: 'right' },
    { label: 'Est. Amount', x: 360, width: 78, value: (row) => formatCurrency(row.gapAmount), align: 'right' },
    {
      label: 'Status',
      x: 446,
      width: 62,
      value: (row) => (row.flagged ? labelForValue(row.severity) : 'Not Flagged'),
      align: 'right',
      color: (row) => (row.flagged ? SEVERITY_COLORS[row.severity] || SEVERITY_COLORS.medium : MUTED_COLOR),
      bold: true,
    },
  ];
  let adjustedY = doc.y + 20;
  drawTableHeader(doc, adjustedColumns, adjustedY);
  adjustedY += 20;

  if (reportView.adjustedGaps.length) {
    reportView.adjustedGaps.forEach((row, index) => {
      drawTableRow(doc, adjustedColumns, row, adjustedY, index);
      adjustedY += 24;
    });
  } else {
    doc.font('Helvetica').fontSize(8).fillColor(MUTED_COLOR).text(
      'No adjusted demographic pay gap rows were available.',
      PAGE_LEFT + 8,
      adjustedY + 8
    );
    adjustedY += 28;
  }

  drawSectionTitle(doc, 'Analysis Scope', adjustedY + 12);
  const scopeLines = [
    `Protected fields: ${reportView.dataset.protectedFields.map(labelForValue).join(', ') || 'None detected'}`,
    `Factors considered: ${reportView.dataset.predictorsUsed.map(labelForValue).join(', ') || 'None reported'}`,
    `Departments analyzed: ${reportView.dataset.departmentsAnalyzed} | Demographic comparisons: ${reportView.dataset.demographicGroups}`,
  ];
  scopeLines.forEach((line) => {
    doc.font('Helvetica').fontSize(7.6).fillColor(TEXT_COLOR).text(`- ${truncate(line, 150)}`, PAGE_LEFT, doc.y, {
      width: CONTENT_WIDTH,
      lineGap: 1,
    });
  });

  drawFooter(doc, 1);

  doc.addPage();
  drawHeader(doc, 'Pay Equity Analysis', 'Detailed Findings and Recommended Actions');

  drawSectionTitle(doc, 'Unadjusted Department Gaps', 92);
  const departmentColumns = [
    { label: 'Department', x: 8, width: 130, value: 'department', bold: true },
    { label: 'Comparison', x: 145, width: 115, value: 'comparisonGroup' },
    { label: 'Employees', x: 268, width: 58, value: 'employeeCount', align: 'right' },
    { label: 'Avg. Salary', x: 334, width: 82, value: (row) => formatCurrency(row.averageSalary), align: 'right' },
    {
      label: 'Gap',
      x: 424,
      width: 84,
      value: (row) => formatPercent(row.gapPercent),
      align: 'right',
      color: (row) => (row.flagged ? SEVERITY_COLORS.medium : TEXT_COLOR),
      bold: true,
    },
  ];
  let y = doc.y;
  drawTableHeader(doc, departmentColumns, y);
  y += 20;
  if (reportView.departmentGaps.length) {
    reportView.departmentGaps.forEach((row, index) => {
      drawTableRow(doc, departmentColumns, row, y, index, { height: 22 });
      y += 22;
    });
  } else {
    doc.font('Helvetica').fontSize(8).fillColor(MUTED_COLOR).text('No department gap rows were available.', PAGE_LEFT + 8, y + 7);
    y += 24;
  }

  drawSectionTitle(doc, 'Unadjusted Demographic Gaps', y + 10);
  const demographicColumns = [
    { label: 'Field / Group', x: 8, width: 150, value: (row) => `${labelForValue(row.field)}: ${row.group}`, bold: true },
    { label: 'Comparison', x: 166, width: 110, value: 'comparisonGroup' },
    { label: 'Employees', x: 284, width: 58, value: 'employeeCount', align: 'right' },
    { label: 'Avg. Salary', x: 350, width: 82, value: (row) => formatCurrency(row.averageSalary), align: 'right' },
    {
      label: 'Gap',
      x: 440,
      width: 68,
      value: (row) => formatPercent(row.gapPercent),
      align: 'right',
      color: (row) => (row.flagged ? SEVERITY_COLORS.medium : TEXT_COLOR),
      bold: true,
    },
  ];
  y = doc.y;
  drawTableHeader(doc, demographicColumns, y);
  y += 20;
  if (reportView.demographicGaps.length) {
    reportView.demographicGaps.forEach((row, index) => {
      drawTableRow(doc, demographicColumns, row, y, index, { height: 22 });
      y += 22;
    });
  } else {
    doc.font('Helvetica').fontSize(8).fillColor(MUTED_COLOR).text('No demographic gap rows were available.', PAGE_LEFT + 8, y + 7);
    y += 24;
  }

  drawSectionTitle(doc, 'Technical Notes', y + 10);
  doc
    .font('Helvetica')
    .fontSize(7.6)
    .fillColor(TEXT_COLOR)
    .text(
      `Model: ${reportView.model.type} | R-squared: ${formatDecimal(reportView.model.rSquared, 3)} | Features: ${reportView.model.featureCount} | Degrees of freedom: ${formatDecimal(reportView.model.degreesOfFreedom, 0)} | Residual standard error: ${formatCurrency(reportView.model.residualStandardError)}`,
      PAGE_LEFT,
      doc.y,
      { width: CONTENT_WIDTH }
    );
  doc
    .font('Helvetica')
    .fontSize(7.2)
    .fillColor(MUTED_COLOR)
    .text(
      'R-squared shows how much of the salary variation is explained by the included factors. Residual standard error shows the typical size of unexplained salary differences.',
      PAGE_LEFT,
      doc.y + 2,
      { width: CONTENT_WIDTH }
    );

  const warnings = reportView.warnings.length
    ? reportView.warnings
    : ['No data-quality warnings were reported by the analysis engine.'];
  warnings.forEach((warning) => {
    doc.font('Helvetica').fontSize(7.4).fillColor(MUTED_COLOR).text(`- ${truncate(warning, 145)}`, PAGE_LEFT, doc.y, {
      width: CONTENT_WIDTH,
    });
  });

  drawSectionTitle(doc, 'Recommended Actions', doc.y + 10);
  recommendations.slice(0, 5).forEach((recommendation) => {
    doc.font('Helvetica').fontSize(7.7).fillColor(TEXT_COLOR).text(`- ${truncate(recommendation, 165)}`, PAGE_LEFT, doc.y, {
      width: CONTENT_WIDTH,
      lineGap: 1,
    });
  });

  doc
    .font('Helvetica-Oblique')
    .fontSize(7)
    .fillColor(MUTED_COLOR)
    .text(
      'This report is a statistical review aid, not a legal conclusion. Unadjusted gaps are descriptive; adjusted estimates depend on the quality and completeness of the supplied data and model factors.',
      PAGE_LEFT,
      710,
      { width: CONTENT_WIDTH, align: 'center' }
    );

  drawFooter(doc, 2);
  doc.end();
};

module.exports = {
  renderPayEquityReportPdf,
};
