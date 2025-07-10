import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Branch } from '../../branches/entities/branch.entity';
import { MenuItem } from '../../menu/entities/menu-item.entity';

@Entity('inventory_items')
export class InventoryItem {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  branchId: string;

  @ManyToOne(() => Branch)
  @JoinColumn({ name: 'branchId' })
  branch: Branch;

  @Column()
  menuItemId: string;

  @ManyToOne(() => MenuItem)
  @JoinColumn({ name: 'menuItemId' })
  menuItem: MenuItem;

  @Column()
  currentStock: number;

  @Column()
  minimumStock: number;

  @Column()
  maximumStock: number;

  @Column()
  unit: string;

  @Column('decimal', { precision: 10, scale: 2 })
  costPerUnit: number;

  @Column()
  lastRestocked: Date;

  @Column({ nullable: true })
  expiryDate: Date;

  @Column({ nullable: true })
  supplier: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
