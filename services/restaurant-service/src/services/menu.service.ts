import { Injectable } from '@nestjs/common';
import Redis from 'ioredis';

@Injectable()
export class MenuService {
  private redis: Redis;
  constructor() {
    const url = process.env.REDIS_URL || 'redis://localhost:6379';
    this.redis = new Redis(url);
  }

  async list(): Promise<any[]> {
    const cached = await this.redis.get('menus:all');
    if (cached) return JSON.parse(cached);
    const data = [
      { id: 'rest1', name: 'Spice Hub', menus: [ { itemId: 'biryani', name: 'Chicken Biryani', price: 250 } ] },
    ];
    await this.redis.set('menus:all', JSON.stringify(data), 'EX', 60);
    return data;
  }
}


