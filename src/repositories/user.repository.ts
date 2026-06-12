import { sql } from '../config/database';
import type {
  User,
  CreateUserDto,
  UpdateUserDto,
  PaginationParams,
  PaginatedResult,
} from '../types/user.types';

export class UserRepository {
  // Récupère tous les utilisateurs avec pagination
  async findAll(params: PaginationParams = {}): Promise<PaginatedResult<User>> {
    const page = Math.max(1, params.page ?? 1);
    const limit = Math.min(100, Math.max(1, params.limit ?? 10));
    const offset = (page - 1) * limit;

    const [users, countResult] = await Promise.all([
      sql`
        SELECT * FROM users
        ORDER BY created_at DESC
        LIMIT ${limit} OFFSET ${offset}
      `,
      sql`SELECT COUNT(*)::int AS total FROM users`,
    ]);

    const total = (countResult[0] as { total: number }).total;

    return {
      data: users as User[],
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  // Trouve un utilisateur par ID
  async findById(id: number): Promise<User | null> {
    const rows = await sql`
      SELECT * FROM users WHERE id = ${id} LIMIT 1
    `;
    return (rows[0] as User) ?? null;
  }

  // Trouve un utilisateur par email
  async findByEmail(email: string): Promise<User | null> {
    const rows = await sql`
      SELECT * FROM users WHERE email = ${email.toLowerCase()} LIMIT 1
    `;
    return (rows[0] as User) ?? null;
  }

  // Trouve un utilisateur par username
  async findByUsername(username: string): Promise<User | null> {
    const rows = await sql`
      SELECT * FROM users WHERE username = ${username} LIMIT 1
    `;
    return (rows[0] as User) ?? null;
  }

  // Crée un nouvel utilisateur
  async create(dto: CreateUserDto & { password_hash: string }): Promise<User> {
    const rows = await sql`
      INSERT INTO users (email, username, password_hash, role)
      VALUES (
        ${dto.email.toLowerCase()},
        ${dto.username},
        ${dto.password_hash},
        ${dto.role ?? 'user'}
      )
      RETURNING *
    `;
    return rows[0] as User;
  }

  // Met à jour un utilisateur
  async update(id: number, dto: UpdateUserDto & { password_hash?: string }): Promise<User | null> {
    // On utilise des requêtes conditionnelles en série pour éviter sql.unsafe
    if (dto.email !== undefined) {
      await sql`UPDATE users SET email = ${dto.email.toLowerCase()}, updated_at = NOW() WHERE id = ${id}`;
    }
    if (dto.username !== undefined) {
      await sql`UPDATE users SET username = ${dto.username}, updated_at = NOW() WHERE id = ${id}`;
    }
    if (dto.password_hash !== undefined) {
      await sql`UPDATE users SET password_hash = ${dto.password_hash}, updated_at = NOW() WHERE id = ${id}`;
    }
    if (dto.role !== undefined) {
      await sql`UPDATE users SET role = ${dto.role}, updated_at = NOW() WHERE id = ${id}`;
    }
    if (dto.is_active !== undefined) {
      await sql`UPDATE users SET is_active = ${dto.is_active}, updated_at = NOW() WHERE id = ${id}`;
    }

    return this.findById(id);
  }

  // Supprime un utilisateur
  async delete(id: number): Promise<boolean> {
    const result = await sql`
      DELETE FROM users WHERE id = ${id}
    `;
    return (result as unknown as { rowCount: number }).rowCount > 0;
  }

  // Vérifie si un email existe déjà
  async emailExists(email: string, excludeId?: number): Promise<boolean> {
    const rows = excludeId
      ? await sql`SELECT 1 FROM users WHERE email = ${email.toLowerCase()} AND id != ${excludeId}`
      : await sql`SELECT 1 FROM users WHERE email = ${email.toLowerCase()}`;
    return rows.length > 0;
  }

  // Vérifie si un username existe déjà
  async usernameExists(username: string, excludeId?: number): Promise<boolean> {
    const rows = excludeId
      ? await sql`SELECT 1 FROM users WHERE username = ${username} AND id != ${excludeId}`
      : await sql`SELECT 1 FROM users WHERE username = ${username}`;
    return rows.length > 0;
  }
}

export const userRepository = new UserRepository();
