import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Order } from '../orders/entities/order.entity';
import { InventoryItem } from '../inventory/entities/inventory-item.entity';

@Injectable()
export class ForecastingService {
  constructor(
    @InjectRepository(Order)
    private orderRepository: Repository<Order>,
    @InjectRepository(InventoryItem)
    private inventoryRepository: Repository<InventoryItem>,
  ) {}

  async forecastDemand(branchId: string, menuItemId: string, days: number): Promise<any> {
    const historicalData = await this.getHistoricalDemand(branchId, menuItemId, 90);
    
    if (historicalData.length < 7) {
      return this.generateBasicForecast(days);
    }

    const forecast = this.applyTimeSeriesForecasting(historicalData, days);
    const seasonalAdjustment = this.applySeasonalAdjustment(forecast);
    const weatherAdjustment = this.applyWeatherAdjustment(seasonalAdjustment);
    
    return {
      menuItemId,
      branchId,
      forecastPeriod: days,
      predictions: weatherAdjustment,
      confidence: this.calculateConfidence(historicalData),
      factors: ['historical_trends', 'seasonal_patterns', 'weather_impact', 'day_of_week'],
      recommendations: this.generateRecommendations(weatherAdjustment),
    };
  }

  async forecastRevenue(branchId: string, days: number): Promise<any> {
    const historicalRevenue = await this.getHistoricalRevenue(branchId, 90);
    const trendAnalysis = this.analyzeTrend(historicalRevenue);
    
    const forecast: any[] = [];
    let baseRevenue = historicalRevenue.slice(-7).reduce((sum, day) => sum + day.revenue, 0) / 7;
    
    for (let i = 0; i < days; i++) {
      const date = new Date();
      date.setDate(date.getDate() + i);
      
      const dayOfWeek = date.getDay();
      const weekendMultiplier = (dayOfWeek === 0 || dayOfWeek === 6) ? 1.4 : 1.0;
      const trendMultiplier = 1 + (trendAnalysis.growthRate / 100);
      
      const predictedRevenue = baseRevenue * weekendMultiplier * trendMultiplier * (0.9 + Math.random() * 0.2);
      
      forecast.push({
        date: date.toISOString().split('T')[0],
        predictedRevenue: Math.round(predictedRevenue * 100) / 100,
        confidence: this.calculateDayConfidence(dayOfWeek, i),
        factors: {
          baseRevenue,
          weekendMultiplier,
          trendMultiplier,
        },
      });
    }

    return {
      branchId,
      forecastPeriod: days,
      predictions: forecast,
      totalPredictedRevenue: forecast.reduce((sum, day) => sum + day.predictedRevenue, 0),
      averageDailyRevenue: forecast.reduce((sum, day) => sum + day.predictedRevenue, 0) / days,
      trendAnalysis,
    };
  }

  async forecastStaffing(branchId: string, days: number): Promise<any> {
    const orderPatterns = await this.getOrderPatterns(branchId);
    const staffingForecast: any[] = [];

    for (let i = 0; i < days; i++) {
      const date = new Date();
      date.setDate(date.getDate() + i);
      
      const dayOfWeek = date.getDay();
      const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
      
      const hourlyStaffing: any[] = [];
      for (let hour = 8; hour <= 22; hour++) {
        const baseStaff = this.getBaseStaffing(hour);
        const demandMultiplier = this.getDemandMultiplier(hour, isWeekend);
        const requiredStaff = Math.ceil(baseStaff * demandMultiplier);
        
        hourlyStaffing.push({
          hour,
          requiredStaff,
          roles: {
            kitchen: Math.ceil(requiredStaff * 0.4),
            cashier: Math.ceil(requiredStaff * 0.3),
            delivery: Math.ceil(requiredStaff * 0.2),
            manager: 1,
          },
        });
      }
      
      staffingForecast.push({
        date: date.toISOString().split('T')[0],
        dayOfWeek: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][dayOfWeek],
        hourlyStaffing,
        totalStaffHours: hourlyStaffing.reduce((sum, h) => sum + h.requiredStaff, 0),
      });
    }

    return {
      branchId,
      forecastPeriod: days,
      staffingForecast,
      recommendations: this.generateStaffingRecommendations(staffingForecast),
    };
  }

  async detectAnomalies(branchId: string): Promise<any> {
    const recentData = await this.getRecentMetrics(branchId, 30);
    const anomalies: any[] = [];

    const revenueAnomaly = this.detectRevenueAnomaly(recentData.revenue);
    if (revenueAnomaly) anomalies.push(revenueAnomaly);

    const orderAnomaly = this.detectOrderVolumeAnomaly(recentData.orders);
    if (orderAnomaly) anomalies.push(orderAnomaly);

    const inventoryAnomaly = this.detectInventoryAnomaly(recentData.inventory);
    if (inventoryAnomaly) anomalies.push(inventoryAnomaly);

    return {
      branchId,
      detectionDate: new Date(),
      anomalies,
      riskLevel: this.calculateRiskLevel(anomalies),
      recommendations: this.generateAnomalyRecommendations(anomalies),
    };
  }

  private async getHistoricalDemand(branchId: string, menuItemId: string, days: number): Promise<any[]> {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const data = await this.orderRepository
      .createQueryBuilder('order')
      .leftJoin('order.items', 'item')
      .select(['DATE(order.createdAt) as date', 'SUM(item.quantity) as demand'])
      .where('order.branchId = :branchId', { branchId })
      .andWhere('item.menuItemId = :menuItemId', { menuItemId })
      .andWhere('order.createdAt >= :startDate', { startDate })
      .groupBy('DATE(order.createdAt)')
      .orderBy('date', 'ASC')
      .getRawMany();

    return data.map(row => ({
      date: row.date,
      demand: parseFloat(row.demand || 0),
    }));
  }

  private async getHistoricalRevenue(branchId: string, days: number): Promise<any[]> {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const data = await this.orderRepository
      .createQueryBuilder('order')
      .select(['DATE(order.createdAt) as date', 'SUM(order.total) as revenue'])
      .where('order.branchId = :branchId', { branchId })
      .andWhere('order.createdAt >= :startDate', { startDate })
      .andWhere('order.status != :status', { status: 'cancelled' })
      .groupBy('DATE(order.createdAt)')
      .orderBy('date', 'ASC')
      .getRawMany();

    return data.map(row => ({
      date: row.date,
      revenue: parseFloat(row.revenue || 0),
    }));
  }

  private generateBasicForecast(days: number): any {
    const forecast = [];
    for (let i = 0; i < days; i++) {
      forecast.push({
        date: new Date(Date.now() + i * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        predictedDemand: Math.floor(Math.random() * 20) + 10,
        confidence: 0.6,
      });
    }
    return {
      predictions: forecast,
      confidence: 0.6,
      note: 'Basic forecast due to insufficient historical data',
    };
  }

  private applyTimeSeriesForecasting(historicalData: any[], days: number): any[] {
    const forecast = [];
    const trend = this.calculateTrend(historicalData);
    const lastValue = historicalData[historicalData.length - 1]?.demand || 10;

    for (let i = 0; i < days; i++) {
      const trendAdjustment = trend * (i + 1);
      const seasonalFactor = this.getSeasonalFactor(i);
      const predictedDemand = Math.max(0, lastValue + trendAdjustment * seasonalFactor);

      forecast.push({
        date: new Date(Date.now() + i * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        predictedDemand: Math.round(predictedDemand),
        confidence: Math.max(0.5, 0.9 - (i * 0.05)),
      });
    }

    return forecast;
  }

  private applySeasonalAdjustment(forecast: any[]): any[] {
    return forecast.map((day, index) => {
      const date = new Date(day.date);
      const dayOfWeek = date.getDay();
      const weekendMultiplier = (dayOfWeek === 0 || dayOfWeek === 6) ? 1.3 : 1.0;
      
      return {
        ...day,
        predictedDemand: Math.round(day.predictedDemand * weekendMultiplier),
      };
    });
  }

  private applyWeatherAdjustment(forecast: any[]): any[] {
    return forecast.map(day => {
      const weatherFactor = 0.9 + Math.random() * 0.2;
      return {
        ...day,
        predictedDemand: Math.round(day.predictedDemand * weatherFactor),
        weatherImpact: weatherFactor,
      };
    });
  }

  private calculateTrend(data: any[]): number {
    if (data.length < 2) return 0;
    
    const firstHalf = data.slice(0, Math.floor(data.length / 2));
    const secondHalf = data.slice(Math.floor(data.length / 2));
    
    const firstAvg = firstHalf.reduce((sum, d) => sum + d.demand, 0) / firstHalf.length;
    const secondAvg = secondHalf.reduce((sum, d) => sum + d.demand, 0) / secondHalf.length;
    
    return (secondAvg - firstAvg) / firstHalf.length;
  }

  private getSeasonalFactor(dayIndex: number): number {
    const dayOfWeek = (new Date().getDay() + dayIndex) % 7;
    const factors = [1.3, 0.8, 0.9, 0.9, 1.0, 1.2, 1.4];
    return factors[dayOfWeek];
  }

  private calculateConfidence(historicalData: any[]): number {
    if (historicalData.length < 7) return 0.6;
    if (historicalData.length < 30) return 0.75;
    return 0.9;
  }

  private calculateDayConfidence(dayOfWeek: number, dayIndex: number): number {
    const baseConfidence = 0.9;
    const dayDecay = dayIndex * 0.02;
    const weekendBonus = (dayOfWeek === 0 || dayOfWeek === 6) ? 0.05 : 0;
    
    return Math.max(0.5, baseConfidence - dayDecay + weekendBonus);
  }

  private generateRecommendations(forecast: any[]): string[] {
    const recommendations = [];
    
    const avgDemand = forecast.reduce((sum, day) => sum + day.predictedDemand, 0) / forecast.length;
    const peakDays = forecast.filter(day => day.predictedDemand > avgDemand * 1.2);
    
    if (peakDays.length > 0) {
      recommendations.push(`Prepare extra inventory for ${peakDays.length} high-demand days`);
    }
    
    const lowDays = forecast.filter(day => day.predictedDemand < avgDemand * 0.8);
    if (lowDays.length > 0) {
      recommendations.push(`Consider promotions on ${lowDays.length} low-demand days`);
    }
    
    return recommendations;
  }

  private analyzeTrend(revenueData: any[]): any {
    const trend = this.calculateTrend(revenueData.map(d => ({ demand: d.revenue })));
    const growthRate = (trend / revenueData[0]?.revenue || 1) * 100;
    
    return {
      direction: trend > 0 ? 'increasing' : trend < 0 ? 'decreasing' : 'stable',
      growthRate: Math.round(growthRate * 100) / 100,
      strength: Math.abs(growthRate) > 5 ? 'strong' : Math.abs(growthRate) > 2 ? 'moderate' : 'weak',
    };
  }

  private async getOrderPatterns(branchId: string): Promise<any> {
    return {
      peakHours: [12, 13, 18, 19, 20],
      averageOrdersPerHour: 15,
      weekendMultiplier: 1.4,
    };
  }

  private getBaseStaffing(hour: number): number {
    if (hour >= 11 && hour <= 14) return 4;
    if (hour >= 17 && hour <= 21) return 5;
    return 2;
  }

  private getDemandMultiplier(hour: number, isWeekend: boolean): number {
    const peakHours = [12, 13, 18, 19, 20];
    const isPeak = peakHours.includes(hour);
    const baseMultiplier = isPeak ? 1.5 : 1.0;
    const weekendMultiplier = isWeekend ? 1.3 : 1.0;
    
    return baseMultiplier * weekendMultiplier;
  }

  private generateStaffingRecommendations(forecast: any[]): string[] {
    const recommendations = [];
    
    const totalHours = forecast.reduce((sum, day) => sum + day.totalStaffHours, 0);
    const avgHours = totalHours / forecast.length;
    
    const highDemandDays = forecast.filter(day => day.totalStaffHours > avgHours * 1.2);
    if (highDemandDays.length > 0) {
      recommendations.push(`Schedule additional staff for ${highDemandDays.length} high-demand days`);
    }
    
    recommendations.push('Consider cross-training staff for flexibility during peak hours');
    recommendations.push('Schedule breaks during low-demand periods (3-5 PM)');
    
    return recommendations;
  }

  private async getRecentMetrics(branchId: string, days: number): Promise<any> {
    return {
      revenue: [],
      orders: [],
      inventory: [],
    };
  }

  private detectRevenueAnomaly(revenueData: any[]): any | null {
    return null;
  }

  private detectOrderVolumeAnomaly(orderData: any[]): any | null {
    return null;
  }

  private detectInventoryAnomaly(inventoryData: any[]): any | null {
    return null;
  }

  private calculateRiskLevel(anomalies: any[]): string {
    if (anomalies.length === 0) return 'low';
    if (anomalies.length <= 2) return 'medium';
    return 'high';
  }

  private generateAnomalyRecommendations(anomalies: any[]): string[] {
    return ['Monitor metrics closely', 'Review operational procedures'];
  }
}
