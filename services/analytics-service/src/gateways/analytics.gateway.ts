import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger } from '@nestjs/common';
import { DriverLocationDto, AnalyticsEventDto } from '../dto/analytics.dto';
import { AnalyticsService } from '../services/analytics.service';
import { RealTimeService } from '../services/realtime.service';

@WebSocketGateway({
  cors: {
    origin: '*',
    credentials: true,
  },
  namespace: '/analytics',
})
export class AnalyticsGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(AnalyticsGateway.name);
  private connectedClients = new Map<string, Socket>();

  constructor(
    private readonly analyticsService: AnalyticsService,
    private readonly realTimeService: RealTimeService,
  ) {}

  afterInit(server: Server) {
    this.logger.log('Analytics WebSocket Gateway initialized');
  }

  handleConnection(client: Socket) {
    const clientId = client.id;
    this.connectedClients.set(clientId, client);
    
    this.logger.log(`Client connected: ${clientId}`);
    
    // Send initial real-time metrics
    this.sendRealTimeMetrics(client);
  }

  handleDisconnect(client: Socket) {
    const clientId = client.id;
    this.connectedClients.delete(clientId);
    
    this.logger.log(`Client disconnected: ${clientId}`);
  }

  // Subscribe to driver location updates
  @SubscribeMessage('subscribe_driver_location')
  async handleSubscribeDriverLocation(
    @MessageBody() data: { driverId: string },
    @ConnectedSocket() client: Socket,
  ) {
    const { driverId } = data;
    
    // Join the driver's room for real-time updates
    await client.join(`driver_${driverId}`);
    
    // Send current driver location
    const currentLocation = await this.analyticsService.getCurrentDriverLocation(driverId);
    if (currentLocation) {
      client.emit('driver_location_update', currentLocation);
    }
    
    this.logger.log(`Client ${client.id} subscribed to driver ${driverId} location updates`);
  }

  // Subscribe to order tracking updates
  @SubscribeMessage('subscribe_order_tracking')
  async handleSubscribeOrderTracking(
    @MessageBody() data: { orderId: string },
    @ConnectedSocket() client: Socket,
  ) {
    const { orderId } = data;
    
    // Join the order's room for real-time updates
    await client.join(`order_${orderId}`);
    
    // Send current order status
    const orderStatus = await this.analyticsService.getOrderTrackingInfo(orderId);
    if (orderStatus) {
      client.emit('order_tracking_update', orderStatus);
    }
    
    this.logger.log(`Client ${client.id} subscribed to order ${orderId} tracking updates`);
  }

  // Subscribe to real-time metrics
  @SubscribeMessage('subscribe_metrics')
  async handleSubscribeMetrics(@ConnectedSocket() client: Socket) {
    // Join the metrics room
    await client.join('real_time_metrics');
    
    // Send current metrics
    this.sendRealTimeMetrics(client);
    
    this.logger.log(`Client ${client.id} subscribed to real-time metrics`);
  }

  // Unsubscribe from updates
  @SubscribeMessage('unsubscribe')
  async handleUnsubscribe(
    @MessageBody() data: { type: string; id: string },
    @ConnectedSocket() client: Socket,
  ) {
    const { type, id } = data;
    
    await client.leave(`${type}_${id}`);
    
    this.logger.log(`Client ${client.id} unsubscribed from ${type} ${id}`);
  }

  // Broadcast driver location update to all subscribers
  async broadcastDriverLocation(driverId: string, location: DriverLocationDto) {
    this.server.to(`driver_${driverId}`).emit('driver_location_update', {
      driverId,
      location: {
        latitude: location.latitude,
        longitude: location.longitude,
        speed: location.speed,
        heading: location.heading,
        status: location.status,
        timestamp: new Date(),
      },
    });
  }

  // Broadcast order tracking update to all subscribers
  async broadcastOrderTracking(orderId: string, trackingInfo: any) {
    this.server.to(`order_${orderId}`).emit('order_tracking_update', {
      orderId,
      ...trackingInfo,
      timestamp: new Date(),
    });
  }

  // Broadcast analytics event to all subscribers
  async broadcastAnalyticsEvent(event: AnalyticsEventDto) {
    this.server.to('analytics_events').emit('analytics_event', {
      ...event,
      timestamp: new Date(),
    });
  }

  // Broadcast real-time metrics to all subscribers
  async broadcastRealTimeMetrics(metrics: any) {
    this.server.to('real_time_metrics').emit('real_time_metrics', {
      ...metrics,
      timestamp: new Date(),
    });
  }

  // Send real-time metrics to a specific client
  private async sendRealTimeMetrics(client: Socket) {
    const metrics = await this.realTimeService.getRealTimeMetrics();
    client.emit('real_time_metrics', metrics);
  }

  // Get connected clients count
  getConnectedClientsCount(): number {
    return this.connectedClients.size;
  }

  // Get all connected clients
  getConnectedClients(): Map<string, Socket> {
    return this.connectedClients;
  }

  // Broadcast system health update
  async broadcastSystemHealth(health: any) {
    this.server.emit('system_health', {
      ...health,
      timestamp: new Date(),
    });
  }

  // Broadcast performance metrics
  async broadcastPerformanceMetrics(metrics: any) {
    this.server.to('performance_metrics').emit('performance_metrics', {
      ...metrics,
      timestamp: new Date(),
    });
  }
}
