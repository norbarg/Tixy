// src/modules/events/events.controller.ts

import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Query,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { EventsService } from './events.service';
import { Public } from '../../common/decorators/public.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { CreateEventDto } from './dto/create-event.dto';
import { UserRole } from '../../common/enums/user-role.enum';
import { GetEventsQueryDto } from './dto/get-events-query.dto';
import { AttendeesService } from '../attendees/attendees.service';

@ApiTags('Events')
@ApiBearerAuth()
@Controller('events')
export class EventsController {
  constructor(
    private readonly eventsService: EventsService,
    private readonly attendeesService: AttendeesService,
  ) {}

  @Post()
  createEvent(
    @CurrentUser() user: { sub: string },
    @Body() dto: CreateEventDto,
  ) {
    return this.eventsService.create(user.sub, dto);
  }

  @Get('my-attending')
  getMyAttendingEvents(@CurrentUser() user: { sub: string }) {
    return this.attendeesService.getMyAttendingEvents(user.sub);
  }

  @Public()
  @Get()
  getAllEvents(@Query() query: GetEventsQueryDto) {
    return this.eventsService.getAllPublic(query);
  }

  @Public()
  @Get(':id')
  getEventById(@Param('id') id: string) {
    return this.eventsService.getPublicById(id);
  }

  @Delete(':id')
  deleteEvent(
    @Param('id') id: string,
    @CurrentUser() user: { sub: string; role: UserRole },
  ) {
    return this.eventsService.delete(id, user);
  }
}
