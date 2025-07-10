import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { MenuService } from './menu.service';
import { CreateMenuItemDto, UpdateMenuItemDto } from './dto/menu-item.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@ApiTags('Menu')
@Controller('menu')
export class MenuController {
  constructor(private readonly menuService: MenuService) {}

  @ApiOperation({ summary: 'Create a new menu item' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Post()
  create(@Body() createMenuItemDto: CreateMenuItemDto) {
    return this.menuService.create(createMenuItemDto);
  }

  @ApiOperation({ summary: 'Get all menu items' })
  @Get()
  findAll(@Query('category') category?: string, @Query('available') available?: boolean) {
    return this.menuService.findAll(category, available);
  }

  @ApiOperation({ summary: 'Get menu item by ID' })
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.menuService.findOne(id);
  }

  @ApiOperation({ summary: 'Update menu item' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateMenuItemDto: UpdateMenuItemDto) {
    return this.menuService.update(id, updateMenuItemDto);
  }

  @ApiOperation({ summary: 'Delete menu item' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.menuService.remove(id);
  }

  @ApiOperation({ summary: 'Search menu items' })
  @Get('search/:query')
  search(@Param('query') query: string) {
    return this.menuService.search(query);
  }
}
