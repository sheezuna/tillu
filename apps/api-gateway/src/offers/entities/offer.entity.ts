import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('offers')
export class Offer {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column()
  description: string;

  @Column({
    type: 'enum',
    enum: ['percentage', 'fixed_amount', 'buy_x_get_y'],
  })
  type: 'percentage' | 'fixed_amount' | 'buy_x_get_y';

  @Column('decimal', { precision: 10, scale: 2 })
  value: number;

  @Column('decimal', { precision: 10, scale: 2, nullable: true })
  minimumOrderValue: number;

  @Column('text', { array: true, nullable: true })
  applicableItems: string[];

  @Column({ nullable: true })
  maxUses: number;

  @Column({ default: 0 })
  currentUses: number;

  @Column()
  validFrom: Date;

  @Column()
  validUntil: Date;

  @Column({ default: true })
  isActive: boolean;

  @Column('text', { array: true })
  branchIds: string[];

  @Column({ nullable: true })
  customerSegment: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
