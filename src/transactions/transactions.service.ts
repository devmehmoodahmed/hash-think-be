import { Injectable } from '@nestjs/common';
import { SupabaseService } from '../supabase';
import { RedisService } from '../redis';
import { RabbitMQService } from '../rabbitmq';

@Injectable()
export class TransactionsService {
  private readonly CACHE_TTL = 60; // 1 minute (shorter since transactions change frequently)

  constructor(
    private readonly supabaseService: SupabaseService,
    private readonly redisService: RedisService,
    private readonly rabbitmqService: RabbitMQService,
  ) {}

  async findByReceiverAndCurrency(receiverId: string, currencyCode: string) {
    const cacheKey = `transactions:${receiverId}:${currencyCode}`;
    const cached = await this.redisService.get(cacheKey);
    if (cached) return JSON.parse(cached);

    // First get the currency ID from the code
    const { data: currency, error: currencyError } = await this.supabaseService
      .getClient()
      .from('currencies')
      .select('id')
      .eq('code', currencyCode)
      .single();

    if (currencyError) throw currencyError;

    const { data, error } = await this.supabaseService
      .getClient()
      .from('transactions')
      .select('*')
      .eq('receiver_id', receiverId)
      .eq('currency_id', currency.id)
      .order('date_time', { ascending: false });

    if (error) throw error;

    await this.redisService.set(cacheKey, JSON.stringify(data), this.CACHE_TTL);
    return data;
  }

  async updateStatus(transactionId: string, status: 'Approved' | 'Pending') {
    const { data, error } = await this.supabaseService
      .getClient()
      .from('transactions')
      .update({ status })
      .eq('id', transactionId)
      .select()
      .single();

    if (error) throw error;

    // Invalidate related caches
    await this.invalidateTransactionCache(data.receiver_id);
    return data;
  }

  async create(transaction: {
    receiver_id: string;
    currency_id: string;
    reference_number: string;
    to: string;
    date_time: string;
    paid_with: string;
    amount: number;
    status: 'Approved' | 'Pending';
  }) {
    const { data, error } = await this.supabaseService
      .getClient()
      .from('transactions')
      .insert(transaction)
      .select()
      .single();

    if (error) throw error;

    await this.invalidateTransactionCache(data.receiver_id);

    // Publish to RabbitMQ so the consumer can broadcast via Socket.IO
    console.log('[RabbitMQ] Transaction queued:', data.id);
    await this.rabbitmqService.publish(
      RabbitMQService.TRANSACTION_QUEUE,
      data,
    );

    return data;
  }

  private async invalidateTransactionCache(receiverId: string) {
    // Delete all cached transactions for this receiver
    const keys = ['USD', 'IRR', 'INR'].map(
      (code) => `transactions:${receiverId}:${code}`,
    );
    for (const key of keys) {
      await this.redisService.del(key);
    }
  }
}
