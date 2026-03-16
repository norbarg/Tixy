//src/modules/notifications/notifications.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Notification } from '../../database/entities/notifications.entity';
import { OrganizerSubscription } from '../../database/entities/organizer_subscriptions.entity';
import { EventSubscription } from '../../database/entities/event_subscriptions.entity';
import { User } from '../../database/entities/users.entity';
import { Event } from '../../database/entities/events.entity';
import { Company } from '../../database/entities/companies.entity';
import { NotificationsController } from './notifications.controller';
import { NotificationsService } from './notifications.service';
import { MailModule } from '../mail/mail.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Notification,
      OrganizerSubscription,
      EventSubscription,
      User,
      Event,
      Company,
    ]),
    MailModule,
  ],
  controllers: [NotificationsController],
  providers: [NotificationsService],
  exports: [NotificationsService],
})
export class NotificationsModule {}
