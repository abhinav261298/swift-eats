import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
// import { RedisModule } from '@liaoliaots/nestjs-redis';
import { TerminusModule } from '@nestjs/terminus';
import { HealthController } from './controllers/health.controller';
import { OrdersController } from './controllers/orders.controller';
import { Order } from './entities/order.entity';
import { OrderItem } from './entities/order-item.entity';
import { OrdersService } from './services/orders.service';
import { RabbitMQPublisher } from './services/rabbitmq.publisher';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env.local', '.env'],
    }),
    // TypeOrmModule.forRootAsync({
    //   useFactory: () => ({
    //     type: 'postgres',
    //     url: process.env.DATABASE_URL,
    //     entities: [Order, OrderItem],
    //     synchronize: process.env.NODE_ENV === 'development',
    //     logging: process.env.NODE_ENV === 'development',
    //   }),
    // }),
    // TypeOrmModule.forFeature([Order, OrderItem]),
    TerminusModule,
  ],
  controllers: [HealthController, OrdersController],
  providers: [OrdersService, RabbitMQPublisher],
})
export class AppModule {}
