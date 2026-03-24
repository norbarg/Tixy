//src/database/entities/events.entity.ts
import {
  Column,
  Entity,
  ManyToOne,
  JoinColumn,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
  CreateDateColumn,
} from 'typeorm';
import { Company } from './companies.entity';
import { EventFormat } from '../../common/enums/event-format.enum';
import { VisitorsVisibility } from '../../common/enums/visitors-visibility.enum';
import { EventStatus } from '../../common/enums/event-status.enum';
import { EventCategory } from '../../common/enums/event-category.enum';

@Entity('events')
export class Event {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'company_id' })
  companyId: string;

  @ManyToOne(() => Company, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'company_id' })
  company: Company;

  @Column()
  title: string;

  @Column({ type: 'text' })
  description: string;

  @Column({
    type: 'enum',
    enum: EventFormat,
  })
  format: EventFormat;

  @Column({
    type: 'enum',
    enum: EventCategory,
  })
  category: EventCategory;

  @Column({ name: 'banner_url', type: 'varchar', nullable: true })
  bannerUrl: string | null;

  @Column({ name: 'poster_url', type: 'varchar', nullable: true })
  posterUrl: string | null;

  @Column({ name: 'place_name' })
  placeName: string;

  @Column({ name: 'place_address', type: 'varchar', nullable: true })
  placeAddress: string | null;

  @Column({ name: 'google_maps_url', type: 'varchar', nullable: true })
  googleMapsUrl: string | null;

  @Column({ name: 'google_place_id', type: 'varchar', nullable: true })
  googlePlaceId: string | null;

  @Column({
    name: 'place_lat',
    type: 'decimal',
    precision: 10,
    scale: 7,
    nullable: true,
  })
  placeLat: string | null;

  @Column({
    name: 'place_lng',
    type: 'decimal',
    precision: 10,
    scale: 7,
    nullable: true,
  })
  placeLng: string | null;

  @Column({ name: 'starts_at', type: 'timestamp' })
  startsAt: Date;

  @Column({ name: 'ends_at', type: 'timestamp' })
  endsAt: Date;

  @Column({ name: 'published_at', type: 'timestamp' })
  publishedAt: Date;

  @Column({
    name: 'redirect_after_purchase_url',
    type: 'varchar',
    length: 2048,
    nullable: true,
  })
  redirectAfterPurchaseUrl: string | null;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  price: string;

  @Column({ name: 'tickets_limit', type: 'integer' })
  ticketsLimit: number;

  @Column({
    name: 'visitors_visibility',
    type: 'enum',
    enum: VisitorsVisibility,
    default: VisitorsVisibility.PUBLIC,
  })
  visitorsVisibility: VisitorsVisibility;

  @Column({ name: 'notify_on_new_visitor', default: false })
  notifyOnNewVisitor: boolean;

  @Column({
    type: 'enum',
    enum: EventStatus,
    default: EventStatus.PUBLISHED,
  })
  status: EventStatus;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
