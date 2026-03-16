import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersModule } from './modules/users/users.module';
import { AuthModule } from './modules/auth/auth.module';
import { CompaniesModule } from './modules/companies/companies.module';
import { EventsModule } from './modules/events/events.module';
import { CommentsModule } from './modules/comments/comments.module';
import { PromoCodesModule } from './modules/promo-codes/promo-codes.module';
import { OrdersModule } from './modules/orders/orders.module';
import { AttendeesModule } from './modules/attendees/attendees.module';
import { SubscriptionsModule } from './modules/subscriptions/subscriptions.module';
import { CompanyNewsModule } from './modules/company-news/company-news.module';
import { NotificationsModule } from './modules/notifications/notifications.module';
import { PaymentsModule } from './modules/payments/payments.module';
import { TicketsModule } from './modules/tickets/tickets.module';
import { MailModule } from './modules/mail/mail.module';
import { ServeStaticModule } from '@nestjs/serve-static';
import * as path from 'path';
import { UploadsModule } from './modules/uploads/uploads.module';

import { APP_GUARD } from '@nestjs/core';
import { JwtGlobalGuard } from './common/guards/jwt-global.guard';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),

    ServeStaticModule.forRoot({
      rootPath: path.resolve(process.cwd(), 'uploads'),
      serveRoot: '/uploads',
    }),

    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get<string>('DB_HOST'),
        port: Number(configService.get<string>('DB_PORT')),
        username: configService.get<string>('DB_USERNAME'),
        password: configService.get<string>('DB_PASSWORD'),
        database: configService.get<string>('DB_NAME'),
        entities: [__dirname + '/**/*.entity{.ts,.js}'],
        synchronize: true,
      }),
    }),

    UsersModule,
    AuthModule,
    CompaniesModule,
    EventsModule,
    CommentsModule,
    PromoCodesModule,
    OrdersModule,
    AttendeesModule,
    SubscriptionsModule,
    CompanyNewsModule,
    NotificationsModule,
    PaymentsModule,
    TicketsModule,
    MailModule,
    UploadsModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: JwtGlobalGuard,
    },
  ],
})
export class AppModule {}
