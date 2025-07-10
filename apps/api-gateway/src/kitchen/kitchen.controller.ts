import { Controller, Get, Post, Body, Patch, Param, UseGuards, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { KitchenService } from './kitchen.service';
import { CreateKitchenQueueDto, UpdateKitchenQueueDto } from './dto/kitchen-queue.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@ApiTags('Kitchen')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('kitchen')
export class KitchenController {
  constructor(private readonly kitchenService: KitchenService) {}

  @ApiOperation({ summary: 'Add order to kitchen queue' })
  @Post('queue')
  addToQueue(@Body() createKitchenQueueDto: CreateKitchenQueueDto) {
    return this.kitchenService.addToQueue(createKitchenQueueDto);
  }

  @ApiOperation({ summary: 'Get kitchen queue' })
  @Get('queue')
  getQueue(@Query('branchId') branchId?: string, @Query('status') status?: string) {
    return this.kitchenService.getQueue(branchId, status);
  }

  @ApiOperation({ summary: 'Update queue item status' })
  @Patch('queue/:id')
  updateQueueItem(@Param('id') id: string, @Body() updateKitchenQueueDto: UpdateKitchenQueueDto) {
    return this.kitchenService.updateQueueItem(id, updateKitchenQueueDto);
  }

  @ApiOperation({ summary: 'Start preparing order' })
  @Post('queue/:id/start')
  startPreparation(@Param('id') id: string, @Body() body: { chefId: string }) {
    return this.kitchenService.startPreparation(id, body.chefId);
  }

  @ApiOperation({ summary: 'Complete order preparation' })
  @Post('queue/:id/complete')
  completePreparation(@Param('id') id: string) {
    return this.kitchenService.completePreparation(id);
  }

  @ApiOperation({ summary: 'Get kitchen analytics' })
  @Get('analytics/:branchId')
  getAnalytics(@Param('branchId') branchId: string) {
    return this.kitchenService.getAnalytics(branchId);
  }
}
