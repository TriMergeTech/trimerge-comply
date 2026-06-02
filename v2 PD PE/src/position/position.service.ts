import { BadRequestException, Injectable, NotFoundException, UnprocessableEntityException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CloudinaryStorageService } from '../storage/cloudinary-storage.service';
import { OpenAiService } from '../ai/openai.service';
import { getUploadedBy } from '../common/utils/uploaded-by.util';
import { PositionTextService } from './position-text.service';
import { PositionPromptsService } from './position-prompts.service';
import { PositionUiService } from './position-ui.service';
import { PositionReportPdfService } from './position-report-pdf.service';
import { UpdatePositionReviewDto } from './dto/update-position-review.dto';

const POSITION_FOLDER = 'trimerge-comply/position-documents';
const REVIEW_STATUS_TO_DB = {
  not_reviewed: 'NOT_REVIEWED',
  in_review: 'IN_REVIEW',
  approved: 'APPROVED',
  needs_changes: 'NEEDS_CHANGES',
  dismissed: 'DISMISSED',
};

@Injectable()
export class PositionService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly storage: CloudinaryStorageService,
    private readonly openAi: OpenAiService,
    private readonly textService: PositionTextService,
    private readonly prompts: PositionPromptsService,
    private readonly ui: PositionUiService,
    private readonly pdf: PositionReportPdfService,
  ) {}

  async upload(file: any, user?: any) {
    if (!file?.buffer?.length) {
      throw new BadRequestException('Position document content is required.');
    }

    const extraction = await this.textService.extract({
      fileBuffer: file.buffer,
      fileName: file.originalname,
      mimeType: file.mimetype,
    });

    if (!extraction.supported) throw new UnprocessableEntityException(extraction.reason);
    if (!extraction.text) throw new UnprocessableEntityException(extraction.reason || 'Position document text is empty.');

    const storage = await this.storage.uploadRawFile({
      fileContent: file.buffer,
      fileName: file.originalname,
      mimeType: file.mimetype,
      folder: POSITION_FOLDER,
    });

    const analysis = await this.analyze(extraction.text, file.originalname);
    const document = await (this.prisma as any).positionDocument.create({
      data: {
        fileName: file.originalname,
        mimeType: file.mimetype,
        sizeBytes: file.size || file.buffer.length,
        storage,
        uploadedBy: getUploadedBy(user),
        textLength: extraction.text.length,
        extractedTextPreview: extraction.text.slice(0, 500),
        aiConfigured: this.openAi.isConfigured(),
        analysisStatus: this.openAi.isConfigured() ? 'COMPLETED' : 'SKIPPED',
        analysis,
      },
    });

    return {
      documentId: document.id,
      fileName: document.fileName,
      mimeType: document.mimeType,
      fileType: extraction.fileType,
      storage,
      aiConfigured: this.openAi.isConfigured(),
      analysisStatus: document.analysisStatus.toLowerCase(),
      uiRow: this.ui.buildRow(document),
      analysis: analysis || { summary: '', overallRisk: null, findings: [] },
    };
  }

  async list() {
    const documents = await (this.prisma as any).positionDocument.findMany({
      orderBy: { createdAt: 'desc' },
      take: 100,
    });
    return { documents: documents.map((document) => this.ui.buildRow(document)) };
  }

  async detail(id: string) {
    const document = await this.getById(id);
    return { document: this.ui.buildDetail(document) };
  }

  async updateReview(id: string, dto: UpdatePositionReviewDto, user?: any) {
    if (dto.analystNotes === undefined && dto.resolutionStatus === undefined) {
      throw new BadRequestException('Provide analystNotes or resolutionStatus to update.');
    }

    const data: any = {
      reviewedBy: getUploadedBy(user),
      reviewedAt: new Date(),
    };

    if (dto.analystNotes !== undefined) data.analystNotes = dto.analystNotes.trim();
    if (dto.resolutionStatus !== undefined) data.resolutionStatus = REVIEW_STATUS_TO_DB[dto.resolutionStatus];

    const document = await (this.prisma as any).positionDocument.update({
      where: { id },
      data,
    }).catch(() => null);

    if (!document) throw new NotFoundException('Position document not found.');
    return { document: this.ui.buildDetail(document) };
  }

  async report(id: string, outputStream: any, user?: any) {
    const document = await this.getById(id);
    const documentView = this.ui.buildDetail(document);
    const companyName = user?.companyName || document.uploadedBy?.companyName || null;
    let draft = this.pdf.buildFallbackDraft({ documentView, companyName });

    try {
      const aiDraft = await this.openAi.jsonChat({
        systemPrompt: this.prompts.buildReportSystemPrompt(),
        userPrompt: this.prompts.buildReportUserPrompt({ documentView, companyName }),
        temperature: 0.15,
      });
      if (aiDraft) draft = aiDraft;
    } catch {
      // Use fallback report draft.
    }

    this.pdf.render({ outputStream, documentView, reportDraft: draft, companyName });
  }

  buildReportFileName(fileName = 'position-analysis') {
    const baseName = fileName.replace(/\.[^/.]+$/, '').replace(/[^a-z0-9-_]+/gi, '-').replace(/^-+|-+$/g, '').toLowerCase();
    return `${baseName || 'position-analysis'}-review.pdf`;
  }

  private async getById(id: string) {
    const document = await (this.prisma as any).positionDocument.findUnique({ where: { id } });
    if (!document) throw new NotFoundException('Position document not found.');
    return document;
  }

  private async analyze(text: string, fileName: string) {
    if (!this.openAi.isConfigured()) return null;
    const result = await this.openAi.jsonChat({
      systemPrompt: this.prompts.buildAnalysisSystemPrompt(),
      userPrompt: this.prompts.buildAnalysisUserPrompt({ text, fileName }),
      temperature: 0.2,
    });
    return this.normalizeAnalysis(result);
  }

  private normalizeAnalysis(analysis: any) {
    return {
      summary: analysis?.summary || '',
      overallRisk: ['low', 'medium', 'high'].includes(analysis?.overallRisk) ? analysis.overallRisk : 'low',
      findings: Array.isArray(analysis?.findings)
        ? analysis.findings.map((finding) => ({
            source: 'ai',
            generatedBy: 'openai',
            flagType: 'position_description',
            category: finding.category || 'other',
            severity: ['low', 'medium', 'high'].includes(finding.severity) ? finding.severity : 'low',
            finding: finding.finding || '',
            evidence: finding.evidence || '',
            explanation: finding.explanation || '',
            suggestedImprovement: finding.suggestedImprovement || '',
          }))
        : [],
    };
  }
}
