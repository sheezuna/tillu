import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AiController } from './ai.controller';
import { AiService } from './ai.service';
import { Branch } from '../branches/entities/branch.entity';
import { Order } from '../orders/entities/order.entity';
import { InventoryItem } from '../inventory/entities/inventory-item.entity';
import { Customer } from '../customers/entities/customer.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Branch, Order, InventoryItem, Customer]),
  ],
  controllers: [AiController],
  providers: [AiService],
  exports: [AiService],
})
export class AiModule {}
