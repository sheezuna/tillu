import { IsString, IsEnum, IsArray, IsNumber, IsOptional, ValidateNested, IsObject } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { OrderType, OrderStatus } from '@tillu/shared';

export class CreateOrderItemDto {
  @ApiProperty()
  @IsString()
  menuItemId: string;

  @ApiProperty()
  @IsNumber()
  quantity: number;

  @ApiProperty()
  @IsNumber()
  price: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsObject()
  modifiers?: Record<string, any>;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  specialInstructions?: string;
}

export class CreateOrderDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  customerId?: string;

  @ApiProperty()
  @IsString()
  branchId: string;

  @ApiProperty({ enum: ['dine_in', 'takeaway', 'delivery'] })
  @IsEnum(['dine_in', 'takeaway', 'delivery'])
  type: OrderType;

  @ApiProperty({ type: [CreateOrderItemDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateOrderItemDto)
  items: CreateOrderItemDto[];

  @ApiProperty()
  @IsNumber()
  subtotal: number;

  @ApiProperty()
  @IsNumber()
  tax: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  discount?: number;

  @ApiProperty()
  @IsNumber()
  total: number;

  @ApiProperty()
  @IsObject()
  customerInfo: {
    name: string;
    phone: string;
    email?: string;
    address?: string;
  };

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  notes?: string;
}

export class UpdateOrderDto {
  @ApiProperty({ required: false, enum: ['pending', 'confirmed', 'preparing', 'ready', 'delivered', 'cancelled'] })
  @IsOptional()
  @IsEnum(['pending', 'confirmed', 'preparing', 'ready', 'delivered', 'cancelled'])
  status?: OrderStatus;

  @ApiProperty({ required: false })
  @IsOptional()
  estimatedReadyTime?: Date;

  @ApiProperty({ required: false })
  @IsOptional()
  actualReadyTime?: Date;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  notes?: string;
}
