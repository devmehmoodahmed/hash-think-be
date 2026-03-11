import { Controller, Patch, Param, Body, BadRequestException } from '@nestjs/common';
import { TransactionsService } from '../transactions';
import { TransactionsGateway } from './transactions.gateway';

const VALID_STATUSES = ['Approved', 'Pending'];

@Controller('transactions')
export class TransactionsStatusController {
  constructor(
    private readonly transactionsService: TransactionsService,
    private readonly transactionsGateway: TransactionsGateway,
  ) {}

  @Patch(':id/status')
  async updateStatus(
    @Param('id') id: string,
    @Body() body: { status: string },
  ) {
    if (!VALID_STATUSES.includes(body.status)) {
      throw new BadRequestException(
        `Invalid status "${body.status}". Allowed values: ${VALID_STATUSES.join(', ')}`,
      );
    }
    const updated = await this.transactionsService.updateStatus(
      id,
      body.status as 'Approved' | 'Pending',
    );
    this.transactionsGateway.server.emit('transaction:statusUpdated', updated);
    return updated;
  }
}
