#!/bin/bash

# Setup script for SwiftEats Food Delivery Platform
# This script creates the basic structure for all missing services

echo "🚀 Setting up SwiftEats Food Delivery Platform..."

# Create basic service structure
create_service_structure() {
    local service_name=$1
    local port=$2
    
    echo "📦 Setting up $service_name..."
    
    # Create directories
    mkdir -p "services/$service_name/src/controllers"
    mkdir -p "services/$service_name/src/services"
    mkdir -p "services/$service_name/src/entities"
    mkdir -p "services/$service_name/src/dto"
    mkdir -p "services/$service_name/src/repositories"
    mkdir -p "services/$service_name/src/config"
    mkdir -p "services/$service_name/src/middleware"
    mkdir -p "services/$service_name/src/utils"
    mkdir -p "services/$service_name/test"
    
    # Create main.ts
    cat > "services/$service_name/src/main.ts" << EOF
import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import { AppModule } from './app.module';

async function bootstrap() {
  const logger = new Logger('Bootstrap');
  
  try {
    const app = await NestFactory.create(AppModule);
    const configService = app.get(ConfigService);
    
    app.enableCors({
      origin: configService.get('CORS_ORIGIN', '*'),
      credentials: true,
    });
    
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
    
    app.setGlobalPrefix('api/v1');
    
    const config = new DocumentBuilder()
      .setTitle('Food Delivery - $service_name')
      .setDescription('$service_name API for Food Delivery Platform')
      .setVersion('1.0')
      .addBearerAuth()
      .build();
    
    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api/docs', app, document);
    
    const port = configService.get('PORT', $port);
    await app.listen(port);
    
    logger.log(\`🚀 $service_name is running on: http://localhost:\${port}\`);
    logger.log(\`📚 API Documentation: http://localhost:\${port}/api/docs\`);
    
  } catch (error) {
    logger.error('❌ Failed to start $service_name:', error);
    process.exit(1);
  }
}

process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

bootstrap();
EOF

    # Create app.module.ts
    cat > "services/$service_name/src/app.module.ts" << EOF
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RedisModule } from '@nestjs/redis';
import { TerminusModule } from '@nestjs/terminus';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env.local', '.env'],
    }),
    TypeOrmModule.forRootAsync({
      useFactory: () => ({
        type: 'postgres',
        url: process.env.DATABASE_URL,
        synchronize: process.env.NODE_ENV === 'development',
        logging: process.env.NODE_ENV === 'development',
      }),
    }),
    RedisModule.forRootAsync({
      useFactory: () => ({
        config: {
          url: process.env.REDIS_URL,
        },
      }),
    }),
    TerminusModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
EOF

    # Create tsconfig.json
    cat > "services/$service_name/tsconfig.json" << EOF
{
  "compilerOptions": {
    "module": "commonjs",
    "declaration": true,
    "removeComments": true,
    "emitDecoratorMetadata": true,
    "experimentalDecorators": true,
    "allowSyntheticDefaultImports": true,
    "target": "ES2020",
    "sourceMap": true,
    "outDir": "./dist",
    "baseUrl": "./",
    "incremental": true,
    "skipLibCheck": true,
    "strictNullChecks": false,
    "noImplicitAny": false,
    "strictBindCallApply": false,
    "forceConsistentCasingInFileNames": false,
    "noFallthroughCasesInSwitch": false
  }
}
EOF

    # Create nest-cli.json
    cat > "services/$service_name/nest-cli.json" << EOF
{
  "collection": "@nestjs/schematics",
  "sourceRoot": "src",
  "compilerOptions": {
    "deleteOutDir": true
  }
}
EOF

    # Create Dockerfile
    cat > "services/$service_name/Dockerfile" << EOF
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

EXPOSE $port

CMD ["npm", "run", "start:prod"]
EOF

    echo "✅ $service_name structure created"
}

# Create services
create_service_structure "restaurant-service" 3003
create_service_structure "order-service" 3004
create_service_structure "delivery-service" 3005
create_service_structure "notification-service" 3006
create_service_structure "payment-service" 3007

# Create shared package structure
echo "📦 Setting up shared package..."
mkdir -p "shared/src/common"
mkdir -p "shared/src/constants"
mkdir -p "shared/src/interfaces"
mkdir -p "shared/src/utils"

# Create shared index files
cat > "shared/src/index.ts" << EOF
export * from './common';
export * from './constants';
export * from './interfaces';
export * from './utils';
EOF

cat > "shared/src/common/index.ts" << EOF
// Common utilities and classes
EOF

cat > "shared/src/constants/index.ts" << EOF
// Shared constants
EOF

cat > "shared/src/interfaces/index.ts" << EOF
// Shared interfaces
EOF

cat > "shared/src/utils/index.ts" << EOF
// Shared utilities
EOF

# Create shared tsconfig.json
cat > "shared/tsconfig.json" << EOF
{
  "compilerOptions": {
    "module": "commonjs",
    "declaration": true,
    "removeComments": true,
    "emitDecoratorMetadata": true,
    "experimentalDecorators": true,
    "allowSyntheticDefaultImports": true,
    "target": "ES2020",
    "sourceMap": true,
    "outDir": "./dist",
    "baseUrl": "./",
    "incremental": true,
    "skipLibCheck": true,
    "strictNullChecks": false,
    "noImplicitAny": false,
    "strictBindCallApply": false,
    "forceConsistentCasingInFileNames": false,
    "noFallthroughCasesInSwitch": false
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist"]
}
EOF

echo "✅ Shared package structure created"

# Create infrastructure files
echo "🏗️ Setting up infrastructure..."

# Create Redis config
cat > "infrastructure/redis/redis.conf" << EOF
# Redis configuration for Food Delivery Platform
bind 0.0.0.0
port 6379
timeout 0
tcp-keepalive 300
daemonize no
supervised no
pidfile /var/run/redis_6379.pid
loglevel notice
logfile ""
databases 16
save 900 1
save 300 10
save 60 10000
stop-writes-on-bgsave-error yes
rdbcompression yes
rdbchecksum yes
dbfilename dump.rdb
dir ./
maxmemory 256mb
maxmemory-policy allkeys-lru
appendonly yes
appendfilename "appendonly.aof"
appendfsync everysec
no-appendfsync-on-rewrite no
auto-aof-rewrite-percentage 100
auto-aof-rewrite-min-size 64mb
EOF

# Create MongoDB init script
cat > "infrastructure/mongodb/init.js" << EOF
// MongoDB initialization script for Food Delivery Platform
db = db.getSiblingDB('food_delivery');

// Create collections
db.createCollection('analytics_events');
db.createCollection('driver_locations');
db.createCollection('order_analytics');
db.createCollection('user_sessions');

// Create indexes for better performance
db.analytics_events.createIndex({ "timestamp": -1 });
db.analytics_events.createIndex({ "eventType": 1 });
db.analytics_events.createIndex({ "userId": 1 });

db.driver_locations.createIndex({ "driverId": 1 });
db.driver_locations.createIndex({ "timestamp": -1 });
db.driver_locations.createIndex({ "location": "2dsphere" });

db.order_analytics.createIndex({ "orderId": 1 });
db.order_analytics.createIndex({ "timestamp": -1 });
db.order_analytics.createIndex({ "status": 1 });

db.user_sessions.createIndex({ "userId": 1 });
db.user_sessions.createIndex({ "sessionId": 1 });
db.user_sessions.createIndex({ "expiresAt": 1 });

print('MongoDB initialization completed');
EOF

echo "✅ Infrastructure files created"

# Make script executable
chmod +x scripts/setup-services.sh

echo "🎉 SwiftEats Food Delivery Platform setup completed!"
echo ""
echo "📋 Next steps:"
echo "1. Run 'npm install' to install dependencies"
echo "2. Run 'npm run docker:up' to start infrastructure"
echo "3. Run 'npm run dev' to start all services"
echo ""
echo "🔗 Service URLs:"
echo "- Auth Service: http://localhost:3001"
echo "- User Service: http://localhost:3002"
echo "- Restaurant Service: http://localhost:3003"
echo "- Order Service: http://localhost:3004"
echo "- Delivery Service: http://localhost:3005"
echo "- Notification Service: http://localhost:3006"
echo "- Payment Service: http://localhost:3007"
echo "- Analytics Service: http://localhost:3008"
echo ""
echo "📚 API Documentation will be available at each service's /api/docs endpoint"
