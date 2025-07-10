import { IsString, IsEnum, IsOptional, IsObject, IsDateString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateCampaignDto {
  @ApiProperty()
  @IsString()
  name: string;

  @ApiProperty({ enum: ['sms', 'email', 'push'] })
  @IsEnum(['sms', 'email', 'push'])
  type: 'sms' | 'email' | 'push';

  @ApiProperty()
  @IsString()
  targetSegment: string;

  @ApiProperty()
  @IsObject()
  content: {
    subject?: string;
    message: string;
    imageUrl?: string;
  };

  @ApiProperty({ required: false })
  @IsOptional()
  @IsDateString()
  scheduledAt?: Date;
}

export class UpdateCampaignDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiProperty({ required: false, enum: ['draft', 'scheduled', 'active', 'completed', 'cancelled'] })
  @IsOptional()
  @IsEnum(['draft', 'scheduled', 'active', 'completed', 'cancelled'])
  status?: 'draft' | 'scheduled' | 'active' | 'completed' | 'cancelled';

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  targetSegment?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsObject()
  content?: {
    subject?: string;
    message: string;
    imageUrl?: string;
  };

  @ApiProperty({ required: false })
  @IsOptional()
  @IsDateString()
  scheduledAt?: Date;
}
