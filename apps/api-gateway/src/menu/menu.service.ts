import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like } from 'typeorm';
import { MenuItem } from './entities/menu-item.entity';
import { CreateMenuItemDto, UpdateMenuItemDto } from './dto/menu-item.dto';
import { fuzzySearch } from '@tillu/shared';

@Injectable()
export class MenuService {
  constructor(
    @InjectRepository(MenuItem)
    private menuItemRepository: Repository<MenuItem>,
  ) {}

  async create(createMenuItemDto: CreateMenuItemDto): Promise<MenuItem> {
    const menuItem = this.menuItemRepository.create(createMenuItemDto);
    return this.menuItemRepository.save(menuItem);
  }

  async findAll(category?: string, available?: boolean): Promise<MenuItem[]> {
    const where: any = {};
    
    if (category) {
      where.category = category;
    }
    
    if (available !== undefined) {
      where.isAvailable = available;
    }

    return this.menuItemRepository.find({ where });
  }

  async findOne(id: string): Promise<MenuItem> {
    const menuItem = await this.menuItemRepository.findOne({ where: { id } });
    if (!menuItem) {
      throw new NotFoundException(`Menu item with ID ${id} not found`);
    }
    return menuItem;
  }

  async update(id: string, updateMenuItemDto: UpdateMenuItemDto): Promise<MenuItem> {
    await this.menuItemRepository.update(id, updateMenuItemDto);
    return this.findOne(id);
  }

  async remove(id: string): Promise<void> {
    const result = await this.menuItemRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Menu item with ID ${id} not found`);
    }
  }

  async search(query: string): Promise<MenuItem[]> {
    const items = await this.findAll();
    return fuzzySearch(query, items, ['name', 'description', 'category']);
  }
}
