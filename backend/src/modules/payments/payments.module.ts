//src/modules/payments/payments.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Order } from '../../database/entities/orders.entity';
import { EventAttendee } from '../../database/entities/event_attendees.entity';
import { PaymentsController } from './payments.controller';
import { PaymentsService } from './payments.service';
import { MailModule } from '../mail/mail.module';
import { TicketsModule } from '../tickets/tickets.module';
import { Event } from '../../database/entities/events.entity';
import { Company } from '../../database/entities/companies.entity';
import { User } from '../../database/entities/users.entity';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Order, EventAttendee, Event, Company, User]),
    MailModule,
    TicketsModule,
    NotificationsModule,
  ],
  controllers: [PaymentsController],
  providers: [PaymentsService],
})
export class PaymentsModule {}
