//src/modules/events/dto/create-event.dto.ts
import {
  IsBoolean,
  IsDateString,
  IsEnum,
  IsInt,
  IsNumberString,
  IsOptional,
  IsString,
  MaxLength,
  Min,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { EventFormat } from '../../../common/enums/event-format.enum';
import { VisitorsVisibility } from '../../../common/enums/visitors-visibility.enum';
import { EventCategory } from '../../../common/enums/event-category.enum';

export class CreateEventDto {
  @ApiProperty({ example: 'Frontend Conference 2026' })
  @IsString()
  @MaxLength(255)
  title: string;

  @ApiProperty({ example: 'Большая конференция по frontend-разработке.' })
  @IsString()
  description: string;

  @ApiProperty({ enum: EventFormat, example: EventFormat.CONFERENCE })
  @IsEnum(EventFormat)
  format: EventFormat;

  @ApiProperty({ enum: EventCategory, example: EventCategory.TECHNOLOGY })
  @IsEnum(EventCategory)
  category: EventCategory;

  @ApiPropertyOptional({ example: 'https://example.com/banner.jpg' })
  @IsOptional()
  @IsString()
  bannerUrl?: string;

  @ApiPropertyOptional({ example: 'https://example.com/poster.jpg' })
  @IsOptional()
  @IsString()
  posterUrl?: string;

  @ApiProperty({ example: 'Palace of Students' })
  @IsString()
  @MaxLength(255)
  placeName: string;

  @ApiPropertyOptional({ example: 'Kharkiv, main street 1' })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  placeAddress?: string;

  @ApiPropertyOptional({ example: 'https://maps.google.com/...' })
  @IsOptional()
  @IsString()
  googleMapsUrl?: string;

  @ApiPropertyOptional({ example: 'ChIJN1t_tDeuEmsRUsoyG83frY4' })
  @IsOptional()
  @IsString()
  googlePlaceId?: string;

  @ApiPropertyOptional({ example: '49.9935000' })
  @IsOptional()
  @IsNumberString()
  placeLat?: string;

  @ApiPropertyOptional({ example: '36.2304000' })
  @IsOptional()
  @IsNumberString()
  placeLng?: string;

  @ApiProperty({ example: '2026-04-10T10:00:00.000Z' })
  @IsDateString()
  startsAt: string;

  @ApiProperty({ example: '2026-04-10T18:00:00.000Z' })
  @IsDateString()
  endsAt: string;
  //--------------------------------------------------------косательно публикации события, может быть указано при создании, если организатор хочет сразу опубликовать событие, иначе событие будет сохранено как черновик (неопубликованное) и его можно будет опубликовать позже, указав дату публикации--------------------------------------------------------
  @ApiPropertyOptional({ example: '2026-04-05T12:00:00.000Z' })
  @IsOptional()
  @IsDateString()
  publishedAt?: string;

  @ApiProperty({ example: '499.99' })
  @IsNumberString()
  price: string;

  @ApiProperty({ example: 300 })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  ticketsLimit: number;

  @ApiPropertyOptional({
    enum: VisitorsVisibility,
    example: VisitorsVisibility.PUBLIC,
  })
  @IsOptional()
  @IsEnum(VisitorsVisibility)
  visitorsVisibility?: VisitorsVisibility;

  @ApiPropertyOptional({ example: false })
  @IsOptional()
  @IsBoolean()
  notifyOnNewVisitor?: boolean;
}
