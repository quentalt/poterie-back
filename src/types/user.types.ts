export interface User {
  id: number;
  email: string;
  username: string;
  password_hash: string;
  role: UserRole;
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
}

export type UserRole = 'admin' | 'user' | 'moderator';

export interface UserPublic {
  id: number;
  email: string;
  username: string;
  role: UserRole;
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface CreateUserDto {
  email: string;
  username: string;
  password: string;
  role?: UserRole;
}

export interface UpdateUserDto {
  email?: string;
  username?: string;
  password?: string;
  role?: UserRole;
  is_active?: boolean;
}

export interface LoginDto {
  email: string;
  password: string;
}

export interface AuthPayload {
  userId: number;
  email: string;
  role: UserRole;
}

export interface AuthResponse {
  user: UserPublic;
  token: string;
}

export interface PaginationParams {
  page?: number;
  limit?: number;
}

export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
