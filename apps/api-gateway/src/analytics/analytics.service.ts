import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Order } from '../orders/entities/order.entity';
import { Customer } from '../customers/entities/customer.entity';
import { InventoryItem } from '../inventory/entities/inventory-item.entity';

@Injectable()
export class AnalyticsService {
  constructor(
    @InjectRepository(Order)
    private orderRepository: Repository<Order>,
    @InjectRepository(Customer)
    private customerRepository: Repository<Customer>,
    @InjectRepository(InventoryItem)
    private inventoryRepository: Repository<InventoryItem>,
  ) {}

  async getSalesAnalytics(branchId?: string, startDate?: string, endDate?: string): Promise<any> {
    const query = this.orderRepository.createQueryBuilder('order')
      .select([
        'COUNT(*) as totalOrders',
        'SUM(order.total) as totalRevenue',
        'AVG(order.total) as averageOrderValue',
        'DATE(order.createdAt) as date',
      ])
      .where('order.status != :status', { status: 'cancelled' })
      .groupBy('DATE(order.createdAt)')
      .orderBy('date', 'DESC');

    if (branchId) {
      query.andWhere('order.branchId = :branchId', { branchId });
    }

    if (startDate) {
      query.andWhere('order.createdAt >= :startDate', { startDate });
    }

    if (endDate) {
      query.andWhere('order.createdAt <= :endDate', { endDate });
    }

    const results = await query.getRawMany();

    const totalRevenue = results.reduce((sum, row) => sum + parseFloat(row.totalRevenue || 0), 0);
    const totalOrders = results.reduce((sum, row) => sum + parseInt(row.totalOrders || 0), 0);

    return {
      totalRevenue,
      totalOrders,
      averageOrderValue: totalOrders > 0 ? totalRevenue / totalOrders : 0,
      dailyData: results,
    };
  }

  async getCustomerAnalytics(branchId?: string): Promise<any> {
    const totalCustomers = await this.customerRepository.count();
    
    const loyaltyStats = await this.customerRepository
      .createQueryBuilder('customer')
      .select([
        'AVG(customer.loyaltyPoints) as avgLoyaltyPoints',
        'AVG(customer.totalSpent) as avgTotalSpent',
        'AVG(customer.totalOrders) as avgTotalOrders',
      ])
      .getRawOne();

    const topCustomers = await this.customerRepository
      .createQueryBuilder('customer')
      .orderBy('customer.totalSpent', 'DESC')
      .limit(10)
      .getMany();

    return {
      totalCustomers,
      averageLoyaltyPoints: loyaltyStats.avgLoyaltyPoints || 0,
      averageTotalSpent: loyaltyStats.avgTotalSpent || 0,
      averageTotalOrders: loyaltyStats.avgTotalOrders || 0,
      topCustomers,
    };
  }

  async getInventoryAnalytics(branchId?: string): Promise<any> {
    const query = this.inventoryRepository.createQueryBuilder('inventory')
      .leftJoinAndSelect('inventory.menuItem', 'menuItem');

    if (branchId) {
      query.where('inventory.branchId = :branchId', { branchId });
    }

    const items = await query.getMany();

    const lowStockItems = items.filter(item => item.currentStock <= item.minimumStock);
    const totalValue = items.reduce((sum, item) => sum + (item.currentStock * item.costPerUnit), 0);

    return {
      totalItems: items.length,
      lowStockItems: lowStockItems.length,
      totalInventoryValue: totalValue,
      lowStockDetails: lowStockItems,
    };
  }

  async getDashboard(branchId: string): Promise<any> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const todayOrders = await this.orderRepository.count({
      where: {
        branchId,
        createdAt: today,
        status: 'delivered',
      },
    });

    const todayRevenue = await this.orderRepository
      .createQueryBuilder('order')
      .select('SUM(order.total)', 'revenue')
      .where('order.branchId = :branchId', { branchId })
      .andWhere('order.createdAt >= :today', { today })
      .andWhere('order.status = :status', { status: 'delivered' })
      .getRawOne();

    const pendingOrders = await this.orderRepository.count({
      where: {
        branchId,
        status: 'pending',
      },
    });

    const preparingOrders = await this.orderRepository.count({
      where: {
        branchId,
        status: 'preparing',
      },
    });

    return {
      todayOrders,
      todayRevenue: todayRevenue?.revenue || 0,
      pendingOrders,
      preparingOrders,
      timestamp: new Date(),
    };
  }

  async getPopularItems(branchId?: string, limit = 10): Promise<any> {
    const query = this.orderRepository
      .createQueryBuilder('order')
      .leftJoin('order.items', 'item')
      .select([
        'item.menuItemId',
        'SUM(item.quantity) as totalQuantity',
        'COUNT(DISTINCT order.id) as orderCount',
      ])
      .where('order.status != :status', { status: 'cancelled' })
      .groupBy('item.menuItemId')
      .orderBy('totalQuantity', 'DESC')
      .limit(limit);

    if (branchId) {
      query.andWhere('order.branchId = :branchId', { branchId });
    }

    return query.getRawMany();
  }

  async getRevenueForecast(branchId: string, days = 30): Promise<any> {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const historicalData = await this.orderRepository
      .createQueryBuilder('order')
      .select([
        'DATE(order.createdAt) as date',
        'SUM(order.total) as revenue',
      ])
      .where('order.branchId = :branchId', { branchId })
      .andWhere('order.createdAt >= :startDate', { startDate })
      .andWhere('order.createdAt <= :endDate', { endDate })
      .andWhere('order.status != :status', { status: 'cancelled' })
      .groupBy('DATE(order.createdAt)')
      .orderBy('date', 'ASC')
      .getRawMany();

    const totalRevenue = historicalData.reduce((sum, day) => sum + parseFloat(day.revenue), 0);
    const averageDailyRevenue = totalRevenue / days;

    const forecast = [];
    for (let i = 1; i <= 7; i++) {
      const forecastDate = new Date();
      forecastDate.setDate(forecastDate.getDate() + i);
      forecast.push({
        date: forecastDate.toISOString().split('T')[0],
        predictedRevenue: averageDailyRevenue * (0.9 + Math.random() * 0.2),
      });
    }

    return {
      historicalData,
      forecast,
      averageDailyRevenue,
    };
  }
}
