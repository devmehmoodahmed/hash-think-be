import { Controller, Get, Param } from '@nestjs/common';
import { ReceiversService } from './receivers.service';

@Controller('receivers')
export class ReceiversController {
  constructor(private readonly receiversService: ReceiversService) {}

  @Get()
  findAll() {
    return this.receiversService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.receiversService.findOne(id);
  }
}
