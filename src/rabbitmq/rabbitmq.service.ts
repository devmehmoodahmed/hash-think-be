import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as amqplib from 'amqplib';

@Injectable()
export class RabbitMQService implements OnModuleInit, OnModuleDestroy {
  private connection: amqplib.Connection;
  private channel: amqplib.Channel;

  static readonly TRANSACTION_QUEUE = 'transactions_queue';

  constructor(private configService: ConfigService) {}

  async onModuleInit() {
    try {
      const url = this.configService.get<string>('RABBITMQ_URL', 'amqp://localhost:5672');
      this.connection = await amqplib.connect(url);
      this.channel = await this.connection.createChannel();
      await this.channel.assertQueue(RabbitMQService.TRANSACTION_QUEUE, { durable: true });
      console.log('RabbitMQ connected');
    } catch (error) {
      console.error('RabbitMQ connection error:', error.message);
    }
  }

  async onModuleDestroy() {
    await this.channel?.close();
    await this.connection?.close();
  }

  getChannel(): amqplib.Channel {
    return this.channel;
  }

  async publish(queue: string, message: object): Promise<void> {
    if (!this.channel) {
      console.error('RabbitMQ channel not available');
      return;
    }
    this.channel.sendToQueue(queue, Buffer.from(JSON.stringify(message)), {
      persistent: true,
    });
  }

  async consume(queue: string, callback: (msg: amqplib.ConsumeMessage) => void): Promise<void> {
    if (!this.channel) {
      console.error('RabbitMQ channel not available');
      return;
    }
    await this.channel.consume(queue, (msg) => {
      if (msg) {
        callback(msg);
        this.channel.ack(msg);
      }
    });
  }
}
