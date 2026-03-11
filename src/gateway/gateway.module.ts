import { Module } from '@nestjs/common';
import { TransactionsGateway } from './transactions.gateway';
import { TransactionsStatusController } from './transactions-status.controller';
import { TransactionsModule } from '../transactions';

@Module({
  imports: [TransactionsModule],
  controllers: [TransactionsStatusController],
  providers: [TransactionsGateway],
  exports: [TransactionsGateway],
})
export class GatewayModule {}
