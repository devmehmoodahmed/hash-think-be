import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { OnModuleInit } from '@nestjs/common';
import { Server, Socket } from 'socket.io';
import { TransactionsService } from '../transactions';
import { RabbitMQService } from '../rabbitmq';

@WebSocketGateway({
  cors: {
    origin: process.env.CLIENT_URL || 'http://localhost:3000',
    credentials: true,
  },
})
export class TransactionsGateway implements OnModuleInit {
  @WebSocketServer()
  server: Server;

  constructor(
    private readonly transactionsService: TransactionsService,
    private readonly rabbitmqService: RabbitMQService,
  ) {}

  async onModuleInit() {
    await this.rabbitmqService.consume(
      RabbitMQService.TRANSACTION_QUEUE,
      (msg) => {
        const transaction = JSON.parse(msg.content.toString());
        this.emitNewTransaction(transaction);
      },
    );
  }

  // Client requests to update a transaction status
  @SubscribeMessage('transaction:updateStatus')
  async handleStatusUpdate(
    @MessageBody() payload: { transactionId: string; status: 'Approved' | 'Pending' },
    @ConnectedSocket() client: Socket,
  ) {
    const updated = await this.transactionsService.updateStatus(
      payload.transactionId,
      payload.status,
    );

    // Broadcast status change to all connected clients
    this.server.emit('transaction:statusUpdated', updated);
    return updated;
  }

  // Called by RabbitMQ consumer or internally to broadcast new transactions
  emitNewTransaction(transaction: any) {
    this.server.emit('transaction:new', transaction);
  }
}
