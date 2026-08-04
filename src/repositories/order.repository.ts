import { sql } from '../config/database';
import type { CreateOrderDto, Order, UpdateOrderDto } from '../types/order.types';

export class OrderRepository {
  async findAll(page = 1, limit = 10): Promise<{ data: Order[]; total: number; page: number; limit: number; totalPages: number }> {
    const offset = (Math.max(1, page) - 1) * limit;

    const [orders, countResult] = await Promise.all([
      sql`
        SELECT * FROM orders
        ORDER BY created_at DESC
        LIMIT ${limit} OFFSET ${offset}
      `,
      sql`SELECT COUNT(*)::int AS total FROM orders`,
    ]);

    const total = (countResult[0] as { total: number }).total;

    return {
      data: orders as Order[],
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findById(id: number): Promise<Order | null> {
    const rows = await sql`
      SELECT * FROM orders WHERE id = ${id} LIMIT 1
    `;
    return (rows[0] as Order) ?? null;
  }

  async create(dto: CreateOrderDto): Promise<Order> {
    const rows = await sql`
      INSERT INTO orders (ref, client_name, client_email, piece, amount, status)
      VALUES (
        ${dto.ref},
        ${dto.client_name},
        ${dto.client_email},
        ${dto.piece},
        ${dto.amount},
        ${dto.status ?? 'pending'}
      )
      RETURNING *
    `;

    return rows[0] as Order;
  }

  async update(id: number, dto: UpdateOrderDto): Promise<Order | null> {
    const existing = await this.findById(id);
    if (!existing) return null;

    const newRef = dto.ref ?? existing.ref;
    const newClientName = dto.client_name ?? existing.client_name;
    const newClientEmail = dto.client_email ?? existing.client_email;
    const newPiece = dto.piece ?? existing.piece;
    const newAmount = dto.amount ?? existing.amount;
    const newStatus = dto.status ?? existing.status;

    await sql`
      UPDATE orders
      SET
        ref = ${newRef},
        client_name = ${newClientName},
        client_email = ${newClientEmail},
        piece = ${newPiece},
        amount = ${newAmount},
        status = ${newStatus},
        updated_at = NOW()
      WHERE id = ${id}
    `;

    return this.findById(id);
  }

  async delete(id: number): Promise<boolean> {
    const result = await sql`
      DELETE FROM orders WHERE id = ${id}
    `;
    return (result as unknown as { rowCount: number }).rowCount > 0;
  }
}

export const orderRepository = new OrderRepository();
