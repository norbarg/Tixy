// promo-codes.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PromoCode } from '../../database/entities/promo_codes.entity';
import { Event } from '../../database/entities/events.entity';
import { Company } from '../../database/entities/companies.entity';
import { PromoCodesController } from './promo-codes.controller';
import { PromoCodesService } from './promo-codes.service';

@Module({
  imports: [TypeOrmModule.forFeature([PromoCode, Event, Company])],
  controllers: [PromoCodesController],
  providers: [PromoCodesService],
  exports: [PromoCodesService, TypeOrmModule],
})
export class PromoCodesModule {}
