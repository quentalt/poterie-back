import { neon } from '@neondatabase/serverless';
import * as dotenv from 'dotenv';

dotenv.config();

const sql = neon(process.env.DATABASE_URL!);

async function migrate(): Promise<void> {
  console.log('🔄 Exécution des migrations...\n');

  try {
    // Enum pour les rôles
    await sql`
      DO $$ BEGIN
        CREATE TYPE user_role AS ENUM ('admin', 'user', 'moderator');
      EXCEPTION
        WHEN duplicate_object THEN NULL;
      END $$
    `;
    console.log('✅ Type user_role créé');

    // Table users
    await sql`
      CREATE TABLE IF NOT EXISTS users (
        id            SERIAL PRIMARY KEY,
        email         VARCHAR(255) NOT NULL UNIQUE,
        username      VARCHAR(30)  NOT NULL UNIQUE,
        password_hash TEXT         NOT NULL,
        role          user_role    NOT NULL DEFAULT 'user',
        is_active     BOOLEAN      NOT NULL DEFAULT true,
        created_at    TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
        updated_at    TIMESTAMPTZ  NOT NULL DEFAULT NOW()
      )
    `;
    console.log('✅ Table users créée');

    // Index sur email et username pour les lookups rapides
    await sql`CREATE INDEX IF NOT EXISTS idx_users_email    ON users(email)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_users_username ON users(username)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_users_role     ON users(role)`;
    console.log('✅ Index créés');

    console.log('\n🎉 Migrations terminées avec succès !');
  } catch (error) {
    console.error('❌ Erreur migration:', error);
    process.exit(1);
  }
}

migrate();
