//src/database/entities/event_attendees.entity.ts
import {
  Column,
  Entity,
  ManyToOne,
  JoinColumn,
  PrimaryGeneratedColumn,
  CreateDateColumn,
} from 'typeorm';
import { Event } from './events.entity';
import { User } from './users.entity';
import { Order } from './orders.entity';

@Entity('event_attendees')
export class EventAttendee {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'event_id' })
  eventId: string;

  @ManyToOne(() => Event, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'event_id' })
  event: Event;

  @Column({ name: 'user_id' })
  userId: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ name: 'order_id' })
  orderId: string;

  @ManyToOne(() => Order, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'order_id' })
  order: Order;

  @Column({ type: 'integer' })
  quantity: number;

  @Column({ name: 'show_in_visitors', default: true })
  showInVisitors: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
