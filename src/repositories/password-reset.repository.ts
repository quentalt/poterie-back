import { sql } from '../config/database';
import { PasswordResetCode } from '../types/password-reset.types';

export class PasswordResetRepository {
  async createTable(): Promise<void> {
    await sql`
      CREATE TABLE IF NOT EXISTS password_reset_codes (
        id         SERIAL PRIMARY KEY,
        user_id    INTEGER     NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        code_hash  TEXT        NOT NULL,
        expires_at TIMESTAMPTZ NOT NULL,
        used_at    TIMESTAMPTZ,
        attempts   SMALLINT    NOT NULL DEFAULT 0,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `;
    await sql`CREATE INDEX IF NOT EXISTS idx_prc_user_id   ON password_reset_codes(user_id)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_prc_code_hash ON password_reset_codes(code_hash)`;
  }

  /** Révoque les anciens codes du user puis insère le nouveau. */
  async create(userId: number, codeHash: string, expiresAt: Date): Promise<PasswordResetCode> {
    await sql`
      UPDATE password_reset_codes
      SET used_at = NOW()
      WHERE user_id = ${userId} AND used_at IS NULL
    `;
    const rows = await sql`
      INSERT INTO password_reset_codes (user_id, code_hash, expires_at)
      VALUES (${userId}, ${codeHash}, ${expiresAt.toISOString()})
      RETURNING *
    `;
    return rows[0] as PasswordResetCode;
  }

  /** Cherche le code actif d'un user (non utilisé, non expiré). */
  async findActiveByUserId(userId: number): Promise<PasswordResetCode | null> {
    const rows = await sql`
      SELECT * FROM password_reset_codes
      WHERE user_id  = ${userId}
        AND used_at  IS NULL
        AND expires_at > NOW()
      ORDER BY created_at DESC
      LIMIT 1
    `;
    return (rows[0] as PasswordResetCode) ?? null;
  }

  /** Incrémente le compteur de tentatives échouées. */
  async incrementAttempts(id: number): Promise<number> {
    const rows = await sql`
      UPDATE password_reset_codes
      SET attempts = attempts + 1
      WHERE id = ${id}
      RETURNING attempts
    `;
    return (rows[0] as { attempts: number }).attempts;
  }

  /** Marque le code comme consommé. */
  async markUsed(id: number): Promise<void> {
    await sql`UPDATE password_reset_codes SET used_at = NOW() WHERE id = ${id}`;
  }

  /** Purge les codes expirés (à appeler au démarrage ou en cron). */
  async purgeExpired(): Promise<void> {
    await sql`DELETE FROM password_reset_codes WHERE expires_at < NOW()`;
  }
}

export const passwordResetRepository = new PasswordResetRepository();
