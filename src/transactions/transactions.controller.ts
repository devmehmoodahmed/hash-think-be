import { Controller, Get, Post, Body, Param, Query, Res, BadRequestException } from '@nestjs/common';
import type { Response } from 'express';
import { TransactionsService } from './transactions.service';
import * as path from 'path';
import * as fs from 'fs';

@Controller('transactions')
export class TransactionsController {
  constructor(private readonly transactionsService: TransactionsService) {}

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

  @Get('download/:id')
  download(@Param('id') id: string, @Res() res: Response) {
    const filePath = path.join(process.cwd(), 'assets', 'sample-receipt.pdf');

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ message: 'File not found' });
    }

    res.download(filePath, `transaction-${id}.pdf`);
  }
}
