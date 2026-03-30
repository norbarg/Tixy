//src/modules/orders/orders.service.ts
import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { Order } from '../../database/entities/orders.entity';
import { Event } from '../../database/entities/events.entity';
import { PromoCode } from '../../database/entities/promo_codes.entity';
import { CreateOrderDto } from './dto/create-order.dto';
import { PaymentStatus } from '../../common/enums/payment-status.enum';

@Injectable()
export class OrdersService {
  constructor(
    @InjectRepository(Order)
    private readonly ordersRepository: Repository<Order>,
    @InjectRepository(Event)
    private readonly eventsRepository: Repository<Event>,
    @InjectRepository(PromoCode)
    private readonly promoCodesRepository: Repository<PromoCode>,
  ) {}

  findById(id: string): Promise<Order | null> {
    return this.ordersRepository.findOne({
      where: { id },
    });
  }

  async create(userId: string, dto: CreateOrderDto) {
    const event = await this.eventsRepository.findOne({
      where: { id: dto.eventId },
    });

    if (!event) {
      throw new NotFoundException('Event not found');
    }

    const soldOrReservedOrders = await this.ordersRepository.find({
      where: [
        {
          eventId: dto.eventId,
          paymentStatus: PaymentStatus.PAID,
        },
        {
          eventId: dto.eventId,
          paymentStatus: PaymentStatus.PENDING,
        },
      ],
    });

    const reservedTickets = soldOrReservedOrders.reduce(
      (sum, order) => sum + order.quantity,
      0,
    );

    const availableTickets = event.ticketsLimit - reservedTickets;

    if (availableTickets <= 0) {
      throw new BadRequestException('No tickets left for this event');
    }

    if (dto.quantity > availableTickets) {
      throw new BadRequestException(
        `Only ${availableTickets} ticket(s) left for this event`,
      );
    }

    let promoCodeEntity: PromoCode | null = null;
    let discountPercent = 0;

    if (dto.promoCode) {
      const normalizedCode = dto.promoCode.trim().toUpperCase();

      promoCodeEntity = await this.promoCodesRepository.findOne({
        where: {
          eventId: dto.eventId,
          code: normalizedCode,
        },
      });

      if (!promoCodeEntity) {
        throw new NotFoundException('Promo code not found');
      }

      discountPercent = promoCodeEntity.discountPercent;
    }

    const unitPrice = Number(event.price);
    const quantity = dto.quantity;
    const fullPrice = unitPrice * quantity;
    const totalPrice = fullPrice * (1 - discountPercent / 100);

    const order = this.ordersRepository.create({
      userId,
      eventId: dto.eventId,
      promoCodeId: promoCodeEntity?.id ?? null,
      quantity,
      unitPrice: unitPrice.toFixed(2),
      discountPercent,
      totalPrice: totalPrice.toFixed(2),
      showUserInVisitors: dto.showUserInVisitors ?? true,
      stripeCheckoutSessionId: null,
      stripePaymentIntentId: null,
      paymentStatus: PaymentStatus.PENDING,
      paidAt: null,
    });

    const savedOrder = await this.ordersRepository.save(order);

    return this.sanitizeOrder(savedOrder, event);
  }

  async getMyOrders(userId: string) {
    const orders = await this.ordersRepository.find({
      where: { userId },
      order: { createdAt: 'DESC' },
    });

    if (orders.length === 0) {
      return [];
    }

    const eventIds = [...new Set(orders.map((order) => order.eventId))];

    const events = await this.eventsRepository.findBy({
      id: In(eventIds),
    });

    const eventsMap = new Map(events.map((event) => [event.id, event]));

    return orders.map((order) =>
      this.sanitizeOrder(order, eventsMap.get(order.eventId) ?? null),
    );
  }

  async getMyOrderById(orderId: string, userId: string) {
    const order = await this.findById(orderId);

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    if (order.userId !== userId) {
      throw new ForbiddenException('You do not have access to this order');
    }

    const event = await this.eventsRepository.findOne({
      where: { id: order.eventId },
    });

    return this.sanitizeOrder(order, event);
  }

  async cancelMyPendingOrder(orderId: string, userId: string) {
    const order = await this.findById(orderId);

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    if (order.userId !== userId) {
      throw new ForbiddenException('You do not have access to this order');
    }

    if (order.paymentStatus !== PaymentStatus.PENDING) {
      throw new BadRequestException('Only pending orders can be cancelled');
    }

    order.paymentStatus = PaymentStatus.CANCELLED;

    const updatedOrder = await this.ordersRepository.save(order);

    const event = await this.eventsRepository.findOne({
      where: { id: updatedOrder.eventId },
    });

    return this.sanitizeOrder(updatedOrder, event);
  }

  private sanitizeOrder(order: Order, event: Event | null) {
    return {
      id: order.id,
      userId: order.userId,
      eventId: order.eventId,
      promoCodeId: order.promoCodeId,
      quantity: order.quantity,
      unitPrice: order.unitPrice,
      discountPercent: order.discountPercent,
      totalPrice: order.totalPrice,
      showUserInVisitors: order.showUserInVisitors,
      stripeCheckoutSessionId: order.stripeCheckoutSessionId,
      stripePaymentIntentId: order.stripePaymentIntentId,
      paymentStatus: order.paymentStatus,
      paidAt: order.paidAt,
      createdAt: order.createdAt,
      updatedAt: order.updatedAt,
      event: event
        ? {
            id: event.id,
            title: event.title,
            startsAt: event.startsAt,
            endsAt: event.endsAt,
            placeAddress: event.placeAddress,
          }
        : null,
    };
  }
}
