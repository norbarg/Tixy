//src/modules/attendees/attendees.service.ts
import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { EventAttendee } from '../../database/entities/event_attendees.entity';
import { Event } from '../../database/entities/events.entity';
import { Company } from '../../database/entities/companies.entity';
import { User } from '../../database/entities/users.entity';
import { UserRole } from '../../common/enums/user-role.enum';
import { VisitorsVisibility } from '../../common/enums/visitors-visibility.enum';

@Injectable()
export class AttendeesService {
  constructor(
    @InjectRepository(EventAttendee)
    private readonly attendeesRepository: Repository<EventAttendee>,
    @InjectRepository(Event)
    private readonly eventsRepository: Repository<Event>,
    @InjectRepository(Company)
    private readonly companiesRepository: Repository<Company>,
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
  ) {}

  async getMyAttendingEvents(userId: string) {
    const attendees = await this.attendeesRepository.find({
      where: { userId },
      order: { createdAt: 'DESC' },
    });

    if (attendees.length === 0) {
      return [];
    }

    const eventIds = [
      ...new Set(attendees.map((attendee) => attendee.eventId)),
    ];

    const events = await this.eventsRepository.findBy({
      id: In(eventIds),
    });

    return events.map((event) => ({
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
    }));
  }

  async getEventAttendees(
    eventId: string,
    currentUser?: { sub: string; role: UserRole },
  ) {
    const event = await this.eventsRepository.findOne({
      where: { id: eventId },
    });

    if (!event) {
      throw new NotFoundException('Event not found');
    }

    const company = await this.companiesRepository.findOne({
      where: { id: event.companyId },
    });

    if (!company) {
      throw new NotFoundException('Company not found');
    }

    const isAdmin = currentUser?.role === UserRole.ADMIN;
    const isOwner = currentUser?.sub === company.ownerUserId;

    if (isAdmin || isOwner) {
      const attendees = await this.attendeesRepository.find({
        where: { eventId },
        order: { createdAt: 'DESC' },
      });

      return this.mapAttendeesWithUsers(attendees);
    }

    if (!currentUser) {
      if (event.visitorsVisibility !== VisitorsVisibility.PUBLIC) {
        throw new ForbiddenException(
          'You do not have access to attendees list',
        );
      }

      const attendees = await this.attendeesRepository.find({
        where: {
          eventId,
          showInVisitors: true,
        },
        order: { createdAt: 'DESC' },
      });

      return this.mapAttendeesWithUsers(attendees, true);
    }

    const currentUserAttendee = await this.attendeesRepository.findOne({
      where: {
        eventId,
        userId: currentUser.sub,
      },
    });

    if (
      event.visitorsVisibility === VisitorsVisibility.ATTENDEES_ONLY &&
      !currentUserAttendee
    ) {
      throw new ForbiddenException('You do not have access to attendees list');
    }

    const attendees = await this.attendeesRepository.find({
      where: {
        eventId,
        showInVisitors: true,
      },
      order: { createdAt: 'DESC' },
    });

    return this.mapAttendeesWithUsers(attendees, true);
  }

  private async mapAttendeesWithUsers(
    attendees: EventAttendee[],
    publicView = false,
  ) {
    if (attendees.length === 0) {
      return [];
    }

    const userIds = [...new Set(attendees.map((attendee) => attendee.userId))];

    const users = await this.usersRepository.findBy({
      id: In(userIds),
    });

    const usersMap = new Map(users.map((user) => [user.id, user]));

    return attendees.map((attendee) => {
      const user = usersMap.get(attendee.userId);

      return {
        id: attendee.id,
        eventId: attendee.eventId,
        userId: attendee.userId,
        orderId: attendee.orderId,
        quantity: attendee.quantity,
        showInVisitors: attendee.showInVisitors,
        createdAt: attendee.createdAt,
        user: user
          ? {
              id: user.id,
              login: user.login,
              ...(publicView ? {} : { email: user.email }),
            }
          : null,
      };
    });
  }
}
