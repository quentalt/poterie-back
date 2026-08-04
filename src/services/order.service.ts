import { orderRepository } from '../repositories/order.repository';
import type { CreateOrderDto, Order, PaginationParams, UpdateOrderDto } from '../types/order.types';

export class OrderService {
  async getAll(params: PaginationParams = {}): Promise<{ data: Order[]; total: number; page: number; limit: number; totalPages: number }> {
    return orderRepository.findAll(params.page ?? 1, params.limit ?? 10);
  }

  async getById(id: number): Promise<Order> {
    const order = await orderRepository.findById(id);
    if (!order) throw new Error('Commande introuvable');
    return order;
  }

  async create(dto: CreateOrderDto): Promise<Order> {
    const order = await orderRepository.create({
      ...dto,
      ref: dto.ref?.trim() || `CMD-${Date.now()}`,
    });
    return order;
  }

  async update(id: number, dto: UpdateOrderDto): Promise<Order> {
    const order = await orderRepository.update(id, dto);
    if (!order) throw new Error('Commande introuvable');
    return order;
  }

  async delete(id: number): Promise<void> {
    const deleted = await orderRepository.delete(id);
    if (!deleted) throw new Error('Commande introuvable');
  }
}

export const orderService = new OrderService();
