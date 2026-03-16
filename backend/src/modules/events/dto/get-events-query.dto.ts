import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsDateString, IsEnum, IsOptional, IsString } from 'class-validator';
import { EventFormat } from '../../../common/enums/event-format.enum';
import { EventCategory } from '../../../common/enums/event-category.enum';

export class GetEventsQueryDto {
  @ApiPropertyOptional({ example: 'frontend' })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({ example: 'Kyiv' })
  @IsOptional()
  @IsString()
  place?: string;

  @ApiPropertyOptional({ example: '2026-04-10' })
  @IsOptional()
  @IsDateString()
  date?: string;

  @ApiPropertyOptional({ enum: EventFormat, example: EventFormat.CONFERENCE })
  @IsOptional()
  @IsEnum(EventFormat)
  format?: EventFormat;

  @ApiPropertyOptional({
    enum: EventCategory,
    example: EventCategory.TECHNOLOGY,
  })
  @IsOptional()
  @IsEnum(EventCategory)
  category?: EventCategory;
}
