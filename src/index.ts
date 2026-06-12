import express from 'express';
import cors from 'cors';
import * as dotenv from 'dotenv';
import { testConnection } from './config/database';
import routes from './routes';

dotenv.config();

const app = express();
const PORT = process.env.PORT ?? 3000;

// ── Middlewares globaux ────────────────────────────────────────
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ── Healthcheck ────────────────────────────────────────────────
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// ── API Routes ─────────────────────────────────────────────────
app.use('/api/v1', routes);

// ── 404 handler ────────────────────────────────────────────────
app.use((_req, res) => {
  res.status(404).json({ error: 'Route introuvable' });
});

// ── Démarrage ──────────────────────────────────────────────────
async function bootstrap(): Promise<void> {
  try {
    await testConnection();
    app.listen(PORT, () => {
      console.log(`\n🚀 Serveur démarré sur http://localhost:${PORT}`);
      console.log(`📌 API disponible sur http://localhost:${PORT}/api/v1`);
      console.log(`💚 Healthcheck : http://localhost:${PORT}/health\n`);
    });
  } catch {
    console.error('Impossible de démarrer le serveur');
    process.exit(1);
  }
}

bootstrap();
