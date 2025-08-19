import { Injectable, Logger, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import * as amqp from 'amqplib';
// import { QUEUES } from '@food-delivery/shared/src/constants';
const QUEUES = {
  ORDER_EVENTS: 'order_events',
  NOTIFICATION_EVENTS: 'notification_events',
  DRIVER_LOCATION: 'driver_location',
};
import axios from 'axios';

@Injectable()
export class PaymentConsumer implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(PaymentConsumer.name);
  private connection: any = null;
  private channel: any = null;

  async onModuleInit() {
    const url = process.env.RABBITMQ_URL || 'amqp://localhost:5672';
    try {
      this.connection = await amqp.connect(url);
      this.channel = await this.connection.createChannel();
      await this.channel.assertQueue(QUEUES.ORDER_EVENTS, { durable: true });
      this.channel.consume(QUEUES.ORDER_EVENTS, async (msg) => {
        if (!msg) return;
        try {
          const payload = JSON.parse(msg.content.toString());
          if (payload?.type === 'OrderPlaced') {
            await this.processOrder(payload.orderId);
          }
          this.channel!.ack(msg);
        } catch (e) {
          this.logger.error('Failed to process message', e as any);
          this.channel!.nack(msg, false, false);
        }
      });
      this.logger.log('PaymentConsumer subscribed to ORDER_EVENTS');
    } catch (err) {
      this.logger.error('Failed to connect to RabbitMQ', err as any);
    }
  }

  async processOrder(orderId: string) {
    // Mock payment always succeeds
    const orderSvc = process.env.ORDER_SERVICE_URL || 'http://localhost:3004';
    await axios.patch(`${orderSvc}/api/v1/orders/${orderId}/status`, { status: 'CONFIRMED' });
    this.logger.log(`Order ${orderId} confirmed`);
  }

  async onModuleDestroy() {
    try { await this.channel?.close(); } catch {}
    try { await this.connection?.close(); } catch {}
  }
}


