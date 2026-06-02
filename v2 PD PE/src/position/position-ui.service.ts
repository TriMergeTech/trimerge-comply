import { Injectable } from '@nestjs/common';
import { getUploaderLabel } from '../common/utils/uploaded-by.util';

@Injectable()
export class PositionUiService {
  private normalizeStatus(status = '') {
    const normalized = status.toLowerCase();
    if (normalized === 'completed' || normalized === 'failed') return normalized;
    return 'processing';
  }

  private normalizeReviewStatus(status = '') {
    return status.toLowerCase();
  }

  countFlags(analysis: any) {
    return Array.isArray(analysis?.findings) ? analysis.findings.length : 0;
  }

  buildRow(document: any) {
    return {
      id: document.id,
      documentName: document.fileName,
      status: this.normalizeStatus(document.analysisStatus),
      flags: this.countFlags(document.analysis),
      uploadedBy: getUploaderLabel(document.uploadedBy),
      date: document.createdAt,
      view: null,
    };
  }

  buildFlagSummary(analysis: any) {
    return Array.isArray(analysis?.findings)
      ? analysis.findings.map((finding, index) => ({
          id: finding.id || `ai-finding-${index + 1}`,
          title: finding.finding || finding.explanation || 'AI finding',
          severity: ['low', 'medium', 'high'].includes(finding.severity) ? finding.severity : 'low',
          category: finding.category || 'other',
          evidence: finding.evidence || '',
          explanation: finding.explanation || '',
        }))
      : [];
  }

  buildRecommendations(analysis: any) {
    if (!Array.isArray(analysis?.findings)) return [];
    return Array.from(new Set(analysis.findings.map((finding) => finding.suggestedImprovement).filter(Boolean)));
  }

  buildDetail(document: any) {
    return {
      ...this.buildRow(document),
      fileName: document.fileName,
      mimeType: document.mimeType,
      storage: document.storage,
      summary: document.analysis?.summary || '',
      overallRisk: document.analysis?.overallRisk || null,
      flagSummary: this.buildFlagSummary(document.analysis),
      aiRecommendations: this.buildRecommendations(document.analysis),
      analystNotes: document.analystNotes || '',
      resolutionStatus: this.normalizeReviewStatus(document.resolutionStatus || 'not_reviewed'),
      reviewedBy: document.reviewedBy || null,
      reviewedAt: document.reviewedAt || null,
      textPreview: document.extractedTextPreview || '',
    };
  }
}
