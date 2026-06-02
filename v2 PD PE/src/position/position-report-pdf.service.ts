import { Injectable } from '@nestjs/common';
const PDFDocument = require('pdfkit');

const PAGE_LEFT = 54;
const PAGE_RIGHT = 558;
const CONTENT_WIDTH = PAGE_RIGHT - PAGE_LEFT;
const SEVERITY_COLORS = { high: '#dc2626', medium: '#d97706', low: '#16a34a' };

@Injectable()
export class PositionReportPdfService {
  private truncate(value = '', maxLength = 180) {
    const text = String(value || '').replace(/\s+/g, ' ').trim();
    return text.length > maxLength ? `${text.slice(0, maxLength - 3)}...` : text;
  }

  private cleanLine(value = '') {
    return String(value || '').replace(/\s+/g, ' ').trim().replace(/[.]+$/g, '');
  }

  private label(value = '') {
    return String(value || 'not_reviewed')
      .split('_')
      .filter(Boolean)
      .map((part) => part[0].toUpperCase() + part.slice(1).toLowerCase())
      .join(' ');
  }

  buildFallbackDraft({ documentView, companyName }: { documentView: any; companyName: string | null }) {
    return {
      reportTitle: 'Position Description Analysis',
      organizationLine: `${companyName || 'TriMerge Comply'} Compliance Review`,
      executiveSummary: this.truncate(
        documentView.summary || 'AI analysis identified position description findings for analyst review.',
        260,
      ),
      keyFindings: documentView.flagSummary.slice(0, 4).map((flag) => ({
        title: flag.title,
        severity: flag.severity,
        summary: flag.explanation || flag.evidence || flag.category,
      })),
      recommendations: documentView.aiRecommendations.slice(0, 4),
      reviewConclusion: 'Human review is required before findings are included in final compliance reporting.',
    };
  }

  render({ outputStream, documentView, reportDraft, companyName }) {
    const draft = reportDraft || this.buildFallbackDraft({ documentView, companyName });
    const companyDisplay = this.cleanLine(companyName) || 'Not provided';
    const organizationLine = this.cleanLine(
      companyName ? `${companyName} Compliance Review` : 'TriMerge Comply Compliance Review',
    );
    const doc = new PDFDocument({
      size: 'LETTER',
      margins: { top: 36, bottom: 30, left: PAGE_LEFT, right: PAGE_LEFT },
      bufferPages: false,
    });

    doc.pipe(outputStream);
    doc.rect(0, 0, 612, 74).fill('#11154a');
    doc.font('Helvetica-Bold').fontSize(22).fillColor('#ffffff').text(
      'Position Description Analysis',
      PAGE_LEFT,
      27,
      { width: CONTENT_WIDTH, align: 'center' },
    );
    doc.font('Helvetica-Bold').fontSize(10).fillColor('#11154a').text(organizationLine, PAGE_LEFT, 92, {
      width: CONTENT_WIDTH,
      align: 'center',
    });

    const metaY = 122;
    doc.roundedRect(PAGE_LEFT, metaY - 10, CONTENT_WIDTH, 74, 4).strokeColor('#d1d5db').lineWidth(0.8).stroke();
    this.meta(doc, 'Document', documentView.documentName, PAGE_LEFT + 16, metaY);
    this.meta(doc, 'Company', companyDisplay, PAGE_LEFT + 16, metaY + 18);
    this.meta(doc, 'Uploaded By', documentView.uploadedBy, PAGE_LEFT + 16, metaY + 36);
    this.meta(doc, 'Review Date', new Date().toLocaleDateString('en-US'), PAGE_LEFT + 270, metaY);
    this.meta(doc, 'Status', this.label(documentView.resolutionStatus), PAGE_LEFT + 270, metaY + 18);
    this.meta(doc, 'Overall Risk', this.label(documentView.overallRisk || 'not specified'), PAGE_LEFT + 270, metaY + 36);

    doc.y = 204;
    this.section(doc, 'Executive Summary');
    doc.font('Helvetica').fontSize(8.5).fillColor('#111827').text(this.truncate(draft.executiveSummary, 260), PAGE_LEFT, doc.y, {
      width: CONTENT_WIDTH,
      lineGap: 1.5,
    });

    this.section(doc, 'Flag Summary');
    const findings = draft.keyFindings?.slice(0, 4) || [];
    if (findings.length) findings.forEach((finding) => this.finding(doc, finding));
    else doc.font('Helvetica').fontSize(8.5).fillColor('#4b5563').text('No AI-generated flags were found.');

    this.section(doc, 'AI Recommendations');
    const recommendations = draft.recommendations?.slice(0, 4) || [];
    if (recommendations.length) {
      recommendations.forEach((recommendation) => {
        doc.font('Helvetica').fontSize(8.3).fillColor('#111827').text(
          `- ${this.truncate(recommendation, 132)}`,
          PAGE_LEFT,
          doc.y,
          { width: CONTENT_WIDTH, lineGap: 1 },
        );
      });
    } else {
      doc.font('Helvetica').fontSize(8.5).fillColor('#4b5563').text('No AI recommendations were generated.');
    }

    this.section(doc, 'Analyst Review');
    doc.font('Helvetica-Bold').fontSize(8.5).fillColor('#111827').text('Analyst Notes:', PAGE_LEFT, doc.y, {
      continued: true,
    }).font('Helvetica').text(` ${this.truncate(documentView.analystNotes || 'No analyst notes provided.', 210)}`);
    doc.font('Helvetica-Bold').fontSize(8.5).fillColor('#111827').text('Resolution Status:', PAGE_LEFT, doc.y, {
      continued: true,
    }).font('Helvetica').text(` ${this.label(documentView.resolutionStatus)}`);

    doc.font('Helvetica-Oblique').fontSize(7.8).fillColor('#4b5563').text(
      this.truncate(draft.reviewConclusion, 180),
      PAGE_LEFT,
      744,
      { width: CONTENT_WIDTH, align: 'center' },
    );
    doc.end();
  }

  private meta(doc, label, value, x, y) {
    doc.font('Helvetica-Bold').fontSize(8).fillColor('#4b5563').text(label, x, y, { width: 78 });
    doc.font('Helvetica').fontSize(8).fillColor('#111827').text(this.truncate(value, 60), x + 82, y, { width: 178 });
  }

  private section(doc, title) {
    doc.moveDown(0.45).font('Helvetica-Bold').fontSize(10.5).fillColor('#111827').text(title, PAGE_LEFT, doc.y, {
      width: CONTENT_WIDTH,
    });
    doc.moveTo(PAGE_LEFT, doc.y + 3).lineTo(PAGE_RIGHT, doc.y + 3).strokeColor('#d1d5db').lineWidth(0.6).stroke().moveDown(0.45);
  }

  private finding(doc, finding) {
    const severity = finding.severity || 'low';
    const color = SEVERITY_COLORS[severity] || SEVERITY_COLORS.low;
    const startY = doc.y;
    doc.roundedRect(PAGE_LEFT + 2, startY + 1, 8, 8, 1.5).fill(color);
    doc.font('Helvetica-Bold').fontSize(8.5).fillColor('#111827').text(this.truncate(finding.title, 86), PAGE_LEFT + 18, startY, {
      width: 330,
    });
    doc.font('Helvetica-Bold').fontSize(8).fillColor(color).text(severity.toUpperCase(), PAGE_RIGHT - 58, startY, {
      width: 58,
      align: 'right',
    });
    doc.font('Helvetica').fontSize(7.5).fillColor('#4b5563').text(
      this.truncate(finding.summary || finding.explanation, 130),
      PAGE_LEFT + 18,
      startY + 12,
      { width: CONTENT_WIDTH - 18 },
    );
    doc.y = startY + 30;
  }
}
