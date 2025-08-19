// Shared interfaces
export interface AuthUser {
  id: string;
  email: string;
  roles: string[];
}

export interface OrderEvent {
  type: string;
  orderId: string;
  data?: any;
  timestamp: Date;
}
