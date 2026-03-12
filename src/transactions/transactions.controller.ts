import { Controller, Get, Post, Patch, Body, Param, Query, Res, BadRequestException, Inject, forwardRef } from '@nestjs/common';
import type { Response } from 'express';
import { TransactionsService } from './transactions.service';
import { TransactionsGateway } from '../gateway';
import * as path from 'path';
import * as fs from 'fs';

const VALID_STATUSES = ['Approved', 'Pending'];

@Controller('transactions')
export class TransactionsController {
  constructor(
    private readonly transactionsService: TransactionsService,
    @Inject(forwardRef(() => TransactionsGateway))
    private readonly transactionsGateway: TransactionsGateway,
  ) {}

  @Get()
  findByReceiverAndCurrency(
    @Query('receiverId') receiverId: string,
    @Query('currency') currency: string,
  ) {
    return this.transactionsService.findByReceiverAndCurrency(
      receiverId,
      currency || 'USD',
    );
  }

  @Post()
  create(
    @Body()
    body: {
      receiver_id: string;
      currency_id: string;
      reference_number: string;
      to: string;
      date_time: string;
      paid_with: string;
      amount: number;
      status: string;
    },
  ) {
    const validStatuses = ['Approved', 'Pending'];
    if (!validStatuses.includes(body.status)) {
      throw new BadRequestException(
        `Invalid status "${body.status}". Allowed values: ${validStatuses.join(', ')}`,
      );
    }
    return this.transactionsService.create(body as any);
  }

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

  @Get('download/:id')
  download(@Param('id') id: string, @Res() res: Response) {
    const filePath = path.join(process.cwd(), 'assets', 'sample-receipt.pdf');

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ message: 'File not found' });
    }

    res.download(filePath, `transaction-${id}.pdf`);
  }
}
