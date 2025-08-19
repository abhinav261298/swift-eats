import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
// import { TypeOrmModule } from '@nestjs/typeorm';
import { RedisModule } from '@liaoliaots/nestjs-redis';
import { NotificationsGateway } from './gateways/notifications.gateway';
import { NotificationConsumer } from './services/notification.consumer';
import { TerminusModule } from '@nestjs/terminus';
import { HealthController } from './controllers/health.controller';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env.local', '.env'],
    }),
    // Minimal boot: DB disabled for now
    // RedisModule.forRootAsync({
    //   useFactory: () => ({
    //     config: {
    //       url: process.env.REDIS_URL,
    //     },
    //   }),
    // }),
    TerminusModule,
  ],
  controllers: [HealthController],
  providers: [NotificationsGateway, NotificationConsumer],
})
export class AppModule {}
