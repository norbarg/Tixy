//src/modules/subscriptions/subscriptions.service.ts
import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { EventSubscription } from '../../database/entities/event_subscriptions.entity';
import { OrganizerSubscription } from '../../database/entities/organizer_subscriptions.entity';
import { Event } from '../../database/entities/events.entity';
import { Company } from '../../database/entities/companies.entity';

@Injectable()
export class SubscriptionsService {
  constructor(
    @InjectRepository(EventSubscription)
    private readonly eventSubscriptionsRepository: Repository<EventSubscription>,
    @InjectRepository(OrganizerSubscription)
    private readonly organizerSubscriptionsRepository: Repository<OrganizerSubscription>,
    @InjectRepository(Event)
    private readonly eventsRepository: Repository<Event>,
    @InjectRepository(Company)
    private readonly companiesRepository: Repository<Company>,
  ) {}

  async subscribeToEvent(userId: string, eventId: string) {
    const event = await this.eventsRepository.findOne({
      where: { id: eventId },
    });

    if (!event) {
      throw new NotFoundException('Event not found');
    }

    const existingSubscription =
      await this.eventSubscriptionsRepository.findOne({
        where: {
          eventId,
          userId,
        },
      });

    if (existingSubscription) {
      throw new ConflictException('You are already subscribed to this event');
    }

    const subscription = this.eventSubscriptionsRepository.create({
      eventId,
      userId,
    });

    const savedSubscription =
      await this.eventSubscriptionsRepository.save(subscription);

    return {
      id: savedSubscription.id,
      eventId: savedSubscription.eventId,
      userId: savedSubscription.userId,
      createdAt: savedSubscription.createdAt,
    };
  }

  async unsubscribeFromEvent(userId: string, eventId: string) {
    const subscription = await this.eventSubscriptionsRepository.findOne({
      where: {
        eventId,
        userId,
      },
    });

    if (!subscription) {
      throw new NotFoundException('Event subscription not found');
    }

    await this.eventSubscriptionsRepository.remove(subscription);

    return {
      message: 'Unsubscribed from event successfully',
    };
  }

  async subscribeToCompany(userId: string, companyId: string) {
    const company = await this.companiesRepository.findOne({
      where: { id: companyId },
    });

    if (!company) {
      throw new NotFoundException('Company not found');
    }

    const existingSubscription =
      await this.organizerSubscriptionsRepository.findOne({
        where: {
          companyId,
          userId,
        },
      });

    if (existingSubscription) {
      throw new ConflictException('You are already subscribed to this company');
    }

    const subscription = this.organizerSubscriptionsRepository.create({
      companyId,
      userId,
    });

    const savedSubscription =
      await this.organizerSubscriptionsRepository.save(subscription);

    return {
      id: savedSubscription.id,
      companyId: savedSubscription.companyId,
      userId: savedSubscription.userId,
      createdAt: savedSubscription.createdAt,
    };
  }

  async unsubscribeFromCompany(userId: string, companyId: string) {
    const subscription = await this.organizerSubscriptionsRepository.findOne({
      where: {
        companyId,
        userId,
      },
    });

    if (!subscription) {
      throw new NotFoundException('Company subscription not found');
    }

    await this.organizerSubscriptionsRepository.remove(subscription);

    return {
      message: 'Unsubscribed from company successfully',
    };
  }

  async getMySubscriptions(userId: string) {
    const [eventSubscriptions, companySubscriptions] = await Promise.all([
      this.eventSubscriptionsRepository.find({
        where: { userId },
        order: { createdAt: 'DESC' },
      }),
      this.organizerSubscriptionsRepository.find({
        where: { userId },
        order: { createdAt: 'DESC' },
      }),
    ]);

    const eventIds = [
      ...new Set(eventSubscriptions.map((item) => item.eventId)),
    ];
    const companyIds = [
      ...new Set(companySubscriptions.map((item) => item.companyId)),
    ];

    const [events, companies] = await Promise.all([
      eventIds.length
        ? this.eventsRepository.findBy({ id: In(eventIds) })
        : Promise.resolve([]),
      companyIds.length
        ? this.companiesRepository.findBy({ id: In(companyIds) })
        : Promise.resolve([]),
    ]);

    const eventsMap = new Map(events.map((event) => [event.id, event]));
    const companiesMap = new Map(
      companies.map((company) => [company.id, company]),
    );

    return {
      events: eventSubscriptions.map((subscription) => {
        const event = eventsMap.get(subscription.eventId);

        return {
          id: subscription.id,
          eventId: subscription.eventId,
          createdAt: subscription.createdAt,
          event: event
            ? {
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
              }
            : null,
        };
      }),
      companies: companySubscriptions.map((subscription) => {
        const company = companiesMap.get(subscription.companyId);

        return {
          id: subscription.id,
          companyId: subscription.companyId,
          createdAt: subscription.createdAt,
          company: company
            ? {
                id: company.id,
                name: company.name,
                description: company.description,
                email: company.email,
                avatarUrl: company.avatarUrl,
                placeAddress: company.placeAddress,
                googleMapsUrl: company.googleMapsUrl,
                googlePlaceId: company.googlePlaceId,
                placeLat: company.placeLat,
                placeLng: company.placeLng,
                createdAt: company.createdAt,
                updatedAt: company.updatedAt,
              }
            : null,
        };
      }),
    };
  }
}
