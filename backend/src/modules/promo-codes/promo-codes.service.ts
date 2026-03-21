// promo-codes.service.ts
import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PromoCode } from '../../database/entities/promo_codes.entity';
import { Event } from '../../database/entities/events.entity';
import { Company } from '../../database/entities/companies.entity';
import { CreatePromoCodeDto } from './dto/create-promo-code.dto';
import { ValidatePromoCodeDto } from './dto/validate-promo-code.dto';
import { UserRole } from '../../common/enums/user-role.enum';

@Injectable()
export class PromoCodesService {
  constructor(
    @InjectRepository(PromoCode)
    private readonly promoCodesRepository: Repository<PromoCode>,
    @InjectRepository(Event)
    private readonly eventsRepository: Repository<Event>,
    @InjectRepository(Company)
    private readonly companiesRepository: Repository<Company>,
  ) {}

  findById(id: string): Promise<PromoCode | null> {
    return this.promoCodesRepository.findOne({
      where: { id },
    });
  }

  async create(
    dto: CreatePromoCodeDto,
    currentUser: { sub: string; role: UserRole },
  ) {
    const event = await this.eventsRepository.findOne({
      where: { id: dto.eventId },
    });

    if (!event) {
      throw new NotFoundException('Event not found');
    }

    await this.ensureIsEventOwner(event, currentUser);

    const normalizedCode = dto.code.trim().toUpperCase();

    const existingPromoCode = await this.promoCodesRepository.findOne({
      where: {
        eventId: dto.eventId,
        code: normalizedCode,
      },
    });

    if (existingPromoCode) {
      throw new ConflictException('Promo code already exists for this event');
    }

    const promoCode = this.promoCodesRepository.create({
      eventId: dto.eventId,
      code: normalizedCode,
      discountPercent: dto.discountPercent,
    });

    const savedPromoCode = await this.promoCodesRepository.save(promoCode);

    return this.sanitizePromoCode(savedPromoCode);
  }

  async getByEventId(
    eventId: string,
    currentUser: { sub: string; role: UserRole },
  ) {
    const event = await this.eventsRepository.findOne({
      where: { id: eventId },
    });

    if (!event) {
      throw new NotFoundException('Event not found');
    }

    await this.ensureCanViewOrManageEvent(event, currentUser);

    const promoCodes = await this.promoCodesRepository.find({
      where: { eventId },
      order: { createdAt: 'DESC' },
    });

    return promoCodes.map((promoCode) => this.sanitizePromoCode(promoCode));
  }

  async validate(dto: ValidatePromoCodeDto) {
    const normalizedCode = dto.code.trim().toUpperCase();

    const promoCode = await this.promoCodesRepository.findOne({
      where: {
        eventId: dto.eventId,
        code: normalizedCode,
      },
    });

    if (!promoCode) {
      throw new NotFoundException('Promo code not found');
    }

    return {
      id: promoCode.id,
      eventId: promoCode.eventId,
      code: promoCode.code,
      discountPercent: promoCode.discountPercent,
      isValid: true,
    };
  }

  async delete(id: string, currentUser: { sub: string; role: UserRole }) {
    const promoCode = await this.findById(id);

    if (!promoCode) {
      throw new NotFoundException('Promo code not found');
    }

    const event = await this.eventsRepository.findOne({
      where: { id: promoCode.eventId },
    });

    if (!event) {
      throw new NotFoundException('Event not found');
    }

    await this.ensureCanViewOrManageEvent(event, currentUser);

    await this.promoCodesRepository.remove(promoCode);

    return {
      message: 'Promo code deleted successfully',
    };
  }

  private async ensureIsEventOwner(
    event: Event,
    currentUser: { sub: string; role: UserRole },
  ) {
    const company = await this.companiesRepository.findOne({
      where: { id: event.companyId },
    });

    if (!company) {
      throw new NotFoundException('Company not found');
    }

    const isOwner = company.ownerUserId === currentUser.sub;

    if (!isOwner) {
      throw new ForbiddenException('Only event owner can create promo codes');
    }
  }

  private async ensureCanViewOrManageEvent(
    event: Event,
    currentUser: { sub: string; role: UserRole },
  ) {
    if (currentUser.role === UserRole.ADMIN) {
      return;
    }

    const company = await this.companiesRepository.findOne({
      where: { id: event.companyId },
    });

    if (!company) {
      throw new NotFoundException('Company not found');
    }

    const isOwner = company.ownerUserId === currentUser.sub;

    if (!isOwner) {
      throw new ForbiddenException('You do not have access to this event');
    }
  }

  private sanitizePromoCode(promoCode: PromoCode) {
    return {
      id: promoCode.id,
      eventId: promoCode.eventId,
      code: promoCode.code,
      discountPercent: promoCode.discountPercent,
      createdAt: promoCode.createdAt,
    };
  }
}
