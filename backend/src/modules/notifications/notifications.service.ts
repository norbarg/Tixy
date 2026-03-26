//src/modules/notifications/notifications.service.ts
import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { Notification } from '../../database/entities/notifications.entity';
import { OrganizerSubscription } from '../../database/entities/organizer_subscriptions.entity';
import { EventSubscription } from '../../database/entities/event_subscriptions.entity';
import { User } from '../../database/entities/users.entity';
import { Event } from '../../database/entities/events.entity';
import { Company } from '../../database/entities/companies.entity';
import { MailService } from '../mail/mail.service';
import { NotificationType } from '../../common/enums/notification-type.enum';
import { Cron, CronExpression } from '@nestjs/schedule';
import { Between } from 'typeorm';

@Injectable()
export class NotificationsService {
  constructor(
    @InjectRepository(Notification)
    private readonly notificationsRepository: Repository<Notification>,
    @InjectRepository(OrganizerSubscription)
    private readonly organizerSubscriptionsRepository: Repository<OrganizerSubscription>,
    @InjectRepository(EventSubscription)
    private readonly eventSubscriptionsRepository: Repository<EventSubscription>,
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
    @InjectRepository(Event)
    private readonly eventsRepository: Repository<Event>,
    @InjectRepository(Company)
    private readonly companiesRepository: Repository<Company>,
    private readonly mailService: MailService,
  ) {}

  @Cron(CronExpression.EVERY_MINUTE)
  async handleEventReminders() {
    const now = new Date();

    const from = new Date(now.getTime() + 24 * 60 * 60 * 1000);
    const to = new Date(from.getTime() + 60 * 1000);

    const events = await this.eventsRepository.find({
      where: {
        startsAt: Between(from, to),
      },
    });

    if (events.length === 0) {
      return;
    }

    for (const event of events) {
      await this.createEventReminderNotifications(event.id);
    }
  }

  async getMyNotifications(userId: string) {
    const notifications = await this.notificationsRepository.find({
      where: { userId },
      order: { createdAt: 'DESC' },
    });

    return notifications.map((notification) =>
      this.sanitizeNotification(notification),
    );
  }

  async markAsRead(notificationId: string, userId: string) {
    const notification = await this.notificationsRepository.findOne({
      where: { id: notificationId },
    });

    if (!notification) {
      throw new NotFoundException('Notification not found');
    }

    if (notification.userId !== userId) {
      throw new ForbiddenException(
        'You do not have access to this notification',
      );
    }

    notification.isRead = true;

    const updated = await this.notificationsRepository.save(notification);

    return this.sanitizeNotification(updated);
  }

  async markAllAsRead(userId: string) {
    await this.notificationsRepository.update(
      { userId, isRead: false },
      { isRead: true },
    );

    return {
      message: 'All notifications marked as read',
    };
  }

  async createNewEventNotifications(eventId: string) {
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

    const subscriptions = await this.organizerSubscriptionsRepository.find({
      where: { companyId: company.id },
    });

    if (subscriptions.length === 0) {
      return;
    }

    const userIds = [...new Set(subscriptions.map((item) => item.userId))];

    const users = await this.usersRepository.findBy({
      id: In(userIds),
    });

    if (users.length === 0) {
      return;
    }

    const title = `New event from ${company.name}`;
    const body = `${event.title} is now available.`;

    const notifications = users.map((user) =>
      this.notificationsRepository.create({
        userId: user.id,
        type: NotificationType.NEW_EVENT,
        title,
        body,
        sentViaEmail: false,
        sentViaSite: true,
        isRead: false,
      }),
    );

    await this.notificationsRepository.save(notifications);

    await Promise.all(
      users.map(async (user) => {
        try {
          await this.mailService.sendSimpleEmail({
            to: user.email,
            subject: title,
            text: [`Hello, ${user.login}!`, '', body].join('\n'),
          });

          await this.notificationsRepository.update(
            {
              userId: user.id,
              type: NotificationType.NEW_EVENT,
              title,
              body,
            },
            { sentViaEmail: true },
          );
        } catch (error) {
          console.error(
            `Failed to send NEW_EVENT email to ${user.email}:`,
            error,
          );
        }
      }),
    );
  }

  async createEventReminderNotifications(eventId: string) {
    const event = await this.eventsRepository.findOne({
      where: { id: eventId },
    });

    if (!event) {
      throw new NotFoundException('Event not found');
    }

    const subscriptions = await this.eventSubscriptionsRepository.find({
      where: { eventId },
    });

    if (subscriptions.length === 0) {
      return;
    }

    const userIds = [...new Set(subscriptions.map((item) => item.userId))];

    const users = await this.usersRepository.findBy({
      id: In(userIds),
    });

    if (users.length === 0) {
      return;
    }

    const title = `Reminder: ${event.title} starts in 24 hours`;
    const body = `Your subscribed event "${event.title}" will start in 24 hours.`;

    const existingNotifications = await this.notificationsRepository.find({
      where: {
        userId: In(userIds),
        type: NotificationType.EVENT_REMINDER,
        title,
        body,
      },
    });

    const alreadyNotifiedUserIds = new Set(
      existingNotifications.map((item) => item.userId),
    );

    const usersToNotify = users.filter(
      (user) => !alreadyNotifiedUserIds.has(user.id),
    );

    if (usersToNotify.length === 0) {
      return;
    }

    const notifications = usersToNotify.map((user) =>
      this.notificationsRepository.create({
        userId: user.id,
        type: NotificationType.EVENT_REMINDER,
        title,
        body,
        sentViaEmail: false,
        sentViaSite: true,
        isRead: false,
      }),
    );

    await this.notificationsRepository.save(notifications);

    await Promise.all(
      usersToNotify.map(async (user) => {
        try {
          await this.mailService.sendSimpleEmail({
            to: user.email,
            subject: title,
            text: [`Hello, ${user.login}!`, '', body].join('\n'),
          });

          await this.notificationsRepository.update(
            {
              userId: user.id,
              type: NotificationType.EVENT_REMINDER,
              title,
              body,
            },
            { sentViaEmail: true },
          );
        } catch (error) {
          console.error(
            `Failed to send EVENT_REMINDER email to ${user.email}:`,
            error,
          );
        }
      }),
    );
  }

  async createNewVisitorNotification(params: {
    userId: string;
    eventTitle: string;
    visitorLogin: string;
  }) {
    const { userId, eventTitle, visitorLogin } = params;

    const notification = this.notificationsRepository.create({
      userId,
      type: NotificationType.NEW_EVENT_VISITOR,
      title: `New visitor for ${eventTitle}`,
      body: `${visitorLogin} has joined your event.`,
      sentViaEmail: false,
      sentViaSite: true,
      isRead: false,
    });

    const saved = await this.notificationsRepository.save(notification);

    return this.sanitizeNotification(saved);
  }

  private sanitizeNotification(notification: Notification) {
    return {
      id: notification.id,
      userId: notification.userId,
      type: notification.type,
      title: notification.title,
      body: notification.body,
      sentViaEmail: notification.sentViaEmail,
      sentViaSite: notification.sentViaSite,
      isRead: notification.isRead,
      createdAt: notification.createdAt,
    };
  }
}
