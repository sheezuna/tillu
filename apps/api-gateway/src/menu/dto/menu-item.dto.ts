import { IsString, IsNumber, IsBoolean, IsArray, IsOptional, IsObject } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateMenuItemDto {
  @ApiProperty()
  @IsString()
  name: string;

  @ApiProperty()
  @IsString()
  description: string;

  @ApiProperty()
  @IsNumber()
  price: number;

  @ApiProperty()
  @IsString()
  category: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsBoolean()
  isAvailable?: boolean;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  preparationTime?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  complexity?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsArray()
  allergens?: string[];

  @ApiProperty({ required: false })
  @IsOptional()
  @IsObject()
  nutritionalInfo?: Record<string, any>;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  imageUrl?: string;
}

export class UpdateMenuItemDto {
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
  price?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  category?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsBoolean()
  isAvailable?: boolean;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  preparationTime?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  complexity?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsArray()
  allergens?: string[];

  @ApiProperty({ required: false })
  @IsOptional()
  @IsObject()
  nutritionalInfo?: Record<string, any>;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  imageUrl?: string;
}
