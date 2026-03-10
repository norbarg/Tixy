//src/database/entities/promo_codes.entity.ts
import {
  Column,
  Entity,
  ManyToOne,
  JoinColumn,
  Unique,
  CreateDateColumn,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Event } from './events.entity';

@Entity('promo_codes')
@Unique(['eventId', 'code'])
export class PromoCode {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'event_id' })
  eventId: string;

  @ManyToOne(() => Event, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'event_id' })
  event: Event;

  @Column()
  code: string;

  @Column({ name: 'discount_percent', type: 'integer' })
  discountPercent: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
