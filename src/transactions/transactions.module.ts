import { Module, forwardRef } from '@nestjs/common';
import { TransactionsController } from './transactions.controller';
import { TransactionsService } from './transactions.service';
import { GatewayModule } from '../gateway';

@Module({
  imports: [forwardRef(() => GatewayModule)],
  controllers: [TransactionsController],
  providers: [TransactionsService],
  exports: [TransactionsService],
})
export class TransactionsModule {}
