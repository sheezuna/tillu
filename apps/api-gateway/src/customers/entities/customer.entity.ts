import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('customers')
export class Customer {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ unique: true })
  phone: string;

  @Column({ nullable: true })
  email: string;

  @Column({ nullable: true })
  address: string;

  @Column({ nullable: true })
  postcode: string;

  @Column({ default: 0 })
  loyaltyPoints: number;

  @Column({ default: 0 })
  totalOrders: number;

  @Column('decimal', { precision: 10, scale: 2, default: 0 })
  totalSpent: number;

  @Column({ nullable: true })
  lastOrderDate: Date;

  @Column('jsonb', { default: {} })
  preferences: Record<string, any>;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
