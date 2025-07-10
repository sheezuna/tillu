import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { OffersService } from './offers.service';
import { CreateOfferDto, UpdateOfferDto } from './dto/offer.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@ApiTags('Offers')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('offers')
export class OffersController {
  constructor(private readonly offersService: OffersService) {}

  @ApiOperation({ summary: 'Create a new offer' })
  @Post()
  create(@Body() createOfferDto: CreateOfferDto) {
    return this.offersService.create(createOfferDto);
  }

  @ApiOperation({ summary: 'Get all offers' })
  @Get()
  findAll(@Query('branchId') branchId?: string, @Query('active') active?: boolean) {
    return this.offersService.findAll(branchId, active);
  }

  @ApiOperation({ summary: 'Get offer by ID' })
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.offersService.findOne(id);
  }

  @ApiOperation({ summary: 'Update offer' })
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateOfferDto: UpdateOfferDto) {
    return this.offersService.update(id, updateOfferDto);
  }

  @ApiOperation({ summary: 'Delete offer' })
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.offersService.remove(id);
  }

  @ApiOperation({ summary: 'Apply offer to order' })
  @Post(':id/apply')
  apply(@Param('id') id: string, @Body() body: { orderId: string }) {
    return this.offersService.apply(id, body.orderId);
  }
}
