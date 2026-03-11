//src/modules/events/events.service.ts
import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Brackets } from 'typeorm';
import { Event } from '../../database/entities/events.entity';
import { Company } from '../../database/entities/companies.entity';
import { CreateEventDto } from './dto/create-event.dto';
import { UserRole } from '../../common/enums/user-role.enum';
import { EventStatus } from '../../common/enums/event-status.enum';
import { VisitorsVisibility } from '../../common/enums/visitors-visibility.enum';
import { GetEventsQueryDto } from './dto/get-events-query.dto';

@Injectable()
export class EventsService {
  constructor(
    @InjectRepository(Event)
    private readonly eventsRepository: Repository<Event>,
    @InjectRepository(Company)
    private readonly companiesRepository: Repository<Company>,
  ) {}

  findById(id: string): Promise<Event | null> {
    return this.eventsRepository.findOne({
      where: { id },
    });
  }

  async findCompanyByOwnerUserId(ownerUserId: string): Promise<Company | null> {
    return this.companiesRepository.findOne({
      where: { ownerUserId },
    });
  }

  async create(ownerUserId: string, dto: CreateEventDto) {
    const company = await this.findCompanyByOwnerUserId(ownerUserId);

    if (!company) {
      throw new NotFoundException('Company for current user not found');
    }

    if (new Date(dto.endsAt) <= new Date(dto.startsAt)) {
      throw new BadRequestException('endsAt must be later than startsAt');
    }

    const now = new Date();

    const event = this.eventsRepository.create({
      companyId: company.id,
      title: dto.title,
      description: dto.description,
      format: dto.format,
      category: dto.category,
      bannerUrl: dto.bannerUrl ?? null,
      posterUrl: dto.posterUrl ?? null,
      placeName: dto.placeName,
      placeAddress: dto.placeAddress ?? null,
      googleMapsUrl: dto.googleMapsUrl ?? null,
      googlePlaceId: dto.googlePlaceId ?? null,
      placeLat: dto.placeLat ?? null,
      placeLng: dto.placeLng ?? null,
      startsAt: new Date(dto.startsAt),
      endsAt: new Date(dto.endsAt),
      publishedAt: now,
      price: dto.price,
      ticketsLimit: dto.ticketsLimit,
      visitorsVisibility: dto.visitorsVisibility ?? VisitorsVisibility.PUBLIC,
      notifyOnNewVisitor: dto.notifyOnNewVisitor ?? false,
      status: EventStatus.PUBLISHED,
    });

    const hasAnyMapPointField =
      dto.googlePlaceId !== undefined ||
      dto.placeLat !== undefined ||
      dto.placeLng !== undefined;

    const hasFullMapPointField =
      dto.googlePlaceId !== undefined &&
      dto.placeLat !== undefined &&
      dto.placeLng !== undefined;

    if (hasAnyMapPointField && !hasFullMapPointField) {
      throw new BadRequestException(
        'googlePlaceId, placeLat and placeLng must be provided together',
      );
    }

    const savedEvent = await this.eventsRepository.save(event);

    return this.sanitizePrivateEvent(savedEvent);
  }

  async getAllPublic(query: GetEventsQueryDto) {
    const qb = this.eventsRepository.createQueryBuilder('event');

    qb.where('event.status = :status', {
      status: EventStatus.PUBLISHED,
    });

    if (query.format) {
      qb.andWhere('event.format = :format', {
        format: query.format,
      });
    }

    if (query.category) {
      qb.andWhere('event.category = :category', {
        category: query.category,
      });
    }

    if (query.search) {
      qb.andWhere(
        new Brackets((subQb) => {
          subQb
            .where('event.title ILIKE :search', {
              search: `%${query.search}%`,
            })
            .orWhere('event.description ILIKE :search', {
              search: `%${query.search}%`,
            })
            .orWhere('event.placeName ILIKE :search', {
              search: `%${query.search}%`,
            })
            .orWhere('event.placeAddress ILIKE :search', {
              search: `%${query.search}%`,
            });
        }),
      );
    }

    if (query.place) {
      qb.andWhere(
        new Brackets((subQb) => {
          subQb
            .where('event.placeName ILIKE :place', {
              place: `%${query.place}%`,
            })
            .orWhere('event.placeAddress ILIKE :place', {
              place: `%${query.place}%`,
            });
        }),
      );
    }

    if (query.date) {
      const startOfDay = new Date(`${query.date}T00:00:00.000Z`);
      const endOfDay = new Date(`${query.date}T23:59:59.999Z`);

      qb.andWhere('event.startsAt BETWEEN :startOfDay AND :endOfDay', {
        startOfDay,
        endOfDay,
      });
    }

    qb.orderBy('event.startsAt', 'ASC');

    const events = await qb.getMany();

    return events.map((event) => this.sanitizePublicEvent(event));
  }

  async getPublicById(id: string) {
    const event = await this.findById(id);

    if (!event || event.status !== EventStatus.PUBLISHED) {
      throw new NotFoundException('Event not found');
    }

    return this.sanitizePublicEvent(event);
  }

  async delete(eventId: string, currentUser: { sub: string; role: UserRole }) {
    const event = await this.findById(eventId);

    if (!event) {
      throw new NotFoundException('Event not found');
    }

    await this.ensureCanManageEvent(event, currentUser);

    await this.eventsRepository.remove(event);

    return {
      message: 'Event deleted successfully',
    };
  }

  private async ensureCanManageEvent(
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

  private sanitizePublicEvent(event: Event) {
    return {
      id: event.id,
      companyId: event.companyId,
      title: event.title,
      description: event.description,
      format: event.format,
      category: event.category,
      bannerUrl: event.bannerUrl,
      posterUrl: event.posterUrl,
      placeName: event.placeName,
      placeAddress: event.placeAddress,
      googleMapsUrl: event.googleMapsUrl,
      googlePlaceId: event.googlePlaceId,
      placeLat: event.placeLat,
      placeLng: event.placeLng,
      startsAt: event.startsAt,
      endsAt: event.endsAt,
      publishedAt: event.publishedAt,
      price: event.price,
      ticketsLimit: event.ticketsLimit,
      visitorsVisibility: event.visitorsVisibility,
      status: event.status,
      createdAt: event.createdAt,
      updatedAt: event.updatedAt,
    };
  }

  private sanitizePrivateEvent(event: Event) {
    return {
      id: event.id,
      companyId: event.companyId,
      title: event.title,
      description: event.description,
      format: event.format,
      category: event.category,
      bannerUrl: event.bannerUrl,
      posterUrl: event.posterUrl,
      placeName: event.placeName,
      placeAddress: event.placeAddress,
      googleMapsUrl: event.googleMapsUrl,
      googlePlaceId: event.googlePlaceId,
      placeLat: event.placeLat,
      placeLng: event.placeLng,
      startsAt: event.startsAt,
      endsAt: event.endsAt,
      publishedAt: event.publishedAt,
      price: event.price,
      ticketsLimit: event.ticketsLimit,
      visitorsVisibility: event.visitorsVisibility,
      notifyOnNewVisitor: event.notifyOnNewVisitor,
      status: event.status,
      createdAt: event.createdAt,
      updatedAt: event.updatedAt,
    };
  }
}
