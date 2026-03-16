import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EventSubscription } from '../../database/entities/event_subscriptions.entity';
import { OrganizerSubscription } from '../../database/entities/organizer_subscriptions.entity';
import { Event } from '../../database/entities/events.entity';
import { Company } from '../../database/entities/companies.entity';
import { SubscriptionsController } from './subscriptions.controller';
import { SubscriptionsService } from './subscriptions.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      EventSubscription,
      OrganizerSubscription,
      Event,
      Company,
    ]),
  ],
  controllers: [SubscriptionsController],
  providers: [SubscriptionsService],
  exports: [SubscriptionsService],
})
export class SubscriptionsModule {}
