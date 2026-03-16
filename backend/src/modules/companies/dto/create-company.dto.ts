import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEmail,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
  IsNumberString,
} from 'class-validator';

export class CreateCompanyDto {
  @ApiProperty({ example: 'Tech Events UA' })
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  name: string;

  @ApiPropertyOptional({
    example: 'Организация конференций и лекций для студентов.',
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ example: 'company@example.com' })
  @IsEmail()
  email: string;

  @ApiPropertyOptional({ example: 'https://example.com/avatar.png' })
  @IsOptional()
  @IsString()
  avatarUrl?: string;

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
}
