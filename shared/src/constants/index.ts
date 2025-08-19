// Shared constants
export const ERROR_MESSAGES = {
  UNKNOWN: 'Unknown error',
  VALIDATION_FAILED: 'Validation failed',
  NOT_FOUND: 'Resource not found',
} as const;

export const SUCCESS_MESSAGES = {
  OK: 'OK',
  ACCEPTED: 'Accepted',
} as const;

export const CACHE_KEYS = {
  DRIVER_LOCATION: 'driver_location:',
  REAL_TIME_METRICS: 'real_time_metrics',
  ACTIVE_DRIVERS_COUNT: 'active_drivers_count',
  ORDERS_PER_MINUTE: 'orders_per_minute',
  AVERAGE_DELIVERY_TIME: 'average_delivery_time',
} as const;

export const CACHE_TTL = {
  DRIVER_LOCATION: 300,
  REAL_TIME_METRICS: 60,
} as const;

export const QUEUES = {
  ORDER_EVENTS: 'order_events',
  PAYMENT_EVENTS: 'payment_events',
  NOTIFICATION_EVENTS: 'notification_events',
  DRIVER_LOCATION: 'driver_location',
} as const;

export const TOPICS = {
  PAYMENT_SUCCESS: 'payment.success',
  PAYMENT_FAILED: 'payment.failed',
  DRIVER_LOCATION: 'driver.location',
  ORDER_EVENTS: 'order.events',
} as const;
