import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Res,
  ValidationPipe,
} from '@nestjs/common';
import type { Response } from 'express';
import { CreateListDto } from './dto/create-list.dto';
import { ListsService } from './lists.service';

@Controller('lists')
export class ListsController {
  constructor(private readonly listsService: ListsService) {}

  @Get()
  findAll() {
    return this.listsService.findAll();
  }

  @Get(':id/export')
  async exportOne(@Param('id') id: string, @Res() res: Response) {
    const payload = await this.listsService.exportOne(id);
    const slug = payload.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');
    const date = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const filename = `${slug || 'pokemon-list'}-${date}.json`;

    res.setHeader('Content-Type', 'application/json');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="${filename}"`,
    );
    res.send(payload);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    const list = await this.listsService.findOne(id);
    const totalWeight = list.items.reduce(
      (sum, item) => sum + item.weight,
      0,
    );
    return {
      id: list._id.toString(),
      name: list.name,
      items: list.items,
      itemCount: list.items.length,
      totalWeight,
      createdAt: list.createdAt,
      updatedAt: list.updatedAt,
    };
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id') id: string) {
    await this.listsService.remove(id);
  }

  @Post()
  create(
    @Body(new ValidationPipe({ whitelist: true, transform: true }))
    dto: CreateListDto,
  ) {
    return this.listsService.create(dto).then((list) => ({
      id: list._id.toString(),
      name: list.name,
      items: list.items,
      itemCount: list.items.length,
      totalWeight: list.items.reduce((sum, item) => sum + item.weight, 0),
      createdAt: list.createdAt,
      updatedAt: list.updatedAt,
    }));
  }
}
