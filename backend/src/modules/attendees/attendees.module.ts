import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EventAttendee } from '../../database/entities/event_attendees.entity';
import { Event } from '../../database/entities/events.entity';
import { Company } from '../../database/entities/companies.entity';
import { User } from '../../database/entities/users.entity';
import { AttendeesController } from './attendees.controller';
import { AttendeesService } from './attendees.service';

@Module({
  imports: [TypeOrmModule.forFeature([EventAttendee, Event, Company, User])],
  controllers: [AttendeesController],
  providers: [AttendeesService],
  exports: [AttendeesService],
})
export class AttendeesModule {}
