//get-companies-query.dto.ts
import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class GetCompaniesQueryDto {
  @ApiPropertyOptional({ example: 'tech' })
  @IsOptional()
  @IsString()
  search?: string;
}
