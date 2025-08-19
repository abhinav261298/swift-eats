import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  Index,
} from 'typeorm';
import { IsNotEmpty, IsNumber, IsOptional, IsString, IsUUID } from 'class-validator';

@Entity('driver_locations')
@Index(['driverId', 'timestamp'])
@Index(['latitude', 'longitude'])
@Index(['timestamp'])
export class DriverLocation {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  @IsUUID()
  @IsNotEmpty()
  driverId: string;

  @Column({ type: 'uuid', nullable: true })
  @IsOptional()
  @IsUUID()
  orderId?: string;

  @Column({ type: 'decimal', precision: 10, scale: 8 })
  @IsNumber()
  latitude: number;

  @Column({ type: 'decimal', precision: 11, scale: 8 })
  @IsNumber()
  longitude: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  @IsOptional()
  @IsNumber()
  accuracy?: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  @IsOptional()
  @IsNumber()
  speed?: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  @IsOptional()
  @IsNumber()
  heading?: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  @IsOptional()
  @IsNumber()
  altitude?: number;

  @Column({ type: 'varchar', length: 50, nullable: true })
  @IsOptional()
  @IsString()
  status?: string; // 'idle', 'pickup', 'delivery', 'offline'

  @Column({ type: 'varchar', length: 255, nullable: true })
  @IsOptional()
  @IsString()
  address?: string;

  @Column({ type: 'jsonb', nullable: true })
  @IsOptional()
  metadata?: Record<string, any>;

  @CreateDateColumn({ type: 'timestamp with time zone' })
  timestamp: Date;

  // Business methods
  getLocation(): { latitude: number; longitude: number } {
    return {
      latitude: this.latitude,
      longitude: this.longitude,
    };
  }

  isActive(): boolean {
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
    return this.timestamp > fiveMinutesAgo;
  }

  getSpeedInKmh(): number {
    return this.speed ? this.speed * 3.6 : 0; // Convert m/s to km/h
  }

  isOnDelivery(): boolean {
    return this.status === 'delivery' && !!this.orderId;
  }

  isOnPickup(): boolean {
    return this.status === 'pickup' && !!this.orderId;
  }
}
