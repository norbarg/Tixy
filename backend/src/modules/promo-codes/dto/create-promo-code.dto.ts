//src/modules/promo-codes/dto/create-promo-code.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import {
  IsInt,
  IsString,
  IsUUID,
  Max,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreatePromoCodeDto {
  @ApiProperty()
  @IsUUID()
  eventId: string;

  @ApiProperty({ example: 'SPRING20' })
  @IsString()
  @MinLength(2)
  @MaxLength(50)
  code: string;

  @ApiProperty({ example: 20 })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  discountPercent: number;
}
