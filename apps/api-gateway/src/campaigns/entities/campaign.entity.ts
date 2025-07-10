import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('campaigns')
export class Campaign {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({
    type: 'enum',
    enum: ['sms', 'email', 'push'],
  })
  type: 'sms' | 'email' | 'push';

  @Column({
    type: 'enum',
    enum: ['draft', 'scheduled', 'active', 'completed', 'cancelled'],
    default: 'draft',
  })
  status: 'draft' | 'scheduled' | 'active' | 'completed' | 'cancelled';

  @Column()
  targetSegment: string;

  @Column('jsonb')
  content: {
    subject?: string;
    message: string;
    imageUrl?: string;
  };

  @Column({ nullable: true })
  scheduledAt: Date;

  @Column({ nullable: true })
  sentAt: Date;

  @Column('jsonb', { default: { sent: 0, delivered: 0, opened: 0, clicked: 0, converted: 0 } })
  metrics: {
    sent: number;
    delivered: number;
    opened: number;
    clicked: number;
    converted: number;
  };

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
