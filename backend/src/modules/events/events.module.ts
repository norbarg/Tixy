//src/modules/events/events.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Event } from '../../database/entities/events.entity';
import { Company } from '../../database/entities/companies.entity';
import { EventsController } from './events.controller';
import { EventsService } from './events.service';
import { AttendeesModule } from '../attendees/attendees.module';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Event, Company]),
    AttendeesModule,
    NotificationsModule,
  ],
  controllers: [EventsController],
  providers: [EventsService],
  exports: [EventsService, TypeOrmModule],
})
export class EventsModule {}
