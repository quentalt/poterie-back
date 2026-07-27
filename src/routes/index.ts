import { Router } from 'express';
import { userController } from '../controllers/user.controller';
import { authenticate } from '../middleware/auth.middleware';
import { validate, registerSchema, loginSchema, forgotPasswordSchema, resetPasswordSchema, updateUserSchema } from '../middleware/validation.middleware';
import imagekitRoutes from "./imagekit.routes";

/**
 * @swagger
 * /api/v1/auth/register:
 *   post:
 *     summary: Créer un compte utilisateur
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, username, password]
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               username:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       201:
 *         description: Compte créé
 */

const router = Router();

// ── Auth (public) ─────────────────────────────────────────────
/**
 * @openapi
 * /api/v1/auth/login:
 *   post:
 *     summary: Se connecter
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password]
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Connexion réussie
 */
router.post('/auth/register', validate(registerSchema), (req, res) => userController.register(req, res));
router.post('/auth/login',    validate(loginSchema),    (req, res) => userController.login(req, res));

/**
 * @swagger
 * /api/v1/auth/forgot-password:
 *   post:
 *     summary: Demander une réinitialisation de mot de passe
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email]
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *     responses:
 *       200:
 *         description: Email de réinitialisation envoyé si le compte existe
 */
/**
 * POST /api/v1/auth/forgot-password
 * Body : { email }
 * Envoie un code à 6 chiffres par email (valable 15 min, 5 essais max).
 */
router.post(
  '/auth/forgot-password',
  validate(forgotPasswordSchema),
  (req, res) => userController.requestReset(req, res)
);

/**
 * @swagger
 * /api/v1/auth/reset-password:
 *   post:
 *     summary: Réinitialiser le mot de passe
 *     tags:
 *       - Password Reset
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - code
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 example: user@gmail.com
 *               code:
 *                 type: string
 *                 example: "482913"
 *               password:
 *                 type: string
 *                 example: NouveauPassword123!
 *     responses:
 *       200:
 *         description: Mot de passe modifié
*/
/**
 * POST /api/v1/auth/reset-password
 * Body : { email, code, password }
 * Vérifie le code et met à jour le mot de passe.
 */
router.post(
  '/auth/reset-password',
  validate(resetPasswordSchema),
  (req, res) => userController.resetPassword(req, res)
);
// ── Utilisateur connecté ───────────────────────────────────────
router.get('/users/me',      authenticate, (req, res) => userController.getMe(req, res));
router.delete('/users/:id', authenticate,  (req, res) => userController.deleteSelf(req, res));
router.patch('/users/:id',   authenticate, validate(updateUserSchema), (req, res) => userController.update(req, res));
router.get('/users',         authenticate, (req, res) => userController.getAll(req, res));

// ── Images (ImageKit) ──────────────────────────────────────────
router.use('/images', imagekitRoutes);

export default router;
