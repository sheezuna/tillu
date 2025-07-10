import { Controller, Get, Post, Body, Param, Sse } from '@nestjs/common';
import { Observable, interval, map } from 'rxjs';
import { WebsocketGateway } from '../websocket/websocket.gateway';
import { AnalyticsService } from '../analytics/analytics.service';

@Controller('real-time')
export class RealTimeController {
  constructor(
    private readonly websocketGateway: WebsocketGateway,
    private readonly analyticsService: AnalyticsService,
  ) {}

  @Sse('metrics/:branchId')
  streamMetrics(@Param('branchId') branchId: string): Observable<any> {
    return interval(5000).pipe(
      map(() => ({
        data: JSON.stringify({
          timestamp: new Date(),
          branchId,
          metrics: this.generateRealTimeMetrics(branchId),
          alerts: this.generateRealTimeAlerts(branchId),
          predictions: this.generateShortTermPredictions(branchId),
        }),
      })),
    );
  }

  @Sse('kitchen-updates/:branchId')
  streamKitchenUpdates(@Param('branchId') branchId: string): Observable<any> {
    return interval(2000).pipe(
      map(() => ({
        data: JSON.stringify({
          timestamp: new Date(),
          branchId,
          queue: this.generateKitchenQueue(branchId),
          chefStatus: this.generateChefStatus(branchId),
          orderFlow: this.generateOrderFlow(branchId),
        }),
      })),
    );
  }

  @Sse('customer-activity/:branchId')
  streamCustomerActivity(@Param('branchId') branchId: string): Observable<any> {
    return interval(10000).pipe(
      map(() => ({
        data: JSON.stringify({
          timestamp: new Date(),
          branchId,
          activeCustomers: this.generateActiveCustomers(branchId),
          orderTrends: this.generateOrderTrends(branchId),
          satisfaction: this.generateSatisfactionMetrics(branchId),
        }),
      })),
    );
  }

  @Post('trigger-alert')
  async triggerAlert(@Body() alertData: any) {
    const alert = {
      id: `alert-${Date.now()}`,
      type: alertData.type,
      severity: alertData.severity,
      message: alertData.message,
      branchId: alertData.branchId,
      timestamp: new Date(),
      actionRequired: this.determineRequiredAction(alertData),
    };

    this.websocketGateway.sendSystemAlert(alert);
    
    return { success: true, alertId: alert.id };
  }

  @Post('update-order-status')
  async updateOrderStatus(@Body() orderUpdate: any) {
    const update = {
      orderId: orderUpdate.orderId,
      status: orderUpdate.status,
      estimatedTime: orderUpdate.estimatedTime,
      actualTime: orderUpdate.actualTime,
      branchId: orderUpdate.branchId,
      timestamp: new Date(),
    };

    this.websocketGateway.broadcastOrderUpdate(update);
    
    return { success: true, update };
  }

  @Get('live-dashboard/:branchId')
  async getLiveDashboard(@Param('branchId') branchId: string) {
    return {
      branchId,
      timestamp: new Date(),
      overview: {
        ordersToday: await this.getOrdersToday(branchId),
        revenueToday: await this.getRevenueToday(branchId),
        activeOrders: await this.getActiveOrders(branchId),
        averageWaitTime: await this.getAverageWaitTime(branchId),
      },
      realTimeData: {
        currentOrders: this.generateCurrentOrders(branchId),
        kitchenLoad: this.generateKitchenLoad(branchId),
        staffStatus: this.generateStaffStatus(branchId),
        inventoryStatus: this.generateInventoryStatus(branchId),
      },
      predictions: {
        nextHourOrders: this.predictNextHourOrders(branchId),
        peakTimeAlert: this.generatePeakTimeAlert(branchId),
        staffingNeeds: this.predictStaffingNeeds(branchId),
      },
    };
  }

  private generateRealTimeMetrics(branchId: string) {
    return {
      ordersPerMinute: Math.floor(Math.random() * 5) + 1,
      averageOrderValue: 23.45 + (Math.random() - 0.5) * 10,
      kitchenEfficiency: 0.85 + Math.random() * 0.1,
      customerSatisfaction: 4.2 + Math.random() * 0.6,
      deliveryTime: 25 + Math.floor(Math.random() * 10),
    };
  }

  private generateRealTimeAlerts(branchId: string) {
    const alerts = [];
    
    if (Math.random() > 0.8) {
      alerts.push({
        type: 'inventory',
        severity: 'medium',
        message: 'Chicken stock running low',
        action: 'Reorder within 2 hours',
      });
    }
    
    if (Math.random() > 0.9) {
      alerts.push({
        type: 'kitchen',
        severity: 'high',
        message: 'Order queue backing up',
        action: 'Add kitchen staff',
      });
    }
    
    return alerts;
  }

  private generateShortTermPredictions(branchId: string) {
    return {
      next15Minutes: {
        expectedOrders: Math.floor(Math.random() * 8) + 2,
        confidence: 0.85,
      },
      nextHour: {
        expectedRevenue: 150 + Math.random() * 100,
        confidence: 0.78,
      },
    };
  }

  private generateKitchenQueue(branchId: string) {
    return Array.from({ length: Math.floor(Math.random() * 6) + 2 }, (_, i) => ({
      orderId: `ORD-${1000 + i}`,
      items: [`Item ${i + 1}`, `Item ${i + 2}`],
      priority: ['low', 'medium', 'high'][Math.floor(Math.random() * 3)],
      estimatedTime: 15 + Math.floor(Math.random() * 20),
      elapsedTime: Math.floor(Math.random() * 10),
    }));
  }

  private generateChefStatus(branchId: string) {
    return [
      { name: 'Chef Ahmed', status: 'busy', currentOrders: 3, efficiency: 0.92 },
      { name: 'Chef Sarah', status: 'available', currentOrders: 1, efficiency: 0.88 },
      { name: 'Chef Marcus', status: 'busy', currentOrders: 2, efficiency: 0.95 },
    ];
  }

  private generateOrderFlow(branchId: string) {
    return {
      incoming: Math.floor(Math.random() * 3),
      inProgress: Math.floor(Math.random() * 8) + 2,
      completed: Math.floor(Math.random() * 5),
      averageCompletionTime: 22 + Math.floor(Math.random() * 8),
    };
  }

  private generateActiveCustomers(branchId: string) {
    return {
      total: Math.floor(Math.random() * 50) + 20,
      new: Math.floor(Math.random() * 10) + 2,
      returning: Math.floor(Math.random() * 40) + 15,
      vip: Math.floor(Math.random() * 8) + 3,
    };
  }

  private generateOrderTrends(branchId: string) {
    return {
      hourlyTrend: 'increasing',
      popularItems: ['Chicken Tikka Masala', 'Fish & Chips', 'Vegetable Curry'],
      averageOrderSize: 2.3 + Math.random() * 0.5,
      peakHourPrediction: '19:00-20:00',
    };
  }

  private generateSatisfactionMetrics(branchId: string) {
    return {
      averageRating: 4.2 + Math.random() * 0.6,
      totalReviews: Math.floor(Math.random() * 20) + 10,
      positivePercentage: 85 + Math.floor(Math.random() * 10),
      commonComplaints: ['Wait time', 'Temperature'],
      commonPraise: ['Taste', 'Portion size', 'Service'],
    };
  }

  private determineRequiredAction(alertData: any): string {
    switch (alertData.type) {
      case 'inventory':
        return 'Contact supplier and place urgent order';
      case 'kitchen':
        return 'Call in additional kitchen staff';
      case 'delivery':
        return 'Optimize delivery routes and add drivers';
      default:
        return 'Review and take appropriate action';
    }
  }

  private async getOrdersToday(branchId: string): Promise<number> {
    return Math.floor(Math.random() * 100) + 50;
  }

  private async getRevenueToday(branchId: string): Promise<number> {
    return Math.floor(Math.random() * 2000) + 1000;
  }

  private async getActiveOrders(branchId: string): Promise<number> {
    return Math.floor(Math.random() * 15) + 5;
  }

  private async getAverageWaitTime(branchId: string): Promise<number> {
    return Math.floor(Math.random() * 10) + 20;
  }

  private generateCurrentOrders(branchId: string) {
    return Array.from({ length: Math.floor(Math.random() * 8) + 3 }, (_, i) => ({
      id: `order-${i + 1}`,
      customerName: `Customer ${i + 1}`,
      items: Math.floor(Math.random() * 4) + 1,
      status: ['preparing', 'ready', 'delivered'][Math.floor(Math.random() * 3)],
      orderTime: new Date(Date.now() - Math.random() * 3600000),
    }));
  }

  private generateKitchenLoad(branchId: string) {
    return {
      currentLoad: Math.floor(Math.random() * 80) + 20,
      capacity: 100,
      efficiency: 0.85 + Math.random() * 0.1,
      bottlenecks: Math.random() > 0.7 ? ['Grill station'] : [],
    };
  }

  private generateStaffStatus(branchId: string) {
    return {
      total: 8,
      active: 6 + Math.floor(Math.random() * 2),
      onBreak: Math.floor(Math.random() * 2),
      efficiency: 0.88 + Math.random() * 0.1,
    };
  }

  private generateInventoryStatus(branchId: string) {
    return {
      lowStockItems: Math.floor(Math.random() * 5),
      criticalItems: Math.floor(Math.random() * 2),
      overStockItems: Math.floor(Math.random() * 3),
      totalItems: 150,
    };
  }

  private predictNextHourOrders(branchId: string) {
    return {
      predicted: Math.floor(Math.random() * 20) + 15,
      confidence: 0.82,
      factors: ['Historical data', 'Weather', 'Day of week'],
    };
  }

  private generatePeakTimeAlert(branchId: string) {
    const currentHour = new Date().getHours();
    const isPeakTime = currentHour >= 12 && currentHour <= 14 || currentHour >= 18 && currentHour <= 20;
    
    return {
      isPeakTime,
      nextPeakTime: isPeakTime ? null : currentHour < 12 ? '12:00' : '18:00',
      preparationTime: isPeakTime ? 0 : (currentHour < 12 ? 12 - currentHour : 18 - currentHour) * 60,
    };
  }

  private predictStaffingNeeds(branchId: string) {
    return {
      nextHour: {
        kitchen: 4,
        cashier: 2,
        delivery: 3,
        manager: 1,
      },
      confidence: 0.79,
      adjustments: ['Add 1 kitchen staff during peak', 'Consider extra delivery driver'],
    };
  }
}
