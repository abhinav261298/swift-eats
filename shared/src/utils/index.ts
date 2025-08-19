// Shared utilities
import { randomUUID } from 'crypto';

export function createSuccessResponse<T>(data: T, message?: string) {
  return { success: true, data, message };
}

export function createErrorResponse(message: string, details?: any) {
  return { success: false, message, details };
}

export function generateUUID(): string {
  return randomUUID();
}

export function logInfo(message: string, meta?: any): void {
  // eslint-disable-next-line no-console
  console.log(message, meta || '');
}

export function logError(error: any, context?: string): void {
  // eslint-disable-next-line no-console
  console.error(context || 'Error', error);
}

export function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Haversine distance in km
export function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const R = 6371;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round((R * c) * 1000) / 1000;
}

export async function withRetry<T>(fn: () => Promise<T>, retries = 3, delayMs = 200): Promise<T> {
  let attempt = 0;
  while (true) {
    try {
      return await fn();
    } catch (e) {
      attempt++;
      if (attempt > retries) throw e;
      await sleep(delayMs);
    }
  }
}
