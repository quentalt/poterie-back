import { neon } from '@neondatabase/serverless';
import bcrypt from 'bcryptjs';
import * as dotenv from 'dotenv';

dotenv.config();

const sql = neon(process.env.DATABASE_URL!);

async function seed(): Promise<void> {
  console.log('🌱 Seed de la base de données...\n');

  const adminHash = await bcrypt.hash('Admin123!', 12);
  const userHash  = await bcrypt.hash('User1234!', 12);

  try {
    // Supprime les données existantes
    await sql`DELETE FROM users`;

    const users = await sql`
      INSERT INTO users (email, username, password_hash, role) VALUES
        ('admin@example.com',   'admin_user',  ${adminHash}, 'admin'),
        ('john@example.com',    'john_doe',    ${userHash},  'user'),
        ('jane@example.com',    'jane_smith',  ${userHash},  'user'),
        ('mod@example.com',     'moderator1',  ${userHash},  'moderator')
      RETURNING id, email, username, role
    `;

    console.log('✅ Utilisateurs créés :');
    users.forEach((u) => {
      console.log(`   [${u.role.padEnd(9)}] ${u.username} — ${u.email}`);
    });

    console.log('\n🔑 Mots de passe par défaut :');
    console.log('   admin   → Admin123!');
    console.log('   autres  → User1234!');
    console.log('\n🎉 Seed terminé !');
  } catch (error) {
    console.error('❌ Erreur seed:', error);
    process.exit(1);
  }
}

seed();
