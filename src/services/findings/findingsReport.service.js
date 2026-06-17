const PDFDocument = require('pdfkit');

// ─── Colour palette ───────────────────────────────────────────
const BRAND_DARK = '#0F172A';
const BRAND_MID = '#1E3A5F';
const SUBTLE = '#94A3B8';
const RULE = '#E2E8F0';
const WHITE = '#FFFFFF';

const RISK_COLOR = {
  critical: '#DC2626',
  high: '#EA580C',
  medium: '#D97706',
  low: '#16A34A',
};

const STATUS_LABEL = {
  new: 'New',
  under_review: 'Under Review',
  additional_info_required: 'Info Required',
  approved: 'Approved',
  rejected: 'Rejected',
  closed: 'Closed',
};

const STATUS_COLOR = {
  new: '#6B7280',
  under_review: '#2563EB',
  additional_info_required: '#9333EA',
  approved: '#16A34A',
  rejected: '#DC2626',
  closed: '#374151',
};

const LEFT = 50;
const RIGHT_MARGIN = 50;

const hRule = (doc, y, color = RULE) => {
  const width = doc.page.width - LEFT - RIGHT_MARGIN;
  doc.save().moveTo(LEFT, y).lineTo(LEFT + width, y).strokeColor(color).lineWidth(0.5).stroke().restore();
};

const pageWidth = (doc) => doc.page.width - LEFT - RIGHT_MARGIN;

// ─── Main export ─────────────────────────────────────────────
/**
 * Streams a Findings Register PDF to the provided writable stream.
 *
 * @param {object} opts
 * @param {import('stream').Writable} opts.outputStream
 * @param {object}  opts.audit     — Audit document (populated)
 * @param {Array}   opts.findings  — Finding documents (populated)
 * @param {string}  opts.generatedBy — name of the user who requested the export
 */
const renderFindingsRegisterPdf = ({ outputStream, audit, findings, generatedBy }) => {
  const doc = new PDFDocument({
    size: 'A4',
    margin: LEFT,
    bufferPages: true,
    info: {
      Title: `Findings Register — ${audit.name}`,
      Author: 'TriMerge Comply',
      Subject: 'HR Compliance Audit Findings',
    },
  });

  doc.pipe(outputStream);

  const pw = pageWidth(doc);
  const dateStr = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  // ── Cover Header bar ────────────────────────────────────────
  doc.rect(0, 0, doc.page.width, 130).fill(BRAND_DARK);

  doc
    .fill(WHITE)
    .fontSize(20)
    .font('Helvetica-Bold')
    .text('FINDINGS REGISTER', LEFT, 32);

  doc
    .fontSize(10)
    .font('Helvetica')
    .fill('#94A3B8')
    .text('Confidential HR Compliance Document', LEFT, 57);

  doc
    .fill(WHITE)
    .fontSize(9)
    .text(`Audit: ${audit.name}`, LEFT, 76)
    .text(`Client: ${audit.clientName || audit.organization || '—'}`, LEFT, 90)
    .text(`Generated: ${dateStr}${generatedBy ? `  ·  By: ${generatedBy}` : ''}`, LEFT, 104);

  doc.fill('#000000');

  // ── Executive Summary ────────────────────────────────────────
  const SUM_Y = 150;
  doc.fontSize(11).font('Helvetica-Bold').fill(BRAND_DARK).text('EXECUTIVE SUMMARY', LEFT, SUM_Y);
  hRule(doc, SUM_Y + 17, BRAND_MID);

  const counts = {
    total: findings.length,
    critical: findings.filter((f) => f.risk.level === 'critical').length,
    high: findings.filter((f) => f.risk.level === 'high').length,
    medium: findings.filter((f) => f.risk.level === 'medium').length,
    low: findings.filter((f) => f.risk.level === 'low').length,
    approved: findings.filter((f) => f.status === 'approved').length,
    open: findings.filter((f) => !['approved', 'rejected', 'closed'].includes(f.status)).length,
  };

  // Three KPI boxes
  const BOX_W = (pw - 16) / 3;
  const BOX_Y = SUM_Y + 26;
  const boxes = [
    { label: 'Total Findings', value: counts.total, color: BRAND_DARK },
    { label: 'Open / Pending', value: counts.open, color: RISK_COLOR.high },
    { label: 'Approved', value: counts.approved, color: '#16A34A' },
  ];

  boxes.forEach((b, i) => {
    const bx = LEFT + i * (BOX_W + 8);
    doc.rect(bx, BOX_Y, BOX_W, 54).fill(b.color);
    doc
      .fill(WHITE)
      .fontSize(26)
      .font('Helvetica-Bold')
      .text(String(b.value), bx, BOX_Y + 8, { width: BOX_W, align: 'center' });
    doc
      .fill(WHITE)
      .fontSize(7)
      .font('Helvetica')
      .text(b.label.toUpperCase(), bx, BOX_Y + 38, { width: BOX_W, align: 'center' });
  });

  // Risk breakdown text
  doc
    .fill(SUBTLE)
    .fontSize(8)
    .font('Helvetica')
    .text(
      `Risk breakdown  ·  ${counts.critical} Critical   ${counts.high} High   ${counts.medium} Medium   ${counts.low} Low`,
      LEFT,
      BOX_Y + 62,
      { width: pw, align: 'center' }
    );

  // Audit metadata row
  const META_Y = BOX_Y + 78;
  hRule(doc, META_Y, RULE);

  const metaFields = [
    ['Audit Type', audit.auditType || '—'],
    ['Organization', audit.organization || '—'],
    ['Status', audit.status || '—'],
  ];
  const metaColW = pw / metaFields.length;
  metaFields.forEach(([label, value], i) => {
    const mx = LEFT + i * metaColW;
    doc.fill(SUBTLE).fontSize(7).font('Helvetica-Bold').text(label.toUpperCase(), mx, META_Y + 8);
    doc.fill(BRAND_DARK).fontSize(9).font('Helvetica').text(value, mx, META_Y + 20);
  });

  // ── Findings ─────────────────────────────────────────────────
  doc.addPage();

  if (!findings.length) {
    doc
      .fill(SUBTLE)
      .fontSize(11)
      .font('Helvetica')
      .text('No findings have been recorded for this audit.', LEFT, 120, { width: pw, align: 'center' });
  }

  findings.forEach((finding, idx) => {
    // Page break guard — leave 220pt buffer for a finding block
    if (doc.y > doc.page.height - 240) doc.addPage();

    const FY = doc.y;
    const riskColor = RISK_COLOR[finding.risk.level] || '#6B7280';
    const statusColor = STATUS_COLOR[finding.status] || '#6B7280';

    // Left accent bar
    doc.rect(LEFT, FY, 3, 16).fill(riskColor);

    // Finding number + badges
    doc
      .fill(BRAND_DARK)
      .fontSize(10)
      .font('Helvetica-Bold')
      .text(`Finding #${idx + 1}`, LEFT + 10, FY + 3, { continued: true });

    doc
      .fill(riskColor)
      .fontSize(7)
      .font('Helvetica-Bold')
      .text(`  ${(finding.risk.level || 'medium').toUpperCase()}  `, { continued: true });

    doc
      .fill(statusColor)
      .fontSize(7)
      .font('Helvetica')
      .text(`  ${STATUS_LABEL[finding.status] || finding.status}`, { align: 'right' });

    doc.moveDown(0.25);
    hRule(doc, doc.y, RULE);
    doc.moveDown(0.4);

    // Field renderer — label left, value right of it
    const LABEL_X = LEFT;
    const VALUE_X = LEFT + 100;
    const VALUE_W = pw - 100;

    const field = (label, value) => {
      if (!value?.toString().trim()) return;
      const startY = doc.y;
      doc
        .fill(SUBTLE)
        .fontSize(7)
        .font('Helvetica-Bold')
        .text(label.toUpperCase(), LABEL_X, startY, { width: 95 });
      doc
        .fill(BRAND_DARK)
        .fontSize(8.5)
        .font('Helvetica')
        .text(value.toString().trim(), VALUE_X, startY, { width: VALUE_W });
      doc.moveDown(0.55);
    };

    field('Observation', finding.observation);
    field('Risk Description', finding.risk.description || finding.risk.level);
    field('Criteria', finding.criteria || '(criteria not yet populated)');
    field('Recommendation', finding.recommendation || '(recommendation not yet populated)');
    if (finding.analystNotes?.trim()) field('Analyst Notes', finding.analystNotes);
    if (finding.handbookReference?.section) field('Handbook Ref', finding.handbookReference.section);

    // Footer meta
    const assignedTo = finding.assignedTo?.name || '—';
    const createdAt = new Date(finding.createdAt).toLocaleDateString();
    const flagRef = finding.flagId ? ` · Flag: ${finding.flagId._id || finding.flagId}` : '';

    doc
      .fill(SUBTLE)
      .fontSize(7)
      .font('Helvetica')
      .text(
        `Created: ${createdAt}  ·  Assigned: ${assignedTo}  ·  AI Drafted: ${finding.aiDrafted ? 'Yes' : 'No'}${flagRef}`,
        LABEL_X
      );

    doc.moveDown(1.2);
    hRule(doc, doc.y, RULE);
    doc.moveDown(1.2);
  });

  // ── Page footers ─────────────────────────────────────────────
  const range = doc.bufferedPageRange();
  for (let i = range.start; i < range.start + range.count; i++) {
    doc.switchToPage(i);
    doc
      .fill(SUBTLE)
      .fontSize(7)
      .font('Helvetica')
      .text(
        `TriMerge Comply  ·  CONFIDENTIAL  ·  Page ${i - range.start + 1} of ${range.count}`,
        LEFT,
        doc.page.height - 38,
        { width: pw, align: 'center' }
      );
  }

  doc.end();
};

module.exports = { renderFindingsRegisterPdf };
