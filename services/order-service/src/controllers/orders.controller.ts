import { Body, Controller, Get, Param, Post, Patch } from '@nestjs/common';
import { OrdersService } from '../services/orders.service';
import { RabbitMQPublisher } from '../services/rabbitmq.publisher';

type OrderItem = { itemId: string; name: string; quantity: number; price: number };
type Order = { id: string; restaurantId: string; items: OrderItem[]; total: number; status: string };

@Controller('orders')
export class OrdersController {
  constructor(
    private readonly ordersService: OrdersService,
    private readonly publisher: RabbitMQPublisher,
  ) {}
  @Post()
  async create(@Body() body: { restaurantId: string; items: OrderItem[] }) {
    const order = await this.ordersService.createOrder(body.restaurantId, body.items as any);
    await this.publisher.publishOrderPlaced({ type: 'OrderPlaced', orderId: order.id, restaurantId: order.restaurantId, total: order.total });
    return order;
  }

  @Get(':id')
  get(@Param('id') id: string) {
    return this.ordersService.findById(id);
  }

  @Patch(':id/status')
  updateStatus(
    @Param('id') id: string,
    @Body() body: { status: string },
  ) {
    return this.ordersService.updateStatus(id, body.status);
  }
}


