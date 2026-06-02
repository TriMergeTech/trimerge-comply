import { Module } from '@nestjs/common';
import { AiModule } from '../ai/ai.module';
import { PrismaModule } from '../prisma/prisma.module';
import { StorageModule } from '../storage/storage.module';
import { PositionController } from './position.controller';
import { PositionPromptsService } from './position-prompts.service';
import { PositionReportPdfService } from './position-report-pdf.service';
import { PositionService } from './position.service';
import { PositionTextService } from './position-text.service';
import { PositionUiService } from './position-ui.service';

@Module({
  imports: [AiModule, PrismaModule, StorageModule],
  controllers: [PositionController],
  providers: [
    PositionService,
    PositionTextService,
    PositionPromptsService,
    PositionUiService,
    PositionReportPdfService,
  ],
})
export class PositionModule {}
