import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
// import { TypeOrmModule } from '@nestjs/typeorm';
import { RedisModule } from '@liaoliaots/nestjs-redis';
import { TerminusModule } from '@nestjs/terminus';
import { HealthController } from './controllers/health.controller';
import { RestaurantsController } from './controllers/restaurants.controller';
import { MenuService } from './services/menu.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env.local', '.env'],
    }),
    RedisModule.forRootAsync({
      useFactory: () => ({
        config: { url: process.env.REDIS_URL },
      }),
    }),
    TerminusModule,
  ],
  controllers: [HealthController, RestaurantsController],
  providers: [MenuService],
})
export class AppModule {}
