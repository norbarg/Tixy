import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsUUID, MaxLength, MinLength } from 'class-validator';

export class CreateCommentDto {
  @ApiProperty()
  @IsUUID()
  eventId: string;

  @ApiProperty({ example: 'Очень интересный ивент!' })
  @IsString()
  @MinLength(1)
  @MaxLength(2000)
  content: string;
}
