import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class EmailService {
  private sendGridClient: any;

  constructor(private configService: ConfigService) {
    const apiKey = this.configService.get('SENDGRID_API_KEY');

    if (apiKey) {
      try {
        const sgMail = require('@sendgrid/mail');
        sgMail.setApiKey(apiKey);
        this.sendGridClient = sgMail;
      } catch (error) {
        console.warn('SendGrid not available:', error.message);
      }
    }
  }

  async sendEmail(to: string, subject: string, content: string, isHtml = false): Promise<any> {
    if (!this.sendGridClient) {
      console.log('Email Service: Would send email to', to, 'Subject:', subject);
      return { success: false, error: 'SendGrid not configured' };
    }

    const msg = {
      to,
      from: this.configService.get('FROM_EMAIL') || 'noreply@tillu.com',
      subject,
      [isHtml ? 'html' : 'text']: content,
    };

    try {
      await this.sendGridClient.send(msg);
      return { success: true };
    } catch (error) {
      console.error('Email sending failed:', error);
      return { success: false, error: error.message };
    }
  }

  async sendBulkEmail(emails: { to: string; subject: string; content: string; isHtml?: boolean }[]): Promise<any[]> {
    const results: any[] = [];
    
    for (const email of emails) {
      const result = await this.sendEmail(email.to, email.subject, email.content, email.isHtml);
      results.push({
        to: email.to,
        ...result,
      });
      
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    return results;
  }

  async sendMarketingCampaign(campaign: any, customers: any[]): Promise<any> {
    const emails = customers.map(customer => ({
      to: customer.email,
      subject: this.personalizeSubject(campaign.content.subject, customer),
      content: this.personalizeContent(campaign.content.body, customer),
      isHtml: campaign.content.isHtml || false,
    })).filter(email => email.to);

    const results = await this.sendBulkEmail(emails);
    
    return {
      campaignId: campaign.id,
      totalSent: results.filter(r => r.success).length,
      totalFailed: results.filter(r => !r.success).length,
      results,
    };
  }

  async sendOrderConfirmation(order: any): Promise<any> {
    if (!order.customerInfo?.email) {
      return { success: false, error: 'No customer email' };
    }

    const subject = `Order Confirmation - ${order.orderNumber}`;
    const content = this.generateOrderConfirmationEmail(order);

    return await this.sendEmail(order.customerInfo.email, subject, content, true);
  }

  async sendDailySummary(branchId: string, summary: any, managers: any[]): Promise<any> {
    const subject = `Daily Summary - Branch ${branchId} - ${new Date().toLocaleDateString()}`;
    const content = this.generateDailySummaryEmail(summary);

    const results: any[] = [];
    for (const manager of managers) {
      if (manager.email) {
        const result = await this.sendEmail(manager.email, subject, content, true);
        results.push({ managerId: manager.id, ...result });
      }
    }

    return results;
  }

  async sendLoyaltyReward(customer: any, reward: any): Promise<any> {
    if (!customer.email) {
      return { success: false, error: 'No customer email' };
    }

    const subject = `🎉 You've earned a reward!`;
    const content = `
      <h2>Congratulations ${customer.name}!</h2>
      <p>You've earned a new loyalty reward: <strong>${reward.title}</strong></p>
      <p>${reward.description}</p>
      <p>Your current loyalty points: <strong>${customer.loyaltyPoints}</strong></p>
      <p>Use code: <strong>${reward.code}</strong></p>
      <p>Valid until: ${new Date(reward.validUntil).toLocaleDateString()}</p>
    `;

    return await this.sendEmail(customer.email, subject, content, true);
  }

  async sendWelcomeEmail(customer: any): Promise<any> {
    if (!customer.email) {
      return { success: false, error: 'No customer email' };
    }

    const subject = `Welcome to Tillu! 🍽️`;
    const content = `
      <h2>Welcome ${customer.name}!</h2>
      <p>Thank you for joining Tillu. We're excited to serve you delicious food!</p>
      <p>As a welcome gift, enjoy <strong>20% off</strong> your next order with code: <strong>WELCOME20</strong></p>
      <p>Explore our menu and place your first order today!</p>
      <p>Best regards,<br>The Tillu Team</p>
    `;

    return await this.sendEmail(customer.email, subject, content, true);
  }

  private personalizeSubject(template: string, customer: any): string {
    return template
      .replace('{name}', customer.name || 'Valued Customer')
      .replace('{loyaltyPoints}', customer.loyaltyPoints?.toString() || '0');
  }

  private personalizeContent(template: string, customer: any): string {
    return template
      .replace('{name}', customer.name || 'Valued Customer')
      .replace('{loyaltyPoints}', customer.loyaltyPoints?.toString() || '0')
      .replace('{totalSpent}', customer.totalSpent?.toFixed(2) || '0.00')
      .replace('{totalOrders}', customer.totalOrders?.toString() || '0');
  }

  private generateOrderConfirmationEmail(order: any): string {
    const itemsList = order.items?.map(item => 
      `<li>${item.quantity}x ${item.menuItem?.name || 'Item'} - £${(item.price * item.quantity).toFixed(2)}</li>`
    ).join('') || '';

    return `
      <h2>Order Confirmation</h2>
      <p>Thank you for your order!</p>
      <p><strong>Order Number:</strong> ${order.orderNumber}</p>
      <p><strong>Estimated Ready Time:</strong> ${order.estimatedReadyTime ? new Date(order.estimatedReadyTime).toLocaleTimeString() : 'TBD'}</p>
      
      <h3>Order Details:</h3>
      <ul>${itemsList}</ul>
      
      <p><strong>Subtotal:</strong> £${order.subtotal}</p>
      <p><strong>Tax:</strong> £${order.tax}</p>
      <p><strong>Total:</strong> £${order.total}</p>
      
      <p>We'll notify you when your order is ready!</p>
    `;
  }

  private generateDailySummaryEmail(summary: any): string {
    return `
      <h2>Daily Summary Report</h2>
      <p><strong>Date:</strong> ${new Date().toLocaleDateString()}</p>
      
      <h3>Sales Overview</h3>
      <ul>
        <li>Total Orders: ${summary.totalOrders || 0}</li>
        <li>Total Revenue: £${summary.totalRevenue || 0}</li>
        <li>Average Order Value: £${summary.averageOrderValue || 0}</li>
      </ul>
      
      <h3>Top Performing Items</h3>
      <ul>
        ${summary.topItems?.map(item => `<li>${item.name}: ${item.quantity} sold</li>`).join('') || '<li>No data available</li>'}
      </ul>
      
      <h3>Inventory Alerts</h3>
      <ul>
        ${summary.lowStockItems?.map(item => `<li>${item.name}: ${item.currentStock} remaining</li>`).join('') || '<li>No low stock items</li>'}
      </ul>
      
      <p>Generated automatically by Tillu AI POS System</p>
    `;
  }
}
