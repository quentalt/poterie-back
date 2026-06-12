import { z } from 'zod';
import type { Request, Response, NextFunction } from 'express';

// Schémas de validation
export const registerSchema = z.object({
  email: z.string().email('Email invalide'),
  username: z
    .string()
    .min(3, 'Le username doit faire au moins 3 caractères')
    .max(30, 'Le username ne peut pas dépasser 30 caractères')
    .regex(/^[a-zA-Z0-9_-]+$/, 'Seuls les lettres, chiffres, _ et - sont autorisés'),
  password: z
    .string()
    .min(8, 'Le mot de passe doit faire au moins 8 caractères')
    .regex(/[A-Z]/, 'Au moins une majuscule requise')
    .regex(/[0-9]/, 'Au moins un chiffre requis'),
  role: z.enum(['admin', 'user', 'moderator']).optional(),
});

export const loginSchema = z.object({
  email: z.string().email('Email invalide'),
  password: z.string().min(1, 'Mot de passe requis'),
});

export const updateUserSchema = z.object({
  email: z.string().email('Email invalide').optional(),
  username: z
    .string()
    .min(3)
    .max(30)
    .regex(/^[a-zA-Z0-9_-]+$/)
    .optional(),
  password: z.string().min(8).regex(/[A-Z]/).regex(/[0-9]/).optional(),
  role: z.enum(['admin', 'user', 'moderator']).optional(),
  is_active: z.boolean().optional(),
}).refine((data) => Object.keys(data).length > 0, {
  message: 'Au moins un champ doit être fourni',
});

// Factory middleware de validation
export function validate<T>(schema: z.ZodSchema<T>) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      res.status(400).json({
        error: 'Données invalides',
        details: result.error.errors.map((e) => ({
          field: e.path.join('.'),
          message: e.message,
        })),
      });
      return;
    }
    req.body = result.data;
    next();
  };
}
