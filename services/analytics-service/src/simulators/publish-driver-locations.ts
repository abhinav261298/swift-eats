import * as amqp from 'amqplib';
import { DriverSimulator } from './driver-simulator';
import { Logger } from '@nestjs/common';

const logger = new Logger('DriverSimulatorPublisher');

async function main() {
  const url = process.env.RABBITMQ_URL || 'amqp://localhost:5672';
  const queue = process.env.DRIVER_LOCATION_QUEUE || 'driver_location';

  let connection: any = null;
  let channel: any = null;
  try {
    connection = await amqp.connect(url);
    channel = await connection.createChannel();
    await channel.assertQueue(queue, { durable: true });
    logger.log(`Connected to RabbitMQ. Publishing to ${queue}`);

    const simulator = new DriverSimulator((driverId, location) => {
      if (!channel) return;
      const payload = { driverId, location };
      channel.sendToQueue(queue, Buffer.from(JSON.stringify(payload)), {
        persistent: true,
        contentType: 'application/json',
      });
    }, 50, 100);

    simulator.start();
  } catch (err) {
    logger.error('Failed to start publisher', err as any);
    await channel?.close().catch(() => {});
    await connection?.close().catch(() => {});
    process.exit(1);
  }
}

main();


