import { IsString, IsArray, IsNumber, IsOptional, IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateKitchenQueueDto {
  @ApiProperty()
  @IsString()
  orderId: string;

  @ApiProperty()
  @IsString()
  branchId: string;

  @ApiProperty()
  @IsArray()
  items: any[];

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  estimatedTime?: number;
}

export class UpdateKitchenQueueDto {
  @ApiProperty({ required: false, enum: ['pending', 'in_progress', 'completed'] })
  @IsOptional()
  @IsEnum(['pending', 'in_progress', 'completed'])
  status?: 'pending' | 'in_progress' | 'completed';

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  assignedChef?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  priority?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  estimatedTime?: number;
}
