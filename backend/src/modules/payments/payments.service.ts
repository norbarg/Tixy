//src/modules/payments/payments.service.ts
import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import Stripe from 'stripe';
import { Order } from '../../database/entities/orders.entity';
import { EventAttendee } from '../../database/entities/event_attendees.entity';
import { PaymentStatus } from '../../common/enums/payment-status.enum';
import { TicketsService } from '../tickets/tickets.service';
import { MailService } from '../mail/mail.service';
import { Event } from '../../database/entities/events.entity';
import { Company } from '../../database/entities/companies.entity';
import { User } from '../../database/entities/users.entity';
import { NotificationsService } from '../notifications/notifications.service';

@Injectable()
export class PaymentsService {
  private readonly stripe: Stripe;

  constructor(
    @InjectRepository(Order)
    private readonly ordersRepository: Repository<Order>,
    @InjectRepository(EventAttendee)
    private readonly attendeesRepository: Repository<EventAttendee>,
    @InjectRepository(Event)
    private readonly eventsRepository: Repository<Event>,
    @InjectRepository(Company)
    private readonly companiesRepository: Repository<Company>,
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
    private readonly ticketsService: TicketsService,
    private readonly mailService: MailService,
    private readonly notificationsService: NotificationsService,
  ) {
    this.stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string);
  }

  async createCheckoutSession(orderId: string, userId: string) {
    const order = await this.ordersRepository.findOne({
      where: { id: orderId },
    });

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    if (order.userId !== userId) {
      throw new ForbiddenException('You do not have access to this order');
    }

    if (order.paymentStatus !== PaymentStatus.PENDING) {
      throw new BadRequestException('Only pending orders can be paid');
    }

    const event = await this.eventsRepository.findOne({
      where: { id: order.eventId },
    });

    if (!event) {
      throw new NotFoundException('Event not found');
    }

    const defaultSuccessUrl = `${process.env.FRONTEND_URL}/`;

    const successUrl = event.redirectAfterPurchaseUrl
      ? event.redirectAfterPurchaseUrl
      : defaultSuccessUrl;

    const session = await this.stripe.checkout.sessions.create({
      mode: 'payment',
      line_items: [
        {
          quantity: 1,
          price_data: {
            currency: 'usd',
            product_data: {
              name: `Order ${order.id}`,
            },
            unit_amount: Math.round(Number(order.totalPrice) * 100),
          },
        },
      ],
      success_url: successUrl,
      cancel_url: `${process.env.FRONTEND_URL}/events/${event.id}`,
      metadata: {
        orderId: order.id,
        userId: order.userId,
        eventId: order.eventId,
      },
    });

    order.stripeCheckoutSessionId = session.id;
    await this.ordersRepository.save(order);

    return {
      checkoutUrl: session.url,
    };
  }

  async handleCheckoutCompleted(session: Stripe.Checkout.Session) {
    const orderId = session.metadata?.orderId;

    if (!orderId) {
      return;
    }

    const order = await this.ordersRepository.findOne({
      where: { id: orderId },
    });

    if (!order) {
      return;
    }

    if (order.paymentStatus === PaymentStatus.PAID) {
      return;
    }

    order.paymentStatus = PaymentStatus.PAID;
    order.paidAt = new Date();
    order.stripePaymentIntentId =
      typeof session.payment_intent === 'string'
        ? session.payment_intent
        : null;

    await this.ordersRepository.save(order);

    const existingAttendee = await this.attendeesRepository.findOne({
      where: {
        orderId: order.id,
      },
    });

    if (!existingAttendee) {
      const attendee = this.attendeesRepository.create({
        eventId: order.eventId,
        userId: order.userId,
        orderId: order.id,
        quantity: order.quantity,
        showInVisitors: order.showUserInVisitors,
      });

      await this.attendeesRepository.save(attendee);
    }
    const event = await this.eventsRepository.findOne({
      where: { id: order.eventId },
    });

    if (event && event.notifyOnNewVisitor) {
      const company = await this.companiesRepository.findOne({
        where: { id: event.companyId },
      });

      const buyer = await this.usersRepository.findOne({
        where: { id: order.userId },
      });

      if (company && buyer) {
        await this.notificationsService.createNewVisitorNotification({
          userId: company.ownerUserId,
          eventTitle: event.title,
          visitorLogin: buyer.login,
        });
      }
    }
    const ticketData =
      await this.ticketsService.generatePaidOrderTicketPdfForEmail(order.id);

    await this.mailService.sendTicketEmail({
      to: ticketData.user.email,
      userLogin: ticketData.user.login,
      eventTitle: ticketData.event.title,
      orderId: ticketData.order.id,
      attachments: ticketData.attachments,
    });
  }

  constructWebhookEvent(rawBody: Buffer, signature: string) {
    return this.stripe.webhooks.constructEvent(
      rawBody,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET as string,
    );
  }
}
