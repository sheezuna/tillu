import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { KitchenQueue } from './entities/kitchen-queue.entity';
import { CreateKitchenQueueDto, UpdateKitchenQueueDto } from './dto/kitchen-queue.dto';
import { calculateOrderPriority } from '@tillu/shared';

@Injectable()
export class KitchenService {
  constructor(
    @InjectRepository(KitchenQueue)
    private kitchenQueueRepository: Repository<KitchenQueue>,
  ) {}

  async addToQueue(createKitchenQueueDto: CreateKitchenQueueDto): Promise<KitchenQueue> {
    const priority = calculateOrderPriority(createKitchenQueueDto);
    
    const queueItem = this.kitchenQueueRepository.create({
      ...createKitchenQueueDto,
      priority,
    });

    return this.kitchenQueueRepository.save(queueItem);
  }

  async getQueue(branchId?: string, status?: string): Promise<KitchenQueue[]> {
    const query = this.kitchenQueueRepository.createQueryBuilder('queue')
      .leftJoinAndSelect('queue.branch', 'branch')
      .orderBy('queue.priority', 'DESC')
      .addOrderBy('queue.createdAt', 'ASC');

    if (branchId) {
      query.andWhere('queue.branchId = :branchId', { branchId });
    }

    if (status) {
      query.andWhere('queue.status = :status', { status });
    }

    return query.getMany();
  }

  async updateQueueItem(id: string, updateKitchenQueueDto: UpdateKitchenQueueDto): Promise<KitchenQueue> {
    await this.kitchenQueueRepository.update(id, updateKitchenQueueDto);
    return this.findOne(id);
  }

  async startPreparation(id: string, chefId: string): Promise<KitchenQueue> {
    await this.kitchenQueueRepository.update(id, {
      status: 'in_progress',
      assignedChef: chefId,
      startedAt: new Date(),
    });

    return this.findOne(id);
  }

  async completePreparation(id: string): Promise<KitchenQueue> {
    await this.kitchenQueueRepository.update(id, {
      status: 'completed',
      completedAt: new Date(),
    });

    return this.findOne(id);
  }

  async getAnalytics(branchId: string): Promise<any> {
    const totalOrders = await this.kitchenQueueRepository.count({
      where: { branchId },
    });

    const completedOrders = await this.kitchenQueueRepository.count({
      where: { branchId, status: 'completed' },
    });

    const averageTime = await this.kitchenQueueRepository
      .createQueryBuilder('queue')
      .select('AVG(EXTRACT(EPOCH FROM (queue.completedAt - queue.startedAt)))', 'avgTime')
      .where('queue.branchId = :branchId', { branchId })
      .andWhere('queue.status = :status', { status: 'completed' })
      .getRawOne();

    return {
      totalOrders,
      completedOrders,
      averagePreparationTime: averageTime?.avgTime || 0,
      completionRate: totalOrders > 0 ? (completedOrders / totalOrders) * 100 : 0,
    };
  }

  private async findOne(id: string): Promise<KitchenQueue> {
    const queueItem = await this.kitchenQueueRepository.findOne({
      where: { id },
      relations: ['branch'],
    });

    if (!queueItem) {
      throw new NotFoundException(`Kitchen queue item with ID ${id} not found`);
    }

    return queueItem;
  }
}
