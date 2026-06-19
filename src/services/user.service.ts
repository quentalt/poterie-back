import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { userRepository } from '../repositories/user.repository';
import type {
  User,
  UserPublic,
  CreateUserDto,
  UpdateUserDto,
  LoginDto,
  AuthPayload,
  AuthResponse,
  PaginationParams,
  PaginatedResult,
} from '../types/user.types';

const SALT_ROUNDS = 12;
const JWT_SECRET = process.env.JWT_SECRET ?? 'fallback_secret_change_me';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN ?? '7d';

// Supprime le hash du mot de passe avant d'exposer l'utilisateur
function toPublic(user: User): UserPublic {
  const { password_hash: _, ...publicUser } = user;
  return publicUser as UserPublic;
}

export class UserService {
  // Inscription
  async register(dto: CreateUserDto): Promise<AuthResponse> {
    // Vérifications unicité
    if (await userRepository.emailExists(dto.email)) {
      throw new Error('Cet email est déjà utilisé');
    }
    if (await userRepository.usernameExists(dto.username)) {
      throw new Error('Ce nom d\'utilisateur est déjà pris');
    }

    const password_hash = await bcrypt.hash(dto.password, SALT_ROUNDS);
    const user = await userRepository.create({...dto, password_hash});

    const token = this.generateToken(user);
    return {user: toPublic(user), token};
  }

  // Connexion
  async login(dto: LoginDto): Promise<AuthResponse> {
    const user = await userRepository.findByEmail(dto.email);
    if (!user) {
      throw new Error('Email ou mot de passe incorrect');
    }
    if (!user.is_active) {
      throw new Error('Ce compte est désactivé');
    }

    const isValid = await bcrypt.compare(dto.password, user.password_hash);
    if (!isValid) {
      throw new Error('Email ou mot de passe incorrect');
    }

    const token = this.generateToken(user);
    return {user: toPublic(user), token};
  }

  // Récupère tous les utilisateurs (admin)
  async getAll(params: PaginationParams): Promise<PaginatedResult<UserPublic>> {
    const result = await userRepository.findAll(params);
    return {...result, data: result.data.map(toPublic)};
  }

  // Récupère un utilisateur par ID
  async getById(id: number): Promise<UserPublic> {
    const user = await userRepository.findById(id);
    if (!user) throw new Error('Utilisateur introuvable');
    return toPublic(user);
  }

  // Met à jour un utilisateur
  async update(id: number, dto: UpdateUserDto, requesterId: number, requesterRole: string): Promise<UserPublic> {
    // Seul l'admin ou l'utilisateur lui-même peut modifier
    if (requesterId !== id && requesterRole !== 'admin') {
      throw new Error('Action non autorisée');
    }

    // Seul l'admin peut changer les rôles
    if (dto.role && requesterRole !== 'admin') {
      throw new Error('Seul un admin peut modifier les rôles');
    }

    if (dto.email && await userRepository.emailExists(dto.email, id)) {
      throw new Error('Cet email est déjà utilisé');
    }
    if (dto.username && await userRepository.usernameExists(dto.username, id)) {
      throw new Error('Ce nom d\'utilisateur est déjà pris');
    }

    const updateData: UpdateUserDto & { password_hash?: string } = {...dto};
    if (dto.password) {
      updateData.password_hash = await bcrypt.hash(dto.password, SALT_ROUNDS);
      delete updateData.password;
    }

    const updated = await userRepository.update(id, updateData);
    if (!updated) throw new Error('Utilisateur introuvable');
    return toPublic(updated);
  }

  // Supprime un utilisateur (admin uniquement)
  async delete(id: number): Promise<void> {
    const deleted = await userRepository.delete(id);
    if (!deleted) throw new Error('Utilisateur introuvable');
  }

  // Génère un JWT
  private generateToken(user: User): string {
    const payload: AuthPayload = {
      userId: user.id,
      email: user.email,
      role: user.role,
    };
    return jwt.sign(payload, JWT_SECRET, {expiresIn: JWT_EXPIRES_IN} as jwt.SignOptions);
  }

  // Vérifie un JWT
  static verifyToken(token: string): AuthPayload {
    return jwt.verify(token, JWT_SECRET) as AuthPayload;
  }

  async deleteSelf(id: number, password: string): Promise<void> {
    const user = await userRepository.findById(id);
    if (!user) throw new Error('Utilisateur introuvable');

    const isValid = await bcrypt.compare(password, user.password_hash);
    if (!isValid) throw new Error('Mot de passe incorrect');

    await userRepository.delete(id);
  }
}

export const userService = new UserService();
