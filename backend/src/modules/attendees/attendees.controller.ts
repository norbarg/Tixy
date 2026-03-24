//src/modules/attendees/attendees.controller.ts
import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AttendeesService } from './attendees.service';
import { OptionalCurrentUser } from '../../common/decorators/optional-current-user.decorator';
import { Public } from '../../common/decorators/public.decorator';
import { UserRole } from '../../common/enums/user-role.enum';
import { OptionalJwtGuard } from '../../common/guards/optional-jwt.guard';

@ApiTags('Attendees')
@ApiBearerAuth()
@Controller()
export class AttendeesController {
  constructor(private readonly attendeesService: AttendeesService) {}

  @Public()
  @UseGuards(OptionalJwtGuard)
  @Get('events/:id/attendees')
  getEventAttendees(
    @Param('id') eventId: string,
    @OptionalCurrentUser() user?: { sub: string; role: UserRole },
  ) {
    return this.attendeesService.getEventAttendees(eventId, user);
  }
}
