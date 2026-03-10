import { Controller, Get, Param, Query, Res } from '@nestjs/common';
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

  @Get('download/:id')
  download(@Param('id') id: string, @Res() res: Response) {
    const filePath = path.join(process.cwd(), 'assets', 'sample-receipt.pdf');

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ message: 'File not found' });
    }

    res.download(filePath, `transaction-${id}.pdf`);
  }
}
