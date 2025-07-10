import { IsString, IsNumber, IsOptional, IsDateString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateInventoryItemDto {
  @ApiProperty()
  @IsString()
  branchId: string;

  @ApiProperty()
  @IsString()
  menuItemId: string;

  @ApiProperty()
  @IsNumber()
  currentStock: number;

  @ApiProperty()
  @IsNumber()
  minimumStock: number;

  @ApiProperty()
  @IsNumber()
  maximumStock: number;

  @ApiProperty()
  @IsString()
  unit: string;

  @ApiProperty()
  @IsNumber()
  costPerUnit: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsDateString()
  expiryDate?: Date;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  supplier?: string;
}

export class UpdateInventoryItemDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  currentStock?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  minimumStock?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  maximumStock?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  unit?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  costPerUnit?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsDateString()
  expiryDate?: Date;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  supplier?: string;
}
