import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { TransactionsService } from '../transactions';

@WebSocketGateway({
  cors: {
    origin: process.env.CLIENT_URL || 'http://localhost:3000',
    credentials: true,
  },
})
export class TransactionsGateway {
  @WebSocketServer()
  server: Server;

  constructor(private readonly transactionsService: TransactionsService) {}

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
