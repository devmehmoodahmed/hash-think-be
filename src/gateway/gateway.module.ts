import { Module } from '@nestjs/common';
import { TransactionsGateway } from './transactions.gateway';
import { TransactionsModule } from '../transactions';

@Module({
  imports: [TransactionsModule],
  providers: [TransactionsGateway],
  exports: [TransactionsGateway],
})
export class GatewayModule {}
