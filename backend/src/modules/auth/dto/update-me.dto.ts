import { ApiProperty } from '@nestjs/swagger';
import { IsString, Matches, MaxLength, MinLength } from 'class-validator';

export class UpdateLoginDto {
  @ApiProperty({ example: 'new_login_123' })
  @IsString()
  @MinLength(3)
  @MaxLength(30)
  @Matches(/^[a-zA-Z0-9_]+$/, {
    message: 'login can contain only letters, numbers and underscore',
  })
  login: string;
}
