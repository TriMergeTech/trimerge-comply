import { Controller, Get, Post, UploadedFile, UseInterceptors, VERSION_NEUTRAL } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiBody, ApiConsumes, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { PayEquityService } from './pay-equity.service';

@ApiTags('Pay Equity')
@Controller({ path: 'payequity', version: VERSION_NEUTRAL })
export class PayEquityController {
  constructor(private readonly payEquityService: PayEquityService) {}

  @Get()
  @ApiOperation({ summary: 'List pay equity analyses' })
  list() {
    return this.payEquityService.list();
  }

  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      required: ['file'],
      properties: {
        file: { type: 'string', format: 'binary' },
      },
    },
  })
  upload(@UploadedFile() file: any, @CurrentUser() user?: any) {
    return this.payEquityService.upload(file, user);
  }
}
