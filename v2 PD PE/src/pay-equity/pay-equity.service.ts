import { BadRequestException, Injectable, UnprocessableEntityException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CloudinaryStorageService } from '../storage/cloudinary-storage.service';
import { getUploadedBy, getUploaderLabel } from '../common/utils/uploaded-by.util';
import { PayEquityFileService } from './pay-equity-file.service';
import { PayEquityProcessorService } from './pay-equity-processor.service';

const PAY_EQUITY_FOLDER = 'trimerge-comply/pay-equity-uploads';

@Injectable()
export class PayEquityService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly storage: CloudinaryStorageService,
    private readonly fileService: PayEquityFileService,
    private readonly processor: PayEquityProcessorService,
  ) {}

  async upload(file: any, user?: any) {
    if (!file?.buffer?.length) {
      throw new BadRequestException('Pay equity file content is required. Upload .csv, .xlsx, .xls, .pdf, or .docx.');
    }

    const extracted = await this.fileService.extract({
      fileBuffer: file.buffer,
      fileName: file.originalname,
      mimeType: file.mimetype,
    });

    if (!extracted.supported) throw new UnprocessableEntityException(extracted.error);
    if (!extracted.csvText?.trim()) throw new UnprocessableEntityException(extracted.error || 'Could not extract pay equity rows from uploaded file.');

    const result = this.processor.process(extracted.csvText);
    if (!result.valid) {
      throw new UnprocessableEntityException({
        message: 'Pay equity file validation failed.',
        errors: result.errors,
      });
    }

    const storage = await this.storage.uploadRawFile({
      fileContent: file.buffer,
      fileName: file.originalname,
      mimeType: file.mimetype,
      folder: PAY_EQUITY_FOLDER,
    });

    const record = await (this.prisma as any).payEquityAnalysis.create({
      data: {
        fileName: file.originalname,
        mimeType: file.mimetype,
        sizeBytes: file.size || file.buffer.length,
        storage,
        uploadedBy: getUploadedBy(user),
        dataset: result.dataset,
        model: result.model,
        payGaps: result.payGaps,
        summary: result.summary,
        warnings: [...extracted.warnings, ...result.warnings],
        uiSummary: result.uiSummary,
        status: 'PROCESSED',
      },
    });

    return {
      analysisId: record.id,
      fileName: record.fileName,
      mimeType: record.mimeType,
      fileType: extracted.fileType,
      storage,
      dataset: result.dataset,
      model: result.model,
      payGaps: result.payGaps,
      uploadedBy: getUploaderLabel(record.uploadedBy),
      uiSummary: result.uiSummary,
      summary: result.summary,
      warnings: [...extracted.warnings, ...result.warnings],
    };
  }

  async list() {
    const analyses = await (this.prisma as any).payEquityAnalysis.findMany({
      orderBy: { createdAt: 'desc' },
      take: 100,
    });
    return {
      analyses: analyses.map((analysis) => this.toListItem(analysis)),
    };
  }

  private toListItem(analysis: any) {
    const flaggedPayGaps = Array.isArray(analysis.payGaps)
      ? analysis.payGaps.filter((gap) => gap.flagged).length
      : 0;
    const uiSummary = analysis.uiSummary && Object.keys(analysis.uiSummary).length
      ? analysis.uiSummary
      : {
          departmentsAnalyzed: 0,
          demographicGroups: Array.isArray(analysis.payGaps) ? analysis.payGaps.length : 0,
          totalEmployees: analysis.dataset?.rowCount || 0,
          flagsGenerated: flaggedPayGaps,
          payGapsByDepartment: [],
          demographicGapsOverall: Array.isArray(analysis.payGaps)
            ? analysis.payGaps.map((gap) => ({
                demographicGroup: gap.group,
                field: gap.field,
                comparisonGroup: gap.comparisonGroup,
                unadjustedGapPercent: null,
                adjustedGapPercent: gap.estimatedGapPercent,
                flagged: gap.flagged,
              }))
            : [],
        };

    return {
      id: analysis.id,
      fileName: analysis.fileName,
      status: String(analysis.status || 'PROCESSED').toLowerCase(),
      uploadedBy: getUploaderLabel(analysis.uploadedBy),
      date: analysis.createdAt,
      uiSummary,
      summary: analysis.summary || {
        flaggedPayGaps,
        flagsGenerated: uiSummary.flagsGenerated,
        highestSeverity: flaggedPayGaps ? 'high' : 'low',
      },
    };
  }
}
