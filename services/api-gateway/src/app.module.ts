import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { HealthController } from './controllers/health.controller';
import { PublicController } from './controllers/public.controller';
import { ProfileController } from './controllers/profile.controller';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
  ],
  controllers: [HealthController, PublicController, ProfileController],
})
export class AppModule {}


