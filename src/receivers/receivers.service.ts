import { Injectable } from '@nestjs/common';
import { SupabaseService } from '../supabase';
import { RedisService } from '../redis';

@Injectable()
export class ReceiversService {
  private readonly CACHE_TTL = 300; // 5 minutes

  constructor(
    private readonly supabaseService: SupabaseService,
    private readonly redisService: RedisService,
  ) {}

  async findAll() {
    const cacheKey = 'receivers:all';
    const cached = await this.redisService.get(cacheKey);
    if (cached) return JSON.parse(cached);

    const { data, error } = await this.supabaseService
      .getClient()
      .from('receivers')
      .select('*');

    if (error) throw error;

    await this.redisService.set(cacheKey, JSON.stringify(data), this.CACHE_TTL);
    return data;
  }

  async findOne(id: string) {
    const cacheKey = `receivers:${id}`;
    const cached = await this.redisService.get(cacheKey);
    if (cached) return JSON.parse(cached);

    const { data: receiver, error: receiverError } = await this.supabaseService
      .getClient()
      .from('receivers')
      .select('*')
      .eq('id', id)
      .single();

    if (receiverError) throw receiverError;

    // Get currencies with account counts for this receiver
    const { data: accounts, error: accountsError } = await this.supabaseService
      .getClient()
      .from('accounts')
      .select('currency_id, currencies(id, code, name, flag_url)')
      .eq('receiver_id', id);

    if (accountsError) throw accountsError;

    // Group accounts by currency and count
    const currencyMap = new Map<string, { currency: any; accountCount: number }>();
    for (const account of accounts) {
      const currency = account.currencies as any;
      if (currencyMap.has(currency.id)) {
        currencyMap.get(currency.id)!.accountCount++;
      } else {
        currencyMap.set(currency.id, { currency, accountCount: 1 });
      }
    }

    const result = {
      ...receiver,
      currencies: Array.from(currencyMap.values()).map(({ currency, accountCount }) => ({
        ...currency,
        account_count: accountCount,
      })),
    };

    await this.redisService.set(cacheKey, JSON.stringify(result), this.CACHE_TTL);
    return result;
  }
}
