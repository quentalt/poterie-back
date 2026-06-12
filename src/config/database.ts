import { neon, neonConfig } from '@neondatabase/serverless';
import * as dotenv from 'dotenv';

dotenv.config();

// Optimise les requêtes en mode serverless
neonConfig.fetchConnectionCache = true;

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  throw new Error('DATABASE_URL est requis. Vérifiez votre fichier .env');
}

export const sql = neon(DATABASE_URL);

// Test de connexion
export async function testConnection(): Promise<void> {
  try {
    const result = await sql`SELECT version()`;
    console.log('✅ Connexion Neon DB réussie');
    console.log(`   PostgreSQL: ${(result[0] as { version: string }).version.split(' ').slice(0, 2).join(' ')}`);
  } catch (error) {
    console.error('❌ Erreur de connexion Neon DB:', error);
    throw error;
  }
}
