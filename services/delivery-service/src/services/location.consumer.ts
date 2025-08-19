import { Injectable, Logger, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import * as amqp from 'amqplib';
// import { QUEUES } from '@food-delivery/shared/src/constants';
const QUEUES = {
  ORDER_EVENTS: 'order_events',
  NOTIFICATION_EVENTS: 'notification_events',
  DRIVER_LOCATION: 'driver_location',
};

@Injectable()
export class LocationConsumer implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(LocationConsumer.name);
  private connection: any = null;
  private channel: any = null;

  async onModuleInit() {
    const url = process.env.RABBITMQ_URL || 'amqp://localhost:5672';
    try {
      this.connection = await amqp.connect(url);
      this.channel = await this.connection.createChannel();
      await this.channel.assertQueue(QUEUES.DRIVER_LOCATION, { durable: true });
      await this.channel.assertQueue(QUEUES.NOTIFICATION_EVENTS, { durable: true });

      this.channel.consume(QUEUES.DRIVER_LOCATION, (msg) => {
        if (!msg) return;
        try {
          const payload = JSON.parse(msg.content.toString());
          // Relay to notification queue for broadcast
          this.channel!.sendToQueue(
            QUEUES.NOTIFICATION_EVENTS,
            Buffer.from(JSON.stringify({ type: 'driver.location', ...payload })),
            { persistent: true, contentType: 'application/json' },
          );
          this.channel!.ack(msg);
        } catch (e) {
          this.logger.error('Failed to handle driver location', e as any);
          this.channel!.nack(msg, false, false);
        }
      });
      this.logger.log('LocationConsumer consuming driver locations');
    } catch (err) {
      this.logger.error('Failed to connect to RabbitMQ', err as any);
    }
  }

  async onModuleDestroy() {
    try { await this.channel?.close(); } catch {}
    try { await this.connection?.close(); } catch {}
  }
}


