import { IsString, IsEnum, IsNumber, IsOptional, IsArray, IsBoolean, IsDateString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateOfferDto {
  @ApiProperty()
  @IsString()
  name: string;

  @ApiProperty()
  @IsString()
  description: string;

  @ApiProperty({ enum: ['percentage', 'fixed_amount', 'buy_x_get_y'] })
  @IsEnum(['percentage', 'fixed_amount', 'buy_x_get_y'])
  type: 'percentage' | 'fixed_amount' | 'buy_x_get_y';

  @ApiProperty()
  @IsNumber()
  value: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  minimumOrderValue?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsArray()
  applicableItems?: string[];

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  maxUses?: number;

  @ApiProperty()
  @IsDateString()
  validFrom: Date;

  @ApiProperty()
  @IsDateString()
  validUntil: Date;

  @ApiProperty()
  @IsArray()
  branchIds: string[];

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  customerSegment?: string;
}

export class UpdateOfferDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  value?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  minimumOrderValue?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsArray()
  applicableItems?: string[];

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  maxUses?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsDateString()
  validFrom?: Date;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsDateString()
  validUntil?: Date;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsArray()
  branchIds?: string[];

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  customerSegment?: string;
}
