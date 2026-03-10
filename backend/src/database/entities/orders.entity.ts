//src/database/entities/orders.entity.ts
import {
  Column,
  Entity,
  ManyToOne,
  JoinColumn,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
  CreateDateColumn,
} from 'typeorm';
import { User } from './users.entity';
import { Event } from './events.entity';
import { PromoCode } from './promo_codes.entity';
import { PaymentStatus } from '../../common/enums/payment-status.enum';

@Entity('orders')
export class Order {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'user_id' })
  userId: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ name: 'event_id' })
  eventId: string;

  @ManyToOne(() => Event, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'event_id' })
  event: Event;

  @Column({ name: 'promo_code_id', type: 'uuid', nullable: true })
  promoCodeId: string | null;

  @ManyToOne(() => PromoCode, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'promo_code_id' })
  promoCode: PromoCode | null;

  @Column({ type: 'integer' })
  quantity: number;

  @Column({ name: 'unit_price', type: 'decimal', precision: 10, scale: 2 })
  unitPrice: string;

  @Column({ name: 'discount_percent', type: 'integer', default: 0 })
  discountPercent: number;

  @Column({ name: 'total_price', type: 'decimal', precision: 10, scale: 2 })
  totalPrice: string;

  @Column({ name: 'show_user_in_visitors', default: true })
  showUserInVisitors: boolean;

  @Column({
    name: 'stripe_checkout_session_id',
    type: 'varchar',
    nullable: true,
  })
  stripeCheckoutSessionId: string | null;

  @Column({ name: 'stripe_payment_intent_id', type: 'varchar', nullable: true })
  stripePaymentIntentId: string | null;

  @Column({
    name: 'payment_status',
    type: 'enum',
    enum: PaymentStatus,
    default: PaymentStatus.PENDING,
  })
  paymentStatus: PaymentStatus;

  @Column({ name: 'paid_at', type: 'timestamp', nullable: true })
  paidAt: Date | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
