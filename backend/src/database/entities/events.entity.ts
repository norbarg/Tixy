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

  @Column()
  category: string;

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

  @Column({ name: 'starts_at', type: 'timestamp' })
  startsAt: Date;

  @Column({ name: 'ends_at', type: 'timestamp' })
  endsAt: Date;

  @Column({ name: 'published_at', type: 'timestamp', nullable: true })
  publishedAt: Date | null;

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
    default: EventStatus.DRAFT,
  })
  status: EventStatus;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
