import { Injectable, Logger, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import * as amqp from 'amqplib';
// import { QUEUES } from '@food-delivery/shared/src/constants';
const QUEUES = {
  ORDER_EVENTS: 'order_events',
  NOTIFICATION_EVENTS: 'notification_events',
  DRIVER_LOCATION: 'driver_location',
};

@Injectable()
export class RabbitMQPublisher implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(RabbitMQPublisher.name);
  private connection: any = null;
  private channel: any = null;

  async onModuleInit(): Promise<void> {
    const url = process.env.RABBITMQ_URL || 'amqp://localhost:5672';
    try {
      this.connection = await amqp.connect(url);
      this.channel = await this.connection.createChannel();
      await this.channel.assertQueue(QUEUES.ORDER_EVENTS, { durable: true });
      this.logger.log('RabbitMQ publisher connected');
    } catch (err) {
      this.logger.error('Failed to connect to RabbitMQ', err as any);
    }
  }

  async publishOrderPlaced(payload: any): Promise<void> {
    if (!this.channel) return;
    this.channel.sendToQueue(QUEUES.ORDER_EVENTS, Buffer.from(JSON.stringify(payload)), {
      persistent: true,
      contentType: 'application/json',
    });
  }

  async publishNotificationEvent(payload: any): Promise<void> {
    if (!this.channel) return;
    await this.channel.assertQueue(QUEUES.NOTIFICATION_EVENTS, { durable: true });
    this.channel.sendToQueue(QUEUES.NOTIFICATION_EVENTS, Buffer.from(JSON.stringify(payload)), {
      persistent: true,
      contentType: 'application/json',
    });
  }

  async onModuleDestroy(): Promise<void> {
    try { await this.channel?.close(); } catch {}
    try { await this.connection?.close(); } catch {}
  }
}


