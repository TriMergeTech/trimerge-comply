import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsIn, IsOptional, IsString, MaxLength } from 'class-validator';

export class UpdatePositionReviewDto {
  @ApiPropertyOptional({
    example: 'Reviewed flagged issues. Recommend updating physical requirement details.',
  })
  @IsOptional()
  @IsString()
  @MaxLength(5000)
  analystNotes?: string;

  @ApiPropertyOptional({
    enum: ['not_reviewed', 'in_review', 'approved', 'needs_changes', 'dismissed'],
    example: 'in_review',
  })
  @IsOptional()
  @IsString()
  @IsIn(['not_reviewed', 'in_review', 'approved', 'needs_changes', 'dismissed'])
  resolutionStatus?: string;
}
