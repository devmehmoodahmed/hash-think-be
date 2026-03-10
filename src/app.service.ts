import { Injectable } from '@nestjs/common';
import { SupabaseService } from './supabase';
import { RedisService } from './redis';
import { RabbitMQService } from './rabbitmq';

@Injectable()
export class AppService {
  constructor(
    private readonly supabaseService: SupabaseService,
    private readonly redisService: RedisService,
    private readonly rabbitMQService: RabbitMQService,
  ) {}

  getHello(): string {
    return 'Hello World!';
  }

  async checkHealth() {
    const health: Record<string, { status: string; message?: string }> = {};

    // Check Supabase
    try {
      const { data, error } = await this.supabaseService
        .getClient()
        .from('currencies')
        .select('id')
        .limit(1);
      if (error) throw error;
      health.supabase = { status: 'connected' };
    } catch (err) {
      health.supabase = { status: 'error', message: err.message };
    }

    // Check Redis
    try {
      await this.redisService.set('health_check', 'ok', 10);
      const val = await this.redisService.get('health_check');
      health.redis = val === 'ok'
        ? { status: 'connected' }
        : { status: 'error', message: 'Unexpected value' };
    } catch (err) {
      health.redis = { status: 'error', message: err.message };
    }

    // Check RabbitMQ
    try {
      const channel = this.rabbitMQService.getChannel();
      health.rabbitmq = channel
        ? { status: 'connected' }
        : { status: 'error', message: 'Channel not available' };
    } catch (err) {
      health.rabbitmq = { status: 'error', message: err.message };
    }

    return health;
  }
}
