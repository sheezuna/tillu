import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { SmsService } from './sms.service';
import { EmailService } from './email.service';
import { MarketingService } from './marketing.service';
import { ForecastingService } from './forecasting.service';
import { Customer } from '../customers/entities/customer.entity';
import { Campaign } from '../campaigns/entities/campaign.entity';
import { Order } from '../orders/entities/order.entity';
import { InventoryItem } from '../inventory/entities/inventory-item.entity';
import { AiModule } from '../ai/ai.module';

@Module({
  imports: [
    ConfigModule,
    TypeOrmModule.forFeature([Customer, Campaign, Order, InventoryItem]),
    AiModule,
  ],
  providers: [SmsService, EmailService, MarketingService, ForecastingService],
  exports: [SmsService, EmailService, MarketingService, ForecastingService],
})
export class ServicesModule {}
