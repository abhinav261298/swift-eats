import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import { IoAdapter } from '@nestjs/platform-socket.io';
import { AppModule } from './app.module';

async function bootstrap() {
  const logger = new Logger('Bootstrap');
  
  try {
    // Create the NestJS application
    const app = await NestFactory.create(AppModule);
    
    // Get configuration service
    const configService = app.get(ConfigService);
    
    // Enable CORS
    app.enableCors({
      origin: configService.get('CORS_ORIGIN', '*'),
      credentials: true,
    });
    
    // Use WebSocket adapter for real-time communication
    app.useWebSocketAdapter(new IoAdapter(app));
    
    // Global validation pipe
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
        transformOptions: {
          enableImplicitConversion: true,
        },
      }),
    );
    
    // Global prefix
    app.setGlobalPrefix('api/v1');
    
    // Swagger documentation
    const config = new DocumentBuilder()
      .setTitle('SwiftEats - Analytics Service')
      .setDescription('Real-time Analytics and GPS Tracking API for SwiftEats Platform')
      .setVersion('1.0')
      .addBearerAuth()
      .addTag('analytics', 'Analytics endpoints')
      .addTag('tracking', 'GPS tracking endpoints')
      .addTag('realtime', 'Real-time data endpoints')
      .addTag('simulation', 'Data simulation endpoints')
      .build();
    
    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api/docs', app, document);
    
    // Get port from environment
    const port = configService.get('PORT', 3008);
    
    // Start the application
    await app.listen(port);
    
    logger.log(`🚀 Analytics Service is running on: http://localhost:${port}`);
    logger.log(`📚 API Documentation: http://localhost:${port}/api/docs`);
    logger.log(`🔧 Environment: ${configService.get('NODE_ENV', 'development')}`);
    logger.log(`📊 WebSocket Gateway: ws://localhost:${port}`);
    
  } catch (error) {
    logger.error('❌ Failed to start Analytics Service:', error);
    process.exit(1);
  }
}

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  process.exit(1);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

bootstrap();
