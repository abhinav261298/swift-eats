import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
// import { TypeOrmModule } from '@nestjs/typeorm';
// import { RedisModule } from '@liaoliaots/nestjs-redis';
import { TerminusModule } from '@nestjs/terminus';
import { HealthController } from './controllers/health.controller';
import { PaymentConsumer } from './services/payment.consumer';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env.local', '.env'],
    }),
    // Minimal boot (DB/Redis can be re-enabled later)
    TerminusModule,
  ],
  controllers: [HealthController],
  providers: [PaymentConsumer],
})
export class AppModule {}
