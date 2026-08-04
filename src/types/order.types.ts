export type OrderStatus = 'pending' | 'in_progress' | 'delivered' | 'cancelled';

export interface Order {
  id: number;
  ref: string;
  client_name: string;
  client_email: string;
  piece: string;
  amount: number;
  status: OrderStatus;
  created_at: Date;
  updated_at: Date;
}

export interface CreateOrderDto {
  ref?: string;
  client_name: string;
  client_email: string;
  piece: string;
  amount: number;
  status?: OrderStatus;
}

export interface UpdateOrderDto {
  ref?: string;
  client_name?: string;
  client_email?: string;
  piece?: string;
  amount?: number;
  status?: OrderStatus;
}

export interface PaginationParams {
  page?: number;
  limit?: number;
}
