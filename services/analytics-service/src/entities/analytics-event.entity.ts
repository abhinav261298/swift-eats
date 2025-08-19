import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  Index,
} from 'typeorm';
import { IsNotEmpty, IsOptional, IsString, IsUUID, IsNumber, IsObject } from 'class-validator';

@Entity('analytics_events')
@Index(['eventType', 'timestamp'])
@Index(['entityType', 'entityId'])
@Index(['timestamp'])
export class AnalyticsEvent {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 100 })
  @IsString()
  @IsNotEmpty()
  eventType: string; // 'order_created', 'order_delivered', 'driver_location', 'restaurant_rating', etc.

  @Column({ type: 'varchar', length: 50 })
  @IsString()
  @IsNotEmpty()
  entityType: string; // 'order', 'driver', 'restaurant', 'user', etc.

  @Column({ type: 'uuid' })
  @IsUUID()
  @IsNotEmpty()
  entityId: string;

  @Column({ type: 'jsonb' })
  @IsObject()
  data: Record<string, any>;

  @Column({ type: 'jsonb', nullable: true })
  @IsOptional()
  @IsObject()
  metadata?: Record<string, any>;

  @Column({ type: 'varchar', length: 50, nullable: true })
  @IsOptional()
  @IsString()
  source?: string; // 'api', 'webhook', 'system', 'simulator'

  @Column({ type: 'varchar', length: 50, nullable: true })
  @IsOptional()
  @IsString()
  version?: string;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  @IsOptional()
  @IsNumber()
  processingTime?: number; // in milliseconds

  @CreateDateColumn({ type: 'timestamp with time zone' })
  timestamp: Date;

  // Business methods
  getEventKey(): string {
    return `${this.eventType}:${this.entityType}:${this.entityId}`;
  }

  isRecent(minutes: number = 5): boolean {
    const timeAgo = new Date(Date.now() - minutes * 60 * 1000);
    return this.timestamp > timeAgo;
  }

  getDataValue(key: string): any {
    return this.data?.[key];
  }

  hasMetadata(key: string): boolean {
    return this.metadata && key in this.metadata;
  }

  getMetadataValue(key: string): any {
    return this.metadata?.[key];
  }

  isOrderEvent(): boolean {
    return this.entityType === 'order';
  }

  isDriverEvent(): boolean {
    return this.entityType === 'driver';
  }

  isRestaurantEvent(): boolean {
    return this.entityType === 'restaurant';
  }

  isUserEvent(): boolean {
    return this.entityType === 'user';
  }
}
