import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { SupabaseModule } from './supabase';
import { RedisModule } from './redis';
import { RabbitMQModule } from './rabbitmq';
import { ReceiversModule } from './receivers';
import { TransactionsModule } from './transactions';
import { GatewayModule } from './gateway';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    SupabaseModule,
    RedisModule,
    RabbitMQModule,
    ReceiversModule,
    TransactionsModule,
    GatewayModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
