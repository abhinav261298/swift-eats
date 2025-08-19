import { Controller, Get, Post, Body } from '@nestjs/common';
import axios from 'axios';

@Controller()
export class PublicController {
  @Get('restaurants')
  async listRestaurants() {
    const url = process.env.RESTAURANT_SERVICE_URL || 'http://localhost:3003';
    try {
      const res = await axios.get(`${url}/api/v1/restaurants`);
      return res.data;
    } catch {
      return { ok: true, items: [] };
    }
  }

  @Post('orders')
  async placeOrder(@Body() _body: any) {
    const url = process.env.ORDER_SERVICE_URL || 'http://localhost:3004';
    const { restaurantId, items } = _body || {};
    const res = await axios.post(`${url}/api/v1/orders`, { restaurantId, items });
    return res.data;
  }

  @Post('login')
  async login(@Body() body: { email: string; password: string }) {
    const url = process.env.AUTH_SERVICE_URL || 'http://localhost:3001';
    const res = await axios.post(`${url}/api/v1/auth/login`, body);
    return res.data;
  }
}


