import { Body, Controller, Delete, Get, Param, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { CommentsService } from './comments.service';
import { CreateCommentDto } from './dto/create-comment.dto';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Public } from '../../common/decorators/public.decorator';
import { UserRole } from '../../common/enums/user-role.enum';

@ApiTags('Comments')
@ApiBearerAuth()
@Controller('comments')
export class CommentsController {
  constructor(private readonly commentsService: CommentsService) {}

  @Post()
  createComment(
    @CurrentUser() user: { sub: string },
    @Body() dto: CreateCommentDto,
  ) {
    return this.commentsService.create(user.sub, dto);
  }

  @Public()
  @Get('event/:eventId')
  getCommentsByEvent(@Param('eventId') eventId: string) {
    return this.commentsService.getByEventId(eventId);
  }

  @Delete(':id')
  deleteComment(
    @Param('id') id: string,
    @CurrentUser() user: { sub: string; role: UserRole },
  ) {
    return this.commentsService.delete(id, user);
  }
}
