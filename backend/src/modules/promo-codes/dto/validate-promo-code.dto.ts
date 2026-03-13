//src/modules/promo-codes/dto/validate-promo-code.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsUUID, MaxLength, MinLength } from 'class-validator';

export class ValidatePromoCodeDto {
  @ApiProperty()
  @IsUUID()
  eventId: string;

  @ApiProperty({ example: 'SPRING20' })
  @IsString()
  @MinLength(2)
  @MaxLength(50)
  code: string;
}
