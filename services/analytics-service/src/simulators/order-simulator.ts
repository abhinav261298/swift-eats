import { Logger } from '@nestjs/common';

export interface OrderSimulationData {
  orderId: string;
  userId: string;
  restaurantId: string;
  items: Array<{
    menuItemId: string;
    name: string;
    quantity: number;
    unitPrice: number;
  }>;
  totalAmount: number;
  deliveryAddress: string;
  status: string;
  createdAt: Date;
  estimatedDeliveryTime: Date;
}

export class OrderSimulator {
  private readonly logger = new Logger(OrderSimulator.name);
  private orders: Map<string, OrderSimulationData> = new Map();
  private isRunning = false;
  private interval: NodeJS.Timeout | null = null;
  private orderCounter = 1;

  // Sample data for realistic simulation
  private readonly SAMPLE_USERS = [
    'user_001', 'user_002', 'user_003', 'user_004', 'user_005',
    'user_006', 'user_007', 'user_008', 'user_009', 'user_010'
  ];

  private readonly SAMPLE_RESTAURANTS = [
    'restaurant_001', 'restaurant_002', 'restaurant_003', 'restaurant_004', 'restaurant_005'
  ];

  private readonly SAMPLE_MENU_ITEMS = [
    { id: 'item_001', name: 'Butter Chicken', price: 350 },
    { id: 'item_002', name: 'Biryani', price: 280 },
    { id: 'item_003', name: 'Pizza Margherita', price: 450 },
    { id: 'item_004', name: 'Burger', price: 200 },
    { id: 'item_005', name: 'Pasta', price: 320 },
    { id: 'item_006', name: 'Sushi Roll', price: 380 },
    { id: 'item_007', name: 'Noodles', price: 250 },
    { id: 'item_008', name: 'Salad', price: 180 },
    { id: 'item_009', name: 'Ice Cream', price: 120 },
    { id: 'item_010', name: 'Coffee', price: 80 }
  ];

  private readonly SAMPLE_ADDRESSES = [
    'Andheri West, Mumbai',
    'Bandra East, Mumbai',
    'Juhu, Mumbai',
    'Powai, Mumbai',
    'Worli, Mumbai',
    'Colaba, Mumbai',
    'BKC, Mumbai',
    'Lower Parel, Mumbai',
    'Dadar West, Mumbai',
    'Chembur, Mumbai'
  ];

  private readonly ORDER_STATUSES = ['pending', 'confirmed', 'preparing', 'ready', 'picked_up', 'delivered', 'cancelled'];

  constructor(
    private readonly onOrderCreated: (order: OrderSimulationData) => void,
    private readonly onOrderStatusUpdate: (orderId: string, status: string) => void,
    private readonly ordersPerMinute: number = 10, // 10 orders per minute for testing
    private readonly updateInterval: number = 6000 // 6 seconds per order
  ) {}

  start(): void {
    if (this.isRunning) {
      this.logger.warn('Order simulator is already running');
      return;
    }

    this.logger.log(`Starting order simulator with ${this.ordersPerMinute} orders per minute`);
    this.isRunning = true;

    // Start order generation
    this.interval = setInterval(() => {
      this.generateOrder();
    }, this.updateInterval);
  }

  stop(): void {
    if (!this.isRunning) {
      this.logger.warn('Order simulator is not running');
      return;
    }

    this.logger.log('Stopping order simulator');
    this.isRunning = false;

    if (this.interval) {
      clearInterval(this.interval);
      this.interval = null;
    }

    this.orders.clear();
  }

  private generateOrder(): void {
    const orderId = `order_${this.orderCounter.toString().padStart(6, '0')}`;
    const userId = this.SAMPLE_USERS[Math.floor(Math.random() * this.SAMPLE_USERS.length)];
    const restaurantId = this.SAMPLE_RESTAURANTS[Math.floor(Math.random() * this.SAMPLE_RESTAURANTS.length)];
    
    // Generate random items
    const itemCount = 1 + Math.floor(Math.random() * 4); // 1-4 items per order
    const items = [];
    let totalAmount = 0;

    for (let i = 0; i < itemCount; i++) {
      const menuItem = this.SAMPLE_MENU_ITEMS[Math.floor(Math.random() * this.SAMPLE_MENU_ITEMS.length)];
      const quantity = 1 + Math.floor(Math.random() * 3); // 1-3 quantity
      const itemTotal = menuItem.price * quantity;
      
      items.push({
        menuItemId: menuItem.id,
        name: menuItem.name,
        quantity,
        unitPrice: menuItem.price,
      });
      
      totalAmount += itemTotal;
    }

    const order: OrderSimulationData = {
      orderId,
      userId,
      restaurantId,
      items,
      totalAmount,
      deliveryAddress: this.SAMPLE_ADDRESSES[Math.floor(Math.random() * this.SAMPLE_ADDRESSES.length)],
      status: 'pending',
      createdAt: new Date(),
      estimatedDeliveryTime: new Date(Date.now() + 30 * 60 * 1000), // 30 minutes from now
    };

    this.orders.set(orderId, order);
    this.orderCounter++;

    // Notify about new order
    this.onOrderCreated(order);

    // Simulate order status progression
    this.simulateOrderProgression(orderId);

    this.logger.debug(`Generated order: ${orderId} with ${items.length} items, total: ₹${totalAmount}`);
  }

  private simulateOrderProgression(orderId: string): void {
    const order = this.orders.get(orderId);
    if (!order) return;

    const statusProgression = [
      { status: 'confirmed', delay: 5000 }, // 5 seconds
      { status: 'preparing', delay: 15000 }, // 15 seconds
      { status: 'ready', delay: 10000 }, // 10 seconds
      { status: 'picked_up', delay: 5000 }, // 5 seconds
      { status: 'delivered', delay: 20000 }, // 20 seconds
    ];

    let currentIndex = 0;

    const progressOrder = () => {
      if (currentIndex < statusProgression.length) {
        const { status, delay } = statusProgression[currentIndex];
        
        setTimeout(() => {
          if (this.orders.has(orderId)) {
            const updatedOrder = this.orders.get(orderId)!;
            updatedOrder.status = status;
            this.orders.set(orderId, updatedOrder);
            
            this.onOrderStatusUpdate(orderId, status);
            this.logger.debug(`Order ${orderId} status updated to: ${status}`);
            
            currentIndex++;
            progressOrder();
          }
        }, delay);
      }
    };

    progressOrder();
  }

  getOrderCount(): number {
    return this.orders.size;
  }

  getOrder(orderId: string): OrderSimulationData | undefined {
    return this.orders.get(orderId);
  }

  getAllOrders(): OrderSimulationData[] {
    return Array.from(this.orders.values());
  }

  getOrdersByStatus(status: string): OrderSimulationData[] {
    return Array.from(this.orders.values()).filter(order => order.status === status);
  }

  getOrdersByRestaurant(restaurantId: string): OrderSimulationData[] {
    return Array.from(this.orders.values()).filter(order => order.restaurantId === restaurantId);
  }

  getOrdersByUser(userId: string): OrderSimulationData[] {
    return Array.from(this.orders.values()).filter(order => order.userId === userId);
  }

  getTotalRevenue(): number {
    return Array.from(this.orders.values())
      .filter(order => order.status === 'delivered')
      .reduce((total, order) => total + order.totalAmount, 0);
  }

  getAverageOrderValue(): number {
    const deliveredOrders = Array.from(this.orders.values()).filter(order => order.status === 'delivered');
    if (deliveredOrders.length === 0) return 0;
    
    const totalRevenue = deliveredOrders.reduce((total, order) => total + order.totalAmount, 0);
    return totalRevenue / deliveredOrders.length;
  }

  isSimulatorRunning(): boolean {
    return this.isRunning;
  }

  // Generate a batch of orders for load testing
  generateBatch(count: number): OrderSimulationData[] {
    const orders: OrderSimulationData[] = [];
    
    for (let i = 0; i < count; i++) {
      const orderId = `batch_order_${Date.now()}_${i}`;
      const userId = this.SAMPLE_USERS[Math.floor(Math.random() * this.SAMPLE_USERS.length)];
      const restaurantId = this.SAMPLE_RESTAURANTS[Math.floor(Math.random() * this.SAMPLE_RESTAURANTS.length)];
      
      const itemCount = 1 + Math.floor(Math.random() * 3);
      const items = [];
      let totalAmount = 0;

      for (let j = 0; j < itemCount; j++) {
        const menuItem = this.SAMPLE_MENU_ITEMS[Math.floor(Math.random() * this.SAMPLE_MENU_ITEMS.length)];
        const quantity = 1 + Math.floor(Math.random() * 2);
        const itemTotal = menuItem.price * quantity;
        
        items.push({
          menuItemId: menuItem.id,
          name: menuItem.name,
          quantity,
          unitPrice: menuItem.price,
        });
        
        totalAmount += itemTotal;
      }

      const order: OrderSimulationData = {
        orderId,
        userId,
        restaurantId,
        items,
        totalAmount,
        deliveryAddress: this.SAMPLE_ADDRESSES[Math.floor(Math.random() * this.SAMPLE_ADDRESSES.length)],
        status: 'pending',
        createdAt: new Date(),
        estimatedDeliveryTime: new Date(Date.now() + 30 * 60 * 1000),
      };

      orders.push(order);
      this.orders.set(orderId, order);
    }

    this.logger.log(`Generated batch of ${count} orders`);
    return orders;
  }
}
