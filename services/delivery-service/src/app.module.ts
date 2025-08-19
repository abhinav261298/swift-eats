import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
// import { TypeOrmModule } from '@nestjs/typeorm';
import { RedisModule } from '@liaoliaots/nestjs-redis';
import { LocationConsumer } from './services/location.consumer';
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
  providers: [LocationConsumer],
})
export class AppModule {}
