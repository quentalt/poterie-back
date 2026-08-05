import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import { transporter } from '../config/mailer';
import { resetCodeTemplate, passwordChangedTemplate } from '../config/email.templates';
import { passwordResetRepository } from '../repositories/password-reset.repository';
import { userRepository } from '../repositories/user.repository';

const MAIL_USER       = process.env.MAIL_USER!;
const EXPIRES_MINUTES  = 15;
const MAX_ATTEMPTS     = 5;   // Bloque après 5 essais erronés
const SALT_ROUNDS      = 12;

/** Génère un code à 6 chiffres cryptographiquement sûr. */
function generateCode(): string {
  // randomInt(0, 1_000_000) → 0..999999, on padde avec des zéros si nécessaire
  const code = crypto.randomInt(0, 1_000_000).toString().padStart(6, '0');
  return code;
}

/** Formate le code pour l'affichage : "482913" → "482 913" */
function formatCode(code: string): string {
  return `${code.slice(0, 3)} ${code.slice(3)}`;
}

/** Hash SHA-256 du code brut pour le stocker en base. */
function hashCode(code: string): string {
  return crypto.createHash('sha256').update(code).digest('hex');
}

export class PasswordResetService {
  /**
   * ÉTAPE 1 — Demande de reset.
   * Génère un code à 6 chiffres et l'envoie par email.
   * Toujours silencieux si l'email est inconnu (pas de fuite d'info).
   */
  async requestReset(email: string): Promise<void> {
    const user = await userRepository.findByEmail(email);
    if (!user || !user.is_active) return;

    const rawCode  = generateCode();           // "482913"
    const codeHash = hashCode(rawCode);        // SHA-256 stocké en base

    const expiresAt = new Date(Date.now() + EXPIRES_MINUTES * 60 * 1000);
    await passwordResetRepository.create(user.id, codeHash, expiresAt);

    const { subject, html, text } = resetCodeTemplate({
      username: user.username,
      code: formatCode(rawCode),               // "482 913" dans l'email
      expiresInMinutes: EXPIRES_MINUTES,
    });

    await transporter.sendMail({
      from:    `"User Manager" <${MAIL_USER}>`,
      to:      user.email,
      subject,
      html,
      text,
    });
  }

  /**
   * ÉTAPE 2 — Vérification du code + nouveau mot de passe.
   * L'utilisateur soumet : son email, le code recopié, et son nouveau mdp.
   */
  async resetPassword(email: string, rawCode: string, newPassword: string): Promise<void> {
    // Nettoyage : accepte "482 913" ou "482913"
    const cleanCode = rawCode.replace(/\s/g, '');

    if (!/^\d{6}$/.test(cleanCode)) {
      throw new Error('Le code doit contenir exactement 6 chiffres.');
    }

    const user = await userRepository.findByEmail(email);
    if (!user || !user.is_active) {
      throw new Error('Compte introuvable.');
    }

    const record = await passwordResetRepository.findActiveByUserId(user.id);
    if (!record) {
      throw new Error('Aucun code actif. Faites une nouvelle demande.');
    }

    // Protection brute-force : bloque après MAX_ATTEMPTS tentatives
    if (record.attempts >= MAX_ATTEMPTS) {
      throw new Error(
        `Trop de tentatives. Faites une nouvelle demande de réinitialisation.`
      );
    }

    // Comparaison des hashes
    const submittedHash = hashCode(cleanCode);
    if (submittedHash !== record.code_hash) {
      const attempts = await passwordResetRepository.incrementAttempts(record.id);
      const remaining = MAX_ATTEMPTS - attempts;
      throw new Error(
        remaining > 0
          ? `Code incorrect. Il vous reste ${remaining} tentative(s).`
          : `Code incorrect. Trop de tentatives, faites une nouvelle demande.`
      );
    }

    // Code valide — mise à jour du mot de passe + invalidation du code
    const password_hash = await bcrypt.hash(newPassword, SALT_ROUNDS);
    await Promise.all([
      userRepository.update(user.id, { password_hash }),
      passwordResetRepository.markUsed(record.id),
    ]);

    // Email de confirmation
    const { subject, html, text } = passwordChangedTemplate({ username: user.username });
    await transporter.sendMail({
      from: `"User Manager" <${MAIL_USER}>`,
      to:   user.email,
      subject,
      html,
      text,
    });
  }
}

export const passwordResetService = new PasswordResetService();
