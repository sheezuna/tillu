import { Controller, Get, Query, UseGuards, Param } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AnalyticsService } from './analytics.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@ApiTags('Analytics')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('analytics')
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @ApiOperation({ summary: 'Get sales analytics' })
  @Get('sales')
  getSalesAnalytics(
    @Query('branchId') branchId?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.analyticsService.getSalesAnalytics(branchId, startDate, endDate);
  }

  @ApiOperation({ summary: 'Get customer analytics' })
  @Get('customers')
  getCustomerAnalytics(@Query('branchId') branchId?: string) {
    return this.analyticsService.getCustomerAnalytics(branchId);
  }

  @ApiOperation({ summary: 'Get inventory analytics' })
  @Get('inventory')
  getInventoryAnalytics(@Query('branchId') branchId?: string) {
    return this.analyticsService.getInventoryAnalytics(branchId);
  }

  @ApiOperation({ summary: 'Get real-time dashboard data' })
  @Get('dashboard/:branchId')
  getDashboard(@Param('branchId') branchId: string) {
    return this.analyticsService.getDashboard(branchId);
  }

  @ApiOperation({ summary: 'Get popular items' })
  @Get('popular-items')
  getPopularItems(@Query('branchId') branchId?: string, @Query('limit') limit?: number) {
    return this.analyticsService.getPopularItems(branchId, limit);
  }

  @ApiOperation({ summary: 'Get revenue forecast' })
  @Get('forecast/:branchId')
  getRevenueForecast(@Param('branchId') branchId: string, @Query('days') days?: number) {
    return this.analyticsService.getRevenueForecast(branchId, days);
  }
}
