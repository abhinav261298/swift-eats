import { Injectable } from '@nestjs/common';
// import { InjectRepository } from '@nestjs/typeorm';
// import { Repository } from 'typeorm';
// import { Order } from '../entities/order.entity';
// import { OrderItem } from '../entities/order-item.entity';

type OrderItemInput = { itemId: string; name: string; quantity: number; price: number };
type Order = { id: string; restaurantId: string; items: OrderItemInput[]; total: number; status: string };

@Injectable()
export class OrdersService {
  private orders: Order[] = [];
  private orderIdCounter = 1;

  // constructor(
  //   @InjectRepository(Order) private readonly ordersRepo: Repository<Order>,
  //   @InjectRepository(OrderItem) private readonly itemsRepo: Repository<OrderItem>,
  // ) {}

  async createOrder(restaurantId: string, items: OrderItemInput[]): Promise<Order> {
    const total = items.reduce((s, it) => s + it.price * it.quantity, 0);
    const order: Order = {
      id: `order-${this.orderIdCounter++}`,
      restaurantId,
      items,
      total,
      status: 'PLACED'
    };
    this.orders.push(order);
    return order;
  }

  async findById(id: string): Promise<Order | null> {
    return this.orders.find(o => o.id === id) || null;
  }

  async updateStatus(id: string, status: string): Promise<Order | null> {
    const order = await this.findById(id);
    if (!order) return null;
    order.status = status;
    return order;
  }
}


