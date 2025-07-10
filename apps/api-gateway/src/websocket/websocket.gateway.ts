import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { WEBSOCKET_EVENTS } from '@tillu/shared';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class WebsocketGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private connectedClients = new Map<string, { socket: Socket; branchId?: string; role?: string }>();

  handleConnection(client: Socket) {
    console.log(`Client connected: ${client.id}`);
    this.connectedClients.set(client.id, { socket: client });
  }

  handleDisconnect(client: Socket) {
    console.log(`Client disconnected: ${client.id}`);
    this.connectedClients.delete(client.id);
  }

  @SubscribeMessage('join-branch')
  handleJoinBranch(@MessageBody() data: { branchId: string; role: string }, @ConnectedSocket() client: Socket) {
    const clientInfo = this.connectedClients.get(client.id);
    if (clientInfo) {
      clientInfo.branchId = data.branchId;
      clientInfo.role = data.role;
      client.join(`branch-${data.branchId}`);
      client.join(`role-${data.role}`);
    }
  }

  @SubscribeMessage('leave-branch')
  handleLeaveBranch(@MessageBody() data: { branchId: string }, @ConnectedSocket() client: Socket) {
    client.leave(`branch-${data.branchId}`);
  }

  broadcastToBranch(branchId: string, event: string, data: any) {
    this.server.to(`branch-${branchId}`).emit(event, data);
  }

  broadcastToRole(role: string, event: string, data: any) {
    this.server.to(`role-${role}`).emit(event, data);
  }

  broadcastOrderUpdate(order: any) {
    this.broadcastToBranch(order.branchId, WEBSOCKET_EVENTS.ORDER_UPDATED, order);
  }

  broadcastKitchenUpdate(kitchenData: any) {
    this.broadcastToBranch(kitchenData.branchId, WEBSOCKET_EVENTS.KITCHEN_UPDATE, kitchenData);
  }

  broadcastInventoryUpdate(inventoryData: any) {
    this.broadcastToBranch(inventoryData.branchId, WEBSOCKET_EVENTS.INVENTORY_UPDATE, inventoryData);
  }

  sendStaffNotification(branchId: string, notification: any) {
    this.broadcastToBranch(branchId, WEBSOCKET_EVENTS.STAFF_NOTIFICATION, notification);
  }
}
