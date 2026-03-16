import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CompanyNews } from '../../database/entities/company_news.entity';
import { Company } from '../../database/entities/companies.entity';
import { OrganizerSubscription } from '../../database/entities/organizer_subscriptions.entity';
import { Notification } from '../../database/entities/notifications.entity';
import { User } from '../../database/entities/users.entity';
import { CompanyNewsController } from './company-news.controller';
import { CompanyNewsService } from './company-news.service';
import { MailModule } from '../mail/mail.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      CompanyNews,
      Company,
      OrganizerSubscription,
      Notification,
      User,
    ]),
    MailModule,
  ],
  controllers: [CompanyNewsController],
  providers: [CompanyNewsService],
  exports: [CompanyNewsService],
})
export class CompanyNewsModule {}
