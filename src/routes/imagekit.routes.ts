import { Router } from 'express';
import { imagekitController } from '../controllers/imagekit.controller';
import { authenticate, requireRole } from '../middleware/auth.middleware';
import { upload } from '../middleware/upload.middleware';

const router = Router();

// Toutes les routes images nécessitent d'être connecté
router.use(authenticate);

// ── Authentification (pour upload client-side) ─────────────────
// GET /images/auth → token + signature (30 min)
router.get('/auth', (req, res) => imagekitController.getAuthSignature(req, res));

// ── URL builder (génération à la volée) ───────────────────────
// GET /images/url?path=/ogres-de-la-terre/produits/bol.webp&width=800
router.get('/url', (req, res) => imagekitController.buildUrl(req, res));

// ── Listing ───────────────────────────────────────────────────
// GET /images?folder=products&tags=bol,grès&limit=20&skip=0&search=vase
router.get('/', (req, res) => imagekitController.list(req, res));

// ── Upload serveur (admin / modérateur) ───────────────────────
// POST /images/upload  multipart/form-data  champ: image
router.post(
  '/upload',
  requireRole('admin', 'moderator'),
  upload.single('image'),
  (req, res) => imagekitController.upload(req, res)
);

// ── Détail fichier ────────────────────────────────────────────
// GET /images/:fileId
router.get('/:fileId', (req, res) => imagekitController.getById(req, res));

// ── Suppression unitaire (admin uniquement) ───────────────────
// DELETE /images/:fileId
router.delete(
  '/:fileId',
  requireRole('admin'),
  (req, res) => imagekitController.delete(req, res)
);

// ── Suppression en masse (admin uniquement) ───────────────────
// DELETE /images  body: { fileIds: ["id1", "id2"] }
router.delete(
  '/',
  requireRole('admin'),
  (req, res) => imagekitController.bulkDelete(req, res)
);

export default router;
