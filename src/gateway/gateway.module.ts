import { Module, forwardRef } from '@nestjs/common';
import { TransactionsGateway } from './transactions.gateway';
import { TransactionsModule } from '../transactions';

@Module({
  imports: [forwardRef(() => TransactionsModule)],
  providers: [TransactionsGateway],
  exports: [TransactionsGateway],
})
export class GatewayModule {}
