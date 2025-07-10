import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { InventoryItem } from './entities/inventory-item.entity';
import { CreateInventoryItemDto, UpdateInventoryItemDto } from './dto/inventory-item.dto';

@Injectable()
export class InventoryService {
  constructor(
    @InjectRepository(InventoryItem)
    private inventoryRepository: Repository<InventoryItem>,
  ) {}

  async create(createInventoryItemDto: CreateInventoryItemDto): Promise<InventoryItem> {
    const inventoryItem = this.inventoryRepository.create({
      ...createInventoryItemDto,
      lastRestocked: new Date(),
    });
    return this.inventoryRepository.save(inventoryItem);
  }

  async findAll(branchId?: string): Promise<InventoryItem[]> {
    const where = branchId ? { branchId } : {};
    return this.inventoryRepository.find({
      where,
      relations: ['branch', 'menuItem'],
    });
  }

  async findOne(id: string): Promise<InventoryItem> {
    const inventoryItem = await this.inventoryRepository.findOne({
      where: { id },
      relations: ['branch', 'menuItem'],
    });

    if (!inventoryItem) {
      throw new NotFoundException(`Inventory item with ID ${id} not found`);
    }

    return inventoryItem;
  }

  async update(id: string, updateInventoryItemDto: UpdateInventoryItemDto): Promise<InventoryItem> {
    await this.inventoryRepository.update(id, updateInventoryItemDto);
    return this.findOne(id);
  }

  async remove(id: string): Promise<void> {
    const result = await this.inventoryRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Inventory item with ID ${id} not found`);
    }
  }

  async getLowStock(branchId: string): Promise<InventoryItem[]> {
    return this.inventoryRepository
      .createQueryBuilder('inventory')
      .leftJoinAndSelect('inventory.menuItem', 'menuItem')
      .leftJoinAndSelect('inventory.branch', 'branch')
      .where('inventory.branchId = :branchId', { branchId })
      .andWhere('inventory.currentStock <= inventory.minimumStock')
      .getMany();
  }

  async updateStock(id: string, quantity: number, operation: 'add' | 'subtract' | 'set'): Promise<InventoryItem> {
    const item = await this.findOne(id);
    
    let newStock: number;
    switch (operation) {
      case 'add':
        newStock = item.currentStock + quantity;
        break;
      case 'subtract':
        newStock = Math.max(0, item.currentStock - quantity);
        break;
      case 'set':
        newStock = quantity;
        break;
    }

    await this.inventoryRepository.update(id, { 
      currentStock: newStock,
      lastRestocked: operation === 'add' ? new Date() : item.lastRestocked,
    });

    return this.findOne(id);
  }
}
