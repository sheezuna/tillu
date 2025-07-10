import { Controller, Get, Post, Body, Param, Query } from '@nestjs/common';
import { AiService } from '../ai/ai.service';
import { ForecastingService } from '../services/forecasting.service';
import { MarketingService } from '../services/marketing.service';

@Controller('enhanced-ai')
export class EnhancedAiController {
  constructor(
    private readonly aiService: AiService,
    private readonly forecastingService: ForecastingService,
    private readonly marketingService: MarketingService,
  ) {}

  @Post('intelligent-routing')
  async intelligentRouting(@Body() routingData: any) {
    const routing = await this.aiService.routeOrder(routingData.customerLocation, routingData.orderItems);
    const forecast = await this.forecastingService.forecastDemand(routing.recommendedBranch, routingData.orderItems[0]?.menuItemId, 7);
    
    return {
      routing,
      demandForecast: forecast,
      confidence: routing.confidence * forecast.confidence,
      recommendations: [
        ...routing.recommendations,
        ...forecast.recommendations,
      ],
    };
  }

  @Get('predictive-insights/:branchId')
  async getPredictiveInsights(@Param('branchId') branchId: string) {
    const [revenue, staffing, anomalies] = await Promise.all([
      this.forecastingService.forecastRevenue(branchId, 14),
      this.forecastingService.forecastStaffing(branchId, 7),
      this.forecastingService.detectAnomalies(branchId),
    ]);

    return {
      revenue,
      staffing,
      anomalies,
      insights: this.generateActionableInsights(revenue, staffing, anomalies),
    };
  }

  @Post('automated-marketing/:branchId')
  async triggerAutomatedMarketing(@Param('branchId') branchId: string, @Body() triggerData: any) {
    const campaigns = await this.marketingService.scheduleAutomatedCampaigns();
    const personalizedOffers = await this.marketingService.generatePersonalizedOffers(triggerData.customerId);
    
    return {
      campaigns,
      personalizedOffers,
      executionPlan: this.createExecutionPlan(campaigns, personalizedOffers),
    };
  }

  @Get('real-time-optimization/:branchId')
  async getRealTimeOptimization(@Param('branchId') branchId: string) {
    const currentHour = new Date().getHours();
    const [demandForecast, staffingOptimization] = await Promise.all([
      this.forecastingService.forecastDemand(branchId, 'popular-items', 1),
      this.forecastingService.forecastStaffing(branchId, 1),
    ]);

    return {
      currentOptimizations: {
        menuPriority: this.optimizeMenuDisplay(demandForecast),
        staffAllocation: this.optimizeStaffAllocation(staffingOptimization, currentHour),
        inventoryAlerts: await this.generateInventoryAlerts(branchId),
        pricingAdjustments: this.suggestDynamicPricing(demandForecast),
      },
      nextHourPredictions: demandForecast.predictions,
    };
  }

  @Post('customer-behavior-analysis')
  async analyzeCustomerBehavior(@Body() customerData: any) {
    const segmentation = await this.aiService.segmentCustomers(customerData.customers);
    const churnPrediction = this.predictCustomerChurn(customerData.customers);
    const lifetimeValue = this.calculateCustomerLifetimeValue(customerData.customers);

    return {
      segmentation,
      churnPrediction,
      lifetimeValue,
      actionableInsights: this.generateCustomerInsights(segmentation, churnPrediction, lifetimeValue),
    };
  }

  private generateActionableInsights(revenue: any, staffing: any, anomalies: any) {
    const insights = [];
    
    if (revenue.trendAnalysis.direction === 'increasing') {
      insights.push({
        type: 'opportunity',
        title: 'Revenue Growth Opportunity',
        description: `Revenue trending up ${revenue.trendAnalysis.growthRate}%. Consider expanding capacity.`,
        priority: 'high',
        action: 'Increase inventory and staff for peak periods',
      });
    }

    if (anomalies.riskLevel === 'high') {
      insights.push({
        type: 'alert',
        title: 'Operational Anomaly Detected',
        description: 'Multiple metrics showing unusual patterns. Immediate attention required.',
        priority: 'critical',
        action: 'Review operations and investigate root causes',
      });
    }

    return insights;
  }

  private createExecutionPlan(campaigns: any, offers: any) {
    return {
      immediate: campaigns.campaigns.filter(c => c.type === 'flash'),
      scheduled: campaigns.campaigns.filter(c => c.type !== 'flash'),
      personalized: offers.offers,
      timeline: this.generateExecutionTimeline(campaigns, offers),
    };
  }

  private optimizeMenuDisplay(forecast: any) {
    return forecast.predictions.map(item => ({
      itemId: item.menuItemId,
      priority: item.predictedDemand > 20 ? 'high' : 'normal',
      suggestedPosition: item.predictedDemand > 20 ? 'featured' : 'standard',
      expectedDemand: item.predictedDemand,
    }));
  }

  private optimizeStaffAllocation(staffing: any, currentHour: number) {
    const currentShift = staffing.staffingForecast[0]?.hourlyStaffing.find(h => h.hour === currentHour);
    
    return {
      recommended: currentShift?.requiredStaff || 3,
      roles: currentShift?.roles || { kitchen: 2, cashier: 1, delivery: 1, manager: 1 },
      adjustments: this.calculateStaffAdjustments(currentShift),
    };
  }

  private async generateInventoryAlerts(branchId: string) {
    return [
      {
        item: 'Chicken Breast',
        currentStock: 15,
        minimumStock: 20,
        urgency: 'high',
        action: 'Reorder immediately',
      },
      {
        item: 'Basmati Rice',
        currentStock: 8,
        minimumStock: 15,
        urgency: 'medium',
        action: 'Reorder within 24 hours',
      },
    ];
  }

  private suggestDynamicPricing(forecast: any) {
    return forecast.predictions.map(item => ({
      itemId: item.menuItemId,
      currentPrice: item.basePrice || 12.99,
      suggestedPrice: item.predictedDemand > 25 ? (item.basePrice || 12.99) * 1.1 : (item.basePrice || 12.99),
      reason: item.predictedDemand > 25 ? 'High demand - premium pricing' : 'Standard pricing',
      confidence: item.confidence,
    }));
  }

  private predictCustomerChurn(customers: any[]) {
    return customers.map(customer => ({
      customerId: customer.id,
      churnProbability: this.calculateChurnProbability(customer),
      riskLevel: this.calculateChurnProbability(customer) > 0.7 ? 'high' : 
                 this.calculateChurnProbability(customer) > 0.4 ? 'medium' : 'low',
      retentionStrategy: this.suggestRetentionStrategy(customer),
    }));
  }

  private calculateCustomerLifetimeValue(customers: any[]) {
    return customers.map(customer => ({
      customerId: customer.id,
      currentValue: customer.totalSpent || 0,
      predictedLifetimeValue: (customer.totalSpent || 0) * 2.5,
      valueSegment: (customer.totalSpent || 0) > 500 ? 'high' : 
                   (customer.totalSpent || 0) > 200 ? 'medium' : 'low',
    }));
  }

  private generateCustomerInsights(segmentation: any, churn: any, ltv: any) {
    return {
      highValueAtRisk: churn.filter(c => c.riskLevel === 'high' && 
        ltv.find(l => l.customerId === c.customerId)?.valueSegment === 'high'),
      growthOpportunities: ltv.filter(l => l.valueSegment === 'medium'),
      retentionPriorities: churn.filter(c => c.riskLevel === 'high').slice(0, 10),
    };
  }

  private calculateChurnProbability(customer: any): number {
    const daysSinceLastOrder = customer.daysSinceLastOrder || 30;
    const orderFrequency = customer.orderFrequency || 0.1;
    
    return Math.min(0.95, daysSinceLastOrder * 0.02 + (1 - orderFrequency));
  }

  private suggestRetentionStrategy(customer: any): string {
    const churnProb = this.calculateChurnProbability(customer);
    
    if (churnProb > 0.7) return 'Immediate intervention - personal call + 30% discount';
    if (churnProb > 0.4) return 'Email campaign + loyalty bonus';
    return 'Standard retention program';
  }

  private calculateStaffAdjustments(currentShift: any) {
    if (!currentShift) return { message: 'No adjustments needed' };
    
    return {
      kitchen: currentShift.requiredStaff > 6 ? '+1 chef' : 'Current level adequate',
      cashier: currentShift.requiredStaff > 8 ? '+1 cashier' : 'Current level adequate',
      delivery: 'Monitor order volume for adjustments',
    };
  }

  private generateExecutionTimeline(campaigns: any, offers: any) {
    return [
      { time: 'Immediate', action: 'Deploy flash campaigns', count: campaigns.campaigns.filter(c => c.type === 'flash').length },
      { time: '1 hour', action: 'Send personalized offers', count: offers.totalOffers },
      { time: '4 hours', action: 'Execute scheduled campaigns', count: campaigns.campaigns.filter(c => c.type !== 'flash').length },
      { time: '24 hours', action: 'Analyze performance and optimize', count: 1 },
    ];
  }
}
