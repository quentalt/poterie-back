import { z } from 'zod';

export const forgotPasswordSchema = z.object({
  email: z.string().email('Email invalide'),
});

export const resetPasswordSchema = z.object({
  email: z.string().email('Email invalide'),

  // Accepte "482913" ou "482 913" (avec espace)
  code: z
    .string()
    .transform((v) => v.replace(/\s/g, ''))
    .pipe(z.string().length(6, 'Le code doit contenir 6 chiffres').regex(/^\d{6}$/, 'Le code doit être numérique')),

  password: z
    .string()
    .min(8, 'Le mot de passe doit faire au moins 8 caractères')
    .regex(/[A-Z]/, 'Au moins une majuscule requise')
    .regex(/[0-9]/, 'Au moins un chiffre requis'),
});
