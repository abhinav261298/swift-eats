import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EventEmitter2 } from '@nestjs/event-emitter';
// Simplify: temporarily remove Redis dependency for minimal boot
import { DriverLocation, AnalyticsEvent } from '../entities';
import { DriverLocationDto, AnalyticsEventDto, DriverTrackingQueryDto, AnalyticsQueryDto } from '../dto/analytics.dto';
import { AnalyticsGateway } from '../gateways/analytics.gateway';
// Simplify: remove shared utils and constants imports for minimal boot
const logInfo = (...args: any[]) => console.log(...args);
const logError = (error: any, ctx?: string) => console.error(ctx || 'Error', error);
import * as moment from 'moment';

@Injectable()
export class AnalyticsService {
  private readonly logger = new Logger(AnalyticsService.name);

  constructor(
    @InjectRepository(DriverLocation)
    private readonly driverLocationRepository: Repository<DriverLocation>,
    @InjectRepository(AnalyticsEvent)
    private readonly analyticsEventRepository: Repository<AnalyticsEvent>,
    private readonly eventEmitter: EventEmitter2,
    private readonly analyticsGateway: AnalyticsGateway,
  ) {}

  /**
   * Record driver location update
   */
  async recordDriverLocation(locationDto: DriverLocationDto): Promise<DriverLocation> {
    const startTime = Date.now();

    try {
      // Create location record
      const location = this.driverLocationRepository.create({
        ...locationDto,
        timestamp: new Date(),
      });

      // Save to database
      const savedLocation = await this.driverLocationRepository.save(location);

      // Cache current location for fast access
      await this.cacheDriverLocation(locationDto.driverId, savedLocation);

      // Broadcast to WebSocket subscribers
      await this.analyticsGateway.broadcastDriverLocation(locationDto.driverId, locationDto);

      // Emit analytics event
      this.eventEmitter.emit('driver.location_updated', {
        driverId: locationDto.driverId,
        location: savedLocation,
        timestamp: new Date(),
      });

      const processingTime = Date.now() - startTime;
      logInfo(`Driver location recorded in ${processingTime}ms`, {
        driverId: locationDto.driverId,
        processingTime,
      });

      return savedLocation;
    } catch (error) {
      logError(error, 'AnalyticsService.recordDriverLocation');
      throw error;
    }
  }

  /**
   * Get current driver location
   */
  async getCurrentDriverLocation(driverId: string): Promise<DriverLocation | null> {
    try {
      // Try to get from cache first
      // Skipping cache for minimal boot

      // Get from database
      const location = await this.driverLocationRepository.findOne({
        where: { driverId },
        order: { timestamp: 'DESC' },
      });

      if (location) {
        // Skipping cache for minimal boot
      }

      return location;
    } catch (error) {
      logError(error, 'AnalyticsService.getCurrentDriverLocation');
      return null;
    }
  }

  /**
   * Get driver location history
   */
  async getDriverLocationHistory(query: DriverTrackingQueryDto): Promise<DriverLocation[]> {
    try {
      const { driverId, startTime, endTime, limit = 100 } = query;

      const queryBuilder = this.driverLocationRepository
        .createQueryBuilder('location')
        .where('location.driverId = :driverId', { driverId })
        .orderBy('location.timestamp', 'DESC')
        .limit(limit);

      if (startTime) {
        queryBuilder.andWhere('location.timestamp >= :startTime', { startTime: new Date(startTime) });
      }

      if (endTime) {
        queryBuilder.andWhere('location.timestamp <= :endTime', { endTime: new Date(endTime) });
      }

      return await queryBuilder.getMany();
    } catch (error) {
      logError(error, 'AnalyticsService.getDriverLocationHistory');
      return [];
    }
  }

  /**
   * Record analytics event
   */
  async recordAnalyticsEvent(eventDto: AnalyticsEventDto): Promise<AnalyticsEvent> {
    const startTime = Date.now();

    try {
      // Create analytics event
      const event = this.analyticsEventRepository.create({
        ...eventDto,
        timestamp: new Date(),
      });

      // Save to database
      const savedEvent = await this.analyticsEventRepository.save(event);

      // Broadcast to WebSocket subscribers
      await this.analyticsGateway.broadcastAnalyticsEvent(eventDto);

      // Emit event for other services
      this.eventEmitter.emit('analytics.event_recorded', {
        event: savedEvent,
        timestamp: new Date(),
      });

      const processingTime = Date.now() - startTime;
      logInfo(`Analytics event recorded in ${processingTime}ms`, {
        eventType: eventDto.eventType,
        entityType: eventDto.entityType,
        processingTime,
      });

      return savedEvent;
    } catch (error) {
      logError(error, 'AnalyticsService.recordAnalyticsEvent');
      throw error;
    }
  }

  /**
   * Get analytics events with filtering
   */
  async getAnalyticsEvents(query: AnalyticsQueryDto): Promise<{ events: AnalyticsEvent[]; total: number }> {
    try {
      const {
        eventType,
        entityType,
        entityId,
        startTime,
        endTime,
        page = 1,
        pageSize = 50,
      } = query;

      const queryBuilder = this.analyticsEventRepository
        .createQueryBuilder('event')
        .orderBy('event.timestamp', 'DESC');

      if (eventType) {
        queryBuilder.andWhere('event.eventType = :eventType', { eventType });
      }

      if (entityType) {
        queryBuilder.andWhere('event.entityType = :entityType', { entityType });
      }

      if (entityId) {
        queryBuilder.andWhere('event.entityId = :entityId', { entityId });
      }

      if (startTime) {
        queryBuilder.andWhere('event.timestamp >= :startTime', { startTime: new Date(startTime) });
      }

      if (endTime) {
        queryBuilder.andWhere('event.timestamp <= :endTime', { endTime: new Date(endTime) });
      }

      const total = await queryBuilder.getCount();
      const events = await queryBuilder
        .skip((page - 1) * pageSize)
        .take(pageSize)
        .getMany();

      return { events, total };
    } catch (error) {
      logError(error, 'AnalyticsService.getAnalyticsEvents');
      return { events: [], total: 0 };
    }
  }

  /**
   * Get order tracking information
   */
  async getOrderTrackingInfo(orderId: string): Promise<any> {
    try {
      // Get order events
      const orderEvents = await this.analyticsEventRepository.find({
        where: { entityType: 'order', entityId: orderId },
        order: { timestamp: 'DESC' },
        take: 10,
      });

      // Get driver location if order is being delivered
      let driverLocation = null;
      const deliveryEvent = orderEvents.find(event => event.eventType === 'order_assigned_to_driver');
      if (deliveryEvent) {
        const driverId = deliveryEvent.data?.driverId;
        if (driverId) {
          driverLocation = await this.getCurrentDriverLocation(driverId);
        }
      }

      return {
        orderId,
        events: orderEvents,
        driverLocation,
        lastUpdated: new Date(),
      };
    } catch (error) {
      logError(error, 'AnalyticsService.getOrderTrackingInfo');
      return null;
    }
  }

  /**
   * Get real-time metrics
   */
  async getRealTimeMetrics(): Promise<any> {
    try {
      const now = new Date();
      const fiveMinutesAgo = new Date(now.getTime() - 5 * 60 * 1000);
      const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);

      // Get active drivers (location update in last 5 minutes)
      const activeDrivers = await this.driverLocationRepository.count({
        where: {
          timestamp: fiveMinutesAgo,
        },
      });

      // Get orders per minute (last hour)
      const orderEvents = await this.analyticsEventRepository.count({
        where: {
          eventType: 'order_created',
          timestamp: oneHourAgo,
        },
      });

      const ordersPerMinute = Math.round(orderEvents / 60);

      // Get average delivery time (last hour)
      const deliveryEvents = await this.analyticsEventRepository.find({
        where: {
          eventType: 'order_delivered',
          timestamp: oneHourAgo,
        },
      });

      let averageDeliveryTime = 0;
      if (deliveryEvents.length > 0) {
        const totalTime = deliveryEvents.reduce((sum, event) => {
          const createdTime = event.data?.createdAt;
          const deliveredTime = event.timestamp;
          if (createdTime && deliveredTime) {
            return sum + (deliveredTime.getTime() - new Date(createdTime).getTime());
          }
          return sum;
        }, 0);
        averageDeliveryTime = Math.round(totalTime / deliveryEvents.length / (1000 * 60)); // Convert to minutes
      }

      return {
        activeDrivers,
        activeOrders: ordersPerMinute * 30, // Estimate based on orders per minute
        ordersPerMinute,
        averageDeliveryTime,
        systemHealth: 'healthy',
        lastUpdated: now,
      };
    } catch (error) {
      logError(error, 'AnalyticsService.getRealTimeMetrics');
      return {
        activeDrivers: 0,
        activeOrders: 0,
        ordersPerMinute: 0,
        averageDeliveryTime: 0,
        systemHealth: 'error',
        lastUpdated: new Date(),
      };
    }
  }

  /**
   * Get performance analytics
   */
  async getPerformanceAnalytics(timeRange: string = '24h'): Promise<any> {
    try {
      const endTime = new Date();
      const startTime = moment().subtract(1, timeRange as any).toDate();

      // Get events count by type
      const eventsByType = await this.analyticsEventRepository
        .createQueryBuilder('event')
        .select('event.eventType', 'eventType')
        .addSelect('COUNT(*)', 'count')
        .where('event.timestamp BETWEEN :startTime AND :endTime', { startTime, endTime })
        .groupBy('event.eventType')
        .getRawMany();

      // Get events count by hour
      const eventsByHour = await this.analyticsEventRepository
        .createQueryBuilder('event')
        .select('EXTRACT(HOUR FROM event.timestamp)', 'hour')
        .addSelect('COUNT(*)', 'count')
        .where('event.timestamp BETWEEN :startTime AND :endTime', { startTime, endTime })
        .groupBy('hour')
        .orderBy('hour', 'ASC')
        .getRawMany();

      return {
        timeRange,
        eventsByType,
        eventsByHour,
        totalEvents: eventsByType.reduce((sum, item) => sum + parseInt(item.count), 0),
        generatedAt: new Date(),
      };
    } catch (error) {
      logError(error, 'AnalyticsService.getPerformanceAnalytics');
      return {
        timeRange,
        eventsByType: [],
        eventsByHour: [],
        totalEvents: 0,
        generatedAt: new Date(),
      };
    }
  }

  /**
   * Cache driver location
   */
  // Cache disabled for minimal boot

  /**
   * Get drivers near a location
   */
  async getDriversNearLocation(
    latitude: number,
    longitude: number,
    radiusKm: number = 5,
    limit: number = 10,
  ): Promise<DriverLocation[]> {
    try {
      // Get all active driver locations
      const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
      const activeLocations = await this.driverLocationRepository
        .createQueryBuilder('location')
        .where('location.timestamp >= :fiveMinutesAgo', { fiveMinutesAgo })
        .getMany();

      // Filter by distance
      const nearbyDrivers = activeLocations
        .map(location => ({
          ...location,
          distance: calculateDistance(
            latitude,
            longitude,
            location.latitude,
            location.longitude,
          ),
        }))
        .filter(driver => driver.distance <= radiusKm)
        .sort((a, b) => a.distance - b.distance)
        .slice(0, limit);

      return nearbyDrivers;
    } catch (error) {
      logError(error, 'AnalyticsService.getDriversNearLocation');
      return [];
    }
  }
}
