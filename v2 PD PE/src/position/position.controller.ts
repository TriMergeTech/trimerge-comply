import {
  Body,
  Controller,
  Get,
  Header,
  Param,
  Patch,
  Post,
  Res,
  UploadedFile,
  UseInterceptors,
  VERSION_NEUTRAL,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiBody, ApiConsumes, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Response } from 'express';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { PositionService } from './position.service';
import { UpdatePositionReviewDto } from './dto/update-position-review.dto';

@ApiTags('Position Description AI')
@Controller({ path: 'position', version: VERSION_NEUTRAL })
export class PositionController {
  constructor(private readonly positionService: PositionService) {}

  @Get()
  @ApiOperation({ summary: 'List position description analyses' })
  list() {
    return this.positionService.list();
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
    return this.positionService.upload(file, user);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get position analysis detail view' })
  detail(@Param('id') id: string) {
    return this.positionService.detail(id);
  }

  @Patch(':id/review')
  @ApiOperation({ summary: 'Update analyst review fields' })
  updateReview(@Param('id') id: string, @Body() dto: UpdatePositionReviewDto, @CurrentUser() user?: any) {
    return this.positionService.updateReview(id, dto, user);
  }

  @Get(':id/report')
  @Header('Content-Type', 'application/pdf')
  @ApiOperation({ summary: 'Download position analysis PDF report' })
  @ApiResponse({ status: 200, description: 'PDF report downloaded successfully' })
  async report(@Param('id') id: string, @Res() res: Response, @CurrentUser() user?: any) {
    const detail = await this.positionService.detail(id);
    const fileName = this.positionService.buildReportFileName(detail.document.fileName);
    res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
    return this.positionService.report(id, res, user);
  }
}
