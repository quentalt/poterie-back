import type { Request, Response, NextFunction } from 'express';
import { UserService } from '../services/user.service';
import type { AuthPayload, UserRole } from '../types/user.types';

// Étend le type Request pour y attacher le user authentifié
declare global {
  namespace Express {
    interface Request {
      user?: AuthPayload;
    }
  }
}

// Middleware d'authentification JWT
export function authenticate(req: Request, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;

  if (!authHeader?.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Token manquant ou invalide' });
    return;
  }

  const token = authHeader.split(' ')[1];

  try {
    req.user = UserService.verifyToken(token);
    next();
  } catch {
    res.status(401).json({ error: 'Token expiré ou invalide' });
  }
}

// Middleware de restriction par rôle
export function requireRole(...roles: UserRole[]) {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ error: 'Non authentifié' });
      return;
    }
    if (!roles.includes(req.user.role)) {
      res.status(403).json({ error: 'Permissions insuffisantes' });
      return;
    }
    next();
  };
}
