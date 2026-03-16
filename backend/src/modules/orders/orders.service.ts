//src/modules/orders/orders.service.ts
import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
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

    return this.sanitizeOrder(savedOrder);
  }

  async getMyOrders(userId: string) {
    const orders = await this.ordersRepository.find({
      where: { userId },
      order: { createdAt: 'DESC' },
    });

    return orders.map((order) => this.sanitizeOrder(order));
  }

  async getMyOrderById(orderId: string, userId: string) {
    const order = await this.findById(orderId);

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    if (order.userId !== userId) {
      throw new ForbiddenException('You do not have access to this order');
    }

    return this.sanitizeOrder(order);
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

    return this.sanitizeOrder(updatedOrder);
  }

  private sanitizeOrder(order: Order) {
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
    };
  }
}
