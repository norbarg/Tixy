import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsUUID, MaxLength, MinLength } from 'class-validator';

export class CreateCompanyNewsDto {
  @ApiProperty()
  @IsUUID()
  companyId: string;

  @ApiProperty({ example: 'New summer event announced' })
  @IsString()
  @MinLength(2)
  @MaxLength(255)
  title: string;

  @ApiProperty({
    example: 'We are happy to announce our new event this summer.',
  })
  @IsString()
  @MinLength(1)
  @MaxLength(5000)
  content: string;
}
