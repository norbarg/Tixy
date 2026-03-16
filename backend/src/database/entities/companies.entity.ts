//src/database/entities/companies.entity.ts
import {
  Column,
  Entity,
  JoinColumn,
  PrimaryGeneratedColumn,
  ManyToOne,
  UpdateDateColumn,
  CreateDateColumn,
} from 'typeorm';
import { User } from './users.entity';

@Entity('companies')
export class Company {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'owner_user_id', unique: true })
  ownerUserId: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'owner_user_id' })
  owner: User;

  @Column()
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string | null;

  @Column()
  email: string;

  @Column({ name: 'avatar_url', type: 'varchar', nullable: true })
  avatarUrl: string | null;

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

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
