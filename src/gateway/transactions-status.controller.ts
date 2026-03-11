import { Controller, Patch, Param, Body } from '@nestjs/common';
import { TransactionsService } from '../transactions';
import { TransactionsGateway } from './transactions.gateway';

@Controller('transactions')
export class TransactionsStatusController {
  constructor(
    private readonly transactionsService: TransactionsService,
    private readonly transactionsGateway: TransactionsGateway,
  ) {}

  @Patch(':id/status')
  async updateStatus(
    @Param('id') id: string,
    @Body() body: { status: 'Approved' | 'Pending' },
  ) {
    const updated = await this.transactionsService.updateStatus(id, body.status);
    this.transactionsGateway.server.emit('transaction:statusUpdated', updated);
    return updated;
  }
}
