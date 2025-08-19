import { IsEmail, IsNotEmpty, MinLength, IsOptional, IsString, IsNumber, IsUUID, IsObject, IsEnum } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class DriverLocationDto {
  @ApiProperty({
    description: 'Driver ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsUUID()
  @IsNotEmpty()
  driverId: string;

  @ApiPropertyOptional({
    description: 'Order ID (if driver is on delivery)',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsOptional()
  @IsUUID()
  orderId?: string;

  @ApiProperty({
    description: 'Latitude coordinate',
    example: 19.076,
  })
  @IsNumber()
  latitude: number;

  @ApiProperty({
    description: 'Longitude coordinate',
    example: 72.8777,
  })
  @IsNumber()
  longitude: number;

  @ApiPropertyOptional({
    description: 'GPS accuracy in meters',
    example: 5.0,
  })
  @IsOptional()
  @IsNumber()
  accuracy?: number;

  @ApiPropertyOptional({
    description: 'Speed in meters per second',
    example: 10.5,
  })
  @IsOptional()
  @IsNumber()
  speed?: number;

  @ApiPropertyOptional({
    description: 'Heading in degrees (0-360)',
    example: 180.0,
  })
  @IsOptional()
  @IsNumber()
  heading?: number;

  @ApiPropertyOptional({
    description: 'Altitude in meters',
    example: 50.0,
  })
  @IsOptional()
  @IsNumber()
  altitude?: number;

  @ApiPropertyOptional({
    description: 'Driver status',
    example: 'delivery',
    enum: ['idle', 'pickup', 'delivery', 'offline'],
  })
  @IsOptional()
  @IsEnum(['idle', 'pickup', 'delivery', 'offline'])
  status?: string;

  @ApiPropertyOptional({
    description: 'Human-readable address',
    example: 'Mumbai, Maharashtra, India',
  })
  @IsOptional()
  @IsString()
  address?: string;

  @ApiPropertyOptional({
    description: 'Additional metadata',
    example: { batteryLevel: 85, signalStrength: 'good' },
  })
  @IsOptional()
  @IsObject()
  metadata?: Record<string, any>;
}

export class AnalyticsEventDto {
  @ApiProperty({
    description: 'Event type',
    example: 'order_created',
  })
  @IsString()
  @IsNotEmpty()
  eventType: string;

  @ApiProperty({
    description: 'Entity type',
    example: 'order',
  })
  @IsString()
  @IsNotEmpty()
  entityType: string;

  @ApiProperty({
    description: 'Entity ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsUUID()
  @IsNotEmpty()
  entityId: string;

  @ApiProperty({
    description: 'Event data',
    example: { orderAmount: 500, restaurantId: 'rest-123' },
  })
  @IsObject()
  data: Record<string, any>;

  @ApiPropertyOptional({
    description: 'Additional metadata',
    example: { userId: 'user-123', sessionId: 'session-456' },
  })
  @IsOptional()
  @IsObject()
  metadata?: Record<string, any>;

  @ApiPropertyOptional({
    description: 'Event source',
    example: 'api',
    enum: ['api', 'webhook', 'system', 'simulator'],
  })
  @IsOptional()
  @IsEnum(['api', 'webhook', 'system', 'simulator'])
  source?: string;

  @ApiPropertyOptional({
    description: 'Event version',
    example: '1.0',
  })
  @IsOptional()
  @IsString()
  version?: string;
}

export class DriverTrackingQueryDto {
  @ApiProperty({
    description: 'Driver ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsUUID()
  @IsNotEmpty()
  driverId: string;

  @ApiPropertyOptional({
    description: 'Start time (ISO string)',
    example: '2024-01-01T00:00:00Z',
  })
  @IsOptional()
  @IsString()
  startTime?: string;

  @ApiPropertyOptional({
    description: 'End time (ISO string)',
    example: '2024-01-01T23:59:59Z',
  })
  @IsOptional()
  @IsString()
  endTime?: string;

  @ApiPropertyOptional({
    description: 'Limit number of records',
    example: 100,
  })
  @IsOptional()
  @IsNumber()
  limit?: number;
}

export class AnalyticsQueryDto {
  @ApiPropertyOptional({
    description: 'Event type filter',
    example: 'order_created',
  })
  @IsOptional()
  @IsString()
  eventType?: string;

  @ApiPropertyOptional({
    description: 'Entity type filter',
    example: 'order',
  })
  @IsOptional()
  @IsString()
  entityType?: string;

  @ApiPropertyOptional({
    description: 'Entity ID filter',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsOptional()
  @IsUUID()
  entityId?: string;

  @ApiPropertyOptional({
    description: 'Start time (ISO string)',
    example: '2024-01-01T00:00:00Z',
  })
  @IsOptional()
  @IsString()
  startTime?: string;

  @ApiPropertyOptional({
    description: 'End time (ISO string)',
    example: '2024-01-01T23:59:59Z',
  })
  @IsOptional()
  @IsString()
  endTime?: string;

  @ApiPropertyOptional({
    description: 'Page number',
    example: 1,
  })
  @IsOptional()
  @IsNumber()
  page?: number;

  @ApiPropertyOptional({
    description: 'Page size',
    example: 50,
  })
  @IsOptional()
  @IsNumber()
  pageSize?: number;
}

export class RealTimeMetricsDto {
  @ApiProperty({
    description: 'Total active drivers',
    example: 150,
  })
  activeDrivers: number;

  @ApiProperty({
    description: 'Total active orders',
    example: 75,
  })
  activeOrders: number;

  @ApiProperty({
    description: 'Orders per minute',
    example: 25,
  })
  ordersPerMinute: number;

  @ApiProperty({
    description: 'Average delivery time in minutes',
    example: 32.5,
  })
  averageDeliveryTime: number;

  @ApiProperty({
    description: 'System health status',
    example: 'healthy',
  })
  systemHealth: string;

  @ApiProperty({
    description: 'Last updated timestamp',
    example: '2024-01-01T12:00:00Z',
  })
  lastUpdated: string;
}

export class DriverSimulationDto {
  @ApiProperty({
    description: 'Number of drivers to simulate',
    example: 50,
  })
  @IsNumber()
  driverCount: number;

  @ApiProperty({
    description: 'Simulation duration in minutes',
    example: 30,
  })
  @IsNumber()
  durationMinutes: number;

  @ApiPropertyOptional({
    description: 'Update frequency in seconds',
    example: 5,
  })
  @IsOptional()
  @IsNumber()
  updateFrequency?: number;

  @ApiPropertyOptional({
    description: 'Geographic bounds for simulation',
    example: {
      north: 19.2,
      south: 18.9,
      east: 73.0,
      west: 72.8,
    },
  })
  @IsOptional()
  @IsObject()
  bounds?: {
    north: number;
    south: number;
    east: number;
    west: number;
  };
}

export class OrderSimulationDto {
  @ApiProperty({
    description: 'Number of orders to simulate per minute',
    example: 500,
  })
  @IsNumber()
  ordersPerMinute: number;

  @ApiProperty({
    description: 'Simulation duration in minutes',
    example: 10,
  })
  @IsNumber()
  durationMinutes: number;

  @ApiPropertyOptional({
    description: 'Restaurant IDs to use for simulation',
    example: ['rest-1', 'rest-2', 'rest-3'],
  })
  @IsOptional()
  @IsString({ each: true })
  restaurantIds?: string[];

  @ApiPropertyOptional({
    description: 'User IDs to use for simulation',
    example: ['user-1', 'user-2', 'user-3'],
  })
  @IsOptional()
  @IsString({ each: true })
  userIds?: string[];
}
