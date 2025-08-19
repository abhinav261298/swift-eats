import { Injectable, Logger, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import * as amqp from 'amqplib';
// import { QUEUES } from '@food-delivery/shared/src/constants';
const QUEUES = {
  ORDER_EVENTS: 'order_events',
  NOTIFICATION_EVENTS: 'notification_events',
  DRIVER_LOCATION: 'driver_location',
};
import { NotificationsGateway } from '../gateways/notifications.gateway';

@Injectable()
export class NotificationConsumer implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(NotificationConsumer.name);
  private connection: any = null;
  private channel: any = null;

  constructor(private readonly gateway: NotificationsGateway) {}

  async onModuleInit() {
    const url = process.env.RABBITMQ_URL || 'amqp://localhost:5672';
    try {
      this.connection = await amqp.connect(url);
      this.channel = await this.connection.createChannel();
      await this.channel.assertQueue(QUEUES.NOTIFICATION_EVENTS, { durable: true });
      this.channel.consume(QUEUES.NOTIFICATION_EVENTS, async (msg) => {
        if (!msg) return;
        try {
          const payload = JSON.parse(msg.content.toString());
          // Broadcast to clients
          this.gateway.emit('notification', payload);
          this.channel!.ack(msg);
        } catch (e) {
          this.logger.error('Failed to process notification', e as any);
          this.channel!.nack(msg, false, false);
        }
      });
      this.logger.log('NotificationConsumer subscribed to NOTIFICATION_EVENTS');
    } catch (err) {
      this.logger.error('Failed to connect to RabbitMQ', err as any);
    }
  }

  async onModuleDestroy() {
    try { await this.channel?.close(); } catch {}
    try { await this.connection?.close(); } catch {}
  }
}


