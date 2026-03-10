//src/database/entities/organizer_subscriptions.entity.ts
import {
  Column,
  Entity,
  ManyToOne,
  JoinColumn,
  Unique,
  CreateDateColumn,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { User } from './users.entity';
import { Company } from './companies.entity';

@Entity('organizer_subscriptions')
@Unique(['companyId', 'userId'])
export class OrganizerSubscription {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'company_id' })
  companyId: string;

  @ManyToOne(() => Company, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'company_id' })
  company: Company;

  @Column({ name: 'user_id' })
  userId: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
