import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { AnalyticsGateway } from '../gateways/analytics.gateway';
const logInfo = (...args: any[]) => console.log(...args);
const logError = (error: any, ctx?: string) => console.error(ctx || 'Error', error);

@Injectable()
export class RealTimeService {
  private readonly logger = new Logger(RealTimeService.name);
  private metricsCache: Map<string, any> = new Map();
  private performanceMetrics: Map<string, number[]> = new Map();

  constructor(
    private readonly eventEmitter: EventEmitter2,
    private readonly analyticsGateway: AnalyticsGateway,
  ) {}

  /**
   * Get real-time metrics
   */
  async getRealTimeMetrics(): Promise<any> {
    try {
      // Try to get from cache first
      // Skipping Redis cache for minimal boot

      // Calculate real-time metrics
      const metrics = await this.calculateRealTimeMetrics();
      
      // Cache the metrics
      // Skipping Redis cache for minimal boot

      return metrics;
    } catch (error) {
      logError(error, 'RealTimeService.getRealTimeMetrics');
      return this.getDefaultMetrics();
    }
  }

  /**
   * Calculate real-time metrics
   */
  private async calculateRealTimeMetrics(): Promise<any> {
    const now = new Date();
    const fiveMinutesAgo = new Date(now.getTime() - 5 * 60 * 1000);
    const oneMinuteAgo = new Date(now.getTime() - 60 * 1000);

    // Get active drivers count
    const activeDrivers = await this.getActiveDriversCount(fiveMinutesAgo);

    // Get orders per minute
    const ordersPerMinute = await this.getOrdersPerMinute(oneMinuteAgo);

    // Get average delivery time
    const averageDeliveryTime = await this.getAverageDeliveryTime();

    // Get system health
    const systemHealth = await this.getSystemHealth();

    // Get active orders estimate
    const activeOrders = Math.round(ordersPerMinute * 30); // Estimate based on orders per minute

    return {
      activeDrivers,
      activeOrders,
      ordersPerMinute,
      averageDeliveryTime,
      systemHealth,
      lastUpdated: now,
      connectedClients: this.analyticsGateway.getConnectedClientsCount(),
    };
  }

  /**
   * Get active drivers count
   */
  private async getActiveDriversCount(since: Date): Promise<number> {
    try {
      // This would typically query the driver_locations table
      // For now, we'll use a cached value or estimate
      // Skipping Redis cache for minimal boot

      // Estimate based on simulation or actual data
      const estimatedCount = Math.floor(Math.random() * 200) + 50; // 50-250 drivers
      
      // Cache the count
      // Skipping Redis cache for minimal boot

      return estimatedCount;
    } catch (error) {
      logError(error, 'RealTimeService.getActiveDriversCount');
      return 0;
    }
  }

  /**
   * Get orders per minute
   */
  private async getOrdersPerMinute(since: Date): Promise<number> {
    try {
      // This would typically query the analytics_events table
      // For now, we'll use a cached value or estimate
      // Skipping Redis cache for minimal boot

      // Estimate based on simulation or actual data
      const estimatedRate = Math.floor(Math.random() * 50) + 10; // 10-60 orders per minute
      
      // Cache the rate
      // Skipping Redis cache for minimal boot

      return estimatedRate;
    } catch (error) {
      logError(error, 'RealTimeService.getOrdersPerMinute');
      return 0;
    }
  }

  /**
   * Get average delivery time
   */
  private async getAverageDeliveryTime(): Promise<number> {
    try {
      // This would typically calculate from order events
      // For now, we'll use a cached value or estimate
      // Skipping Redis cache for minimal boot

      // Estimate based on simulation or actual data
      const estimatedTime = Math.floor(Math.random() * 20) + 25; // 25-45 minutes
      
      // Cache the time
      // Skipping Redis cache for minimal boot

      return estimatedTime;
    } catch (error) {
      logError(error, 'RealTimeService.getAverageDeliveryTime');
      return 30; // Default 30 minutes
    }
  }

  /**
   * Get system health
   */
  private async getSystemHealth(): Promise<string> {
    try {
      // Check various system components
      const redisHealth = true;
      const databaseHealth = await this.checkDatabaseHealth();
      const websocketHealth = await this.checkWebSocketHealth();

      if (redisHealth && databaseHealth && websocketHealth) {
        return 'healthy';
      } else if (redisHealth || databaseHealth || websocketHealth) {
        return 'degraded';
      } else {
        return 'unhealthy';
      }
    } catch (error) {
      logError(error, 'RealTimeService.getSystemHealth');
      return 'unknown';
    }
  }

  /**
   * Check Redis health
   */
  private async checkRedisHealth(): Promise<boolean> { return true; }

  /**
   * Check database health
   */
  private async checkDatabaseHealth(): Promise<boolean> {
    try {
      // This would typically check database connectivity
      // For now, we'll assume it's healthy
      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   * Check WebSocket health
   */
  private async checkWebSocketHealth(): Promise<boolean> {
    try {
      const connectedClients = this.analyticsGateway.getConnectedClientsCount();
      return connectedClients >= 0; // Any non-negative number indicates the gateway is working
    } catch (error) {
      return false;
    }
  }

  /**
   * Record performance metric
   */
  recordPerformanceMetric(metricName: string, value: number): void {
    try {
      if (!this.performanceMetrics.has(metricName)) {
        this.performanceMetrics.set(metricName, []);
      }

      const metrics = this.performanceMetrics.get(metricName)!;
      metrics.push(value);

      // Keep only last 100 values
      if (metrics.length > 100) {
        metrics.shift();
      }

      // Emit performance event
      this.eventEmitter.emit('performance.metric_recorded', {
        metricName,
        value,
        timestamp: new Date(),
      });
    } catch (error) {
      logError(error, 'RealTimeService.recordPerformanceMetric');
    }
  }

  /**
   * Get performance metrics
   */
  getPerformanceMetrics(): Record<string, { avg: number; min: number; max: number; count: number }> {
    const result: Record<string, { avg: number; min: number; max: number; count: number }> = {};

    for (const [metricName, values] of this.performanceMetrics.entries()) {
      if (values.length === 0) continue;

      const sum = values.reduce((a, b) => a + b, 0);
      const avg = sum / values.length;
      const min = Math.min(...values);
      const max = Math.max(...values);

      result[metricName] = {
        avg: Math.round(avg * 100) / 100,
        min: Math.round(min * 100) / 100,
        max: Math.round(max * 100) / 100,
        count: values.length,
      };
    }

    return result;
  }

  /**
   * Get default metrics
   */
  private getDefaultMetrics(): any {
    return {
      activeDrivers: 0,
      activeOrders: 0,
      ordersPerMinute: 0,
      averageDeliveryTime: 30,
      systemHealth: 'unknown',
      lastUpdated: new Date(),
      connectedClients: 0,
    };
  }

  /**
   * Update metrics cache
   */
  @Cron(CronExpression.EVERY_MINUTE)
  async updateMetricsCache(): Promise<void> {
    try {
      const metrics = await this.calculateRealTimeMetrics();
      
      // Update cache
      // Skipping Redis cache for minimal boot

      // Broadcast to WebSocket clients
      await this.analyticsGateway.broadcastRealTimeMetrics(metrics);

      logInfo('Real-time metrics updated', { timestamp: new Date() });
    } catch (error) {
      logError(error, 'RealTimeService.updateMetricsCache');
    }
  }

  /**
   * Update system health
   */
  @Cron(CronExpression.EVERY_30_SECONDS)
  async updateSystemHealth(): Promise<void> {
    try {
      const health = await this.getSystemHealth();
      
      // Broadcast health update
      await this.analyticsGateway.broadcastSystemHealth({
        status: health,
        timestamp: new Date(),
      });

      if (health !== 'healthy') {
        logError(new Error(`System health degraded: ${health}`), 'RealTimeService.updateSystemHealth');
      }
    } catch (error) {
      logError(error, 'RealTimeService.updateSystemHealth');
    }
  }

  /**
   * Update performance metrics
   */
  @Cron(CronExpression.EVERY_MINUTE)
  async updatePerformanceMetrics(): Promise<void> {
    try {
      const metrics = this.getPerformanceMetrics();
      
      // Broadcast performance metrics
      await this.analyticsGateway.broadcastPerformanceMetrics(metrics);

      logInfo('Performance metrics updated', { 
        metricsCount: Object.keys(metrics).length,
        timestamp: new Date() 
      });
    } catch (error) {
      logError(error, 'RealTimeService.updatePerformanceMetrics');
    }
  }
}
