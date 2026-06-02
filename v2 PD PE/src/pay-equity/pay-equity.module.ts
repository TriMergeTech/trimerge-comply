import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { StorageModule } from '../storage/storage.module';
import { CsvService } from './csv.service';
import { MatrixService } from './matrix.service';
import { OlsService } from './ols.service';
import { PayEquityController } from './pay-equity.controller';
import { PayEquityFileService } from './pay-equity-file.service';
import { PayEquityProcessorService } from './pay-equity-processor.service';
import { PayEquityService } from './pay-equity.service';

@Module({
  imports: [PrismaModule, StorageModule],
  controllers: [PayEquityController],
  providers: [
    PayEquityService,
    PayEquityFileService,
    PayEquityProcessorService,
    CsvService,
    MatrixService,
    OlsService,
  ],
})
export class PayEquityModule {}
