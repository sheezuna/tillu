import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Customer } from '../customers/entities/customer.entity';
import { Campaign } from '../campaigns/entities/campaign.entity';
import { SmsService } from './sms.service';
import { EmailService } from './email.service';
import { AiService } from '../ai/ai.service';

@Injectable()
export class MarketingService {
  constructor(
    @InjectRepository(Customer)
    private customerRepository: Repository<Customer>,
    @InjectRepository(Campaign)
    private campaignRepository: Repository<Campaign>,
    private smsService: SmsService,
    private emailService: EmailService,
    private aiService: AiService,
  ) {}

  async createAutomatedCampaign(branchId: string, type: 'loyalty' | 'winback' | 'welcome' | 'flash'): Promise<any> {
    const customers = await this.customerRepository.find();

    const segmentation = await this.aiService.segmentCustomers(customers);
    
    let targetSegment: any[] = [];
    let campaignContent: any = {};

    switch (type) {
      case 'loyalty':
        targetSegment = segmentation.segments.champions;
        campaignContent = {
          subject: 'Exclusive Reward for Our VIP Customer!',
          message: 'Hi {name}! As one of our most valued customers, enjoy 20% off your next order. Use code: VIP20',
          smsMessage: 'VIP OFFER: 20% off your next order! Use code VIP20. Valid for 48 hours.',
        };
        break;
      
      case 'winback':
        targetSegment = segmentation.segments.atRisk;
        campaignContent = {
          subject: 'We Miss You! Come Back with a Special Offer',
          message: 'Hi {name}! We noticed you haven\'t ordered in a while. Here\'s 25% off to welcome you back!',
          smsMessage: 'We miss you! 25% off your next order with code COMEBACK25. Order now!',
        };
        break;
      
      case 'welcome':
        targetSegment = segmentation.segments.newCustomers;
        campaignContent = {
          subject: 'Welcome to Tillu! Here\'s Your First Order Discount',
          message: 'Welcome {name}! Enjoy 15% off your first order with us. Use code: WELCOME15',
          smsMessage: 'Welcome to Tillu! 15% off your first order with code WELCOME15. Order now!',
        };
        break;
      
      case 'flash':
        targetSegment = customers.slice(0, 100);
        campaignContent = {
          subject: '🔥 Flash Sale - 30% Off for Next 2 Hours!',
          message: 'FLASH SALE: 30% off all orders for the next 2 hours only! Use code: FLASH30',
          smsMessage: '🔥 FLASH SALE: 30% off for 2 hours only! Code: FLASH30. Order now!',
        };
        break;
    }

    const campaign = this.campaignRepository.create({
      name: `${type.charAt(0).toUpperCase() + type.slice(1)} Campaign - ${new Date().toLocaleDateString()}`,
      type,
      branchId,
      targetSegment: type,
      content: campaignContent,
      status: 'active',
      createdAt: new Date(),
      scheduledAt: new Date(),
    });
    
    const savedCampaign = await this.campaignRepository.save(campaign);

    const results = await this.executeCampaign(savedCampaign, targetSegment);
    
    return {
      campaignId: savedCampaign.id,
      type,
      targetCount: targetSegment.length,
      results,
    };
  }

  async executeCampaign(campaign: any, customers: any[]): Promise<any> {
    const smsResults = await this.smsService.sendMarketingCampaign(campaign, customers);
    const emailResults = await this.emailService.sendMarketingCampaign(campaign, customers);

    await this.campaignRepository.update(campaign.id, {
      status: 'completed',
      completedAt: new Date(),
    });

    return {
      sms: smsResults,
      email: emailResults,
      totalSent: smsResults.totalSent + emailResults.totalSent,
      totalFailed: smsResults.totalFailed + emailResults.totalFailed,
    };
  }

  async scheduleAutomatedCampaigns(): Promise<any> {
    const branches = await this.getBranches();
    const results: any[] = [];

    for (const branch of branches) {
      const customers = await this.customerRepository.find();

      const segmentation = await this.aiService.segmentCustomers(customers);
      
      if (segmentation.segments.atRisk.length > 5) {
        const winbackCampaign = await this.createAutomatedCampaign(branch.id, 'winback');
        results.push(winbackCampaign);
      }
      
      if (segmentation.segments.newCustomers.length > 3) {
        const welcomeCampaign = await this.createAutomatedCampaign(branch.id, 'welcome');
        results.push(welcomeCampaign);
      }
      
      if (segmentation.segments.champions.length > 10) {
        const loyaltyCampaign = await this.createAutomatedCampaign(branch.id, 'loyalty');
        results.push(loyaltyCampaign);
      }
    }

    return {
      totalCampaigns: results.length,
      campaigns: results,
    };
  }

  async performABTest(campaignA: any, campaignB: any, customers: any[]): Promise<any> {
    const halfPoint = Math.floor(customers.length / 2);
    const groupA = customers.slice(0, halfPoint);
    const groupB = customers.slice(halfPoint);

    const resultsA = await this.executeCampaign(campaignA, groupA);
    const resultsB = await this.executeCampaign(campaignB, groupB);

    const conversionA = this.calculateConversionRate(resultsA, groupA.length);
    const conversionB = this.calculateConversionRate(resultsB, groupB.length);

    return {
      campaignA: {
        ...resultsA,
        conversionRate: conversionA,
        audience: groupA.length,
      },
      campaignB: {
        ...resultsB,
        conversionRate: conversionB,
        audience: groupB.length,
      },
      winner: conversionA > conversionB ? 'A' : 'B',
      improvement: Math.abs(conversionA - conversionB),
    };
  }

  async generatePersonalizedOffers(customerId: string): Promise<any> {
    const customer = await this.customerRepository.findOne({
      where: { id: customerId },
    });

    if (!customer) {
      return { error: 'Customer not found' };
    }

    const orderHistory = await this.getCustomerOrderHistory(customerId);
    const favoriteItems = this.extractFavoriteItems(orderHistory);
    const spendingPattern = this.analyzeSpendingPattern(orderHistory);

    const offers = [];

    if (customer.loyaltyPoints > 100) {
      offers.push({
        type: 'loyalty_discount',
        title: 'Loyalty Points Reward',
        description: `Use ${customer.loyaltyPoints} points for £${(customer.loyaltyPoints / 10).toFixed(2)} off`,
        discount: customer.loyaltyPoints / 10,
        validUntil: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      });
    }

    if (favoriteItems.length > 0) {
      offers.push({
        type: 'favorite_item_discount',
        title: 'Your Favorites on Sale',
        description: `20% off ${favoriteItems[0].name} - your most ordered item!`,
        discount: 20,
        applicableItems: [favoriteItems[0].id],
        validUntil: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
      });
    }

    if (spendingPattern.averageOrderValue > 25) {
      offers.push({
        type: 'premium_customer',
        title: 'Premium Customer Exclusive',
        description: 'Free delivery on orders over £20',
        freeDelivery: true,
        minimumOrder: 20,
        validUntil: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
      });
    }

    return {
      customerId,
      customerName: customer.name,
      offers,
      totalOffers: offers.length,
    };
  }

  private async getBranches(): Promise<any[]> {
    return [
      { id: 'branch-1', name: 'Main Branch' },
      { id: 'branch-2', name: 'City Center' },
    ];
  }

  private calculateConversionRate(results: any, audienceSize: number): number {
    const orders = results.totalSent * 0.15;
    return (orders / audienceSize) * 100;
  }

  private async getCustomerOrderHistory(customerId: string): Promise<any[]> {
    return [];
  }

  private extractFavoriteItems(orderHistory: any[]): any[] {
    return [
      { id: 'item-1', name: 'Chicken Tikka Masala', orderCount: 5 },
    ];
  }

  private analyzeSpendingPattern(orderHistory: any[]): any {
    return {
      averageOrderValue: 28.50,
      frequency: 'weekly',
      preferredTime: '18:00-20:00',
    };
  }
}
