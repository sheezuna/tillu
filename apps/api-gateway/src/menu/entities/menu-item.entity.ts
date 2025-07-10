import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('menu_items')
export class MenuItem {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column()
  description: string;

  @Column('decimal', { precision: 10, scale: 2 })
  price: number;

  @Column()
  category: string;

  @Column({ default: true })
  isAvailable: boolean;

  @Column({ default: 15 })
  preparationTime: number;

  @Column({ default: 1 })
  complexity: number;

  @Column('text', { array: true, default: [] })
  allergens: string[];

  @Column('jsonb', { nullable: true })
  nutritionalInfo: Record<string, any>;

  @Column({ nullable: true })
  imageUrl: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
