import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class SmsService {
  private twilioClient: any;

  constructor(private configService: ConfigService) {
    const accountSid = this.configService.get('TWILIO_ACCOUNT_SID');
    const authToken = this.configService.get('TWILIO_AUTH_TOKEN');

    if (accountSid && authToken) {
      try {
        const twilio = require('twilio');
        this.twilioClient = twilio(accountSid, authToken);
      } catch (error) {
        console.warn('Twilio not available:', error.message);
      }
    }
  }

  async sendSms(to: string, message: string): Promise<any> {
    if (!this.twilioClient) {
      console.log('SMS Service: Would send SMS to', to, ':', message);
      return { success: false, error: 'Twilio not configured' };
    }

    try {
      const result = await this.twilioClient.messages.create({
        body: message,
        to: to,
        from: this.configService.get('TWILIO_PHONE_NUMBER'),
      });

      return { success: true, messageId: result.sid };
    } catch (error) {
      console.error('SMS sending failed:', error);
      return { success: false, error: error.message };
    }
  }

  async sendBulkSms(recipients: { phone: string; message: string }[]): Promise<any[]> {
    const results = [];
    
    for (const recipient of recipients) {
      const result = await this.sendSms(recipient.phone, recipient.message);
      results.push({
        phone: recipient.phone,
        ...result,
      });
      
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    return results;
  }

  async sendMarketingCampaign(campaign: any, customers: any[]): Promise<any> {
    const messages = customers.map(customer => ({
      phone: customer.phone,
      message: this.personalizeMessage(campaign.content.message, customer),
    }));

    const results = await this.sendBulkSms(messages);
    
    return {
      campaignId: campaign.id,
      totalSent: results.filter(r => r.success).length,
      totalFailed: results.filter(r => !r.success).length,
      results,
    };
  }

  async sendOrderNotification(order: any, type: 'confirmation' | 'ready' | 'delivered'): Promise<any> {
    const messages = {
      confirmation: `Order ${order.orderNumber} confirmed! Estimated ready time: ${order.estimatedReadyTime}. Total: £${order.total}`,
      ready: `Your order ${order.orderNumber} is ready for pickup! Please collect from ${order.branch?.name}.`,
      delivered: `Your order ${order.orderNumber} has been delivered. Thank you for choosing us!`,
    };

    if (order.customerInfo?.phone) {
      return await this.sendSms(order.customerInfo.phone, messages[type]);
    }

    return { success: false, error: 'No customer phone number' };
  }

  async sendInventoryAlert(branchId: string, item: any, managers: any[]): Promise<any> {
    const message = `STOCK ALERT: ${item.name} is running low at branch ${branchId}. Current stock: ${item.currentStock}, Minimum: ${item.minimumStock}. Please reorder.`;
    
    const results = [];
    for (const manager of managers) {
      if (manager.phone) {
        const result = await this.sendSms(manager.phone, message);
        results.push({ managerId: manager.id, ...result });
      }
    }

    return results;
  }

  async sendFlashOfferNotification(offer: any, customers: any[]): Promise<any> {
    const message = `🔥 FLASH OFFER: ${offer.discount}% off ${offer.itemName}! Valid until ${new Date(offer.validUntil).toLocaleTimeString()}. Order now!`;
    
    const messages = customers.map(customer => ({
      phone: customer.phone,
      message,
    }));

    return await this.sendBulkSms(messages);
  }

  private personalizeMessage(template: string, customer: any): string {
    return template
      .replace('{name}', customer.name || 'Valued Customer')
      .replace('{loyaltyPoints}', customer.loyaltyPoints?.toString() || '0')
      .replace('{totalSpent}', customer.totalSpent?.toFixed(2) || '0.00');
  }
}
