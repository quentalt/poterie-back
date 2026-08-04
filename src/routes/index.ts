import { Router } from 'express';
import { userController } from '../controllers/user.controller';
import { authenticate } from '../middleware/auth.middleware';
import { validate, registerSchema, loginSchema, forgotPasswordSchema, resetPasswordSchema, updateUserSchema } from '../middleware/validation.middleware';
import imagekitRoutes from './imagekit.routes';
import orderRoutes from './order.routes';

const router = Router();

// ── Auth (public) ─────────────────────────────────────────────

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
 *                 example: quentin@example.com
 *               username:
 *                 type: string
 *                 minLength: 3
 *                 maxLength: 30
 *                 example: quentin_dev
 *               password:
 *                 type: string
 *                 description: 8 caractères min, 1 majuscule, 1 chiffre
 *                 example: MonMdp123!
 *     responses:
 *       201:
 *         description: Compte créé avec succès
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AuthResponse'
 *       400:
 *         description: Données invalides ou email/username déjà utilisé
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post('/auth/register', validate(registerSchema), (req, res) => userController.register(req, res));

/**
 * @swagger
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
 *                 example: quentin@example.com
 *               password:
 *                 type: string
 *                 example: MonMdp123!
 *     responses:
 *       200:
 *         description: Connexion réussie
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AuthResponse'
 *       401:
 *         description: Email ou mot de passe incorrect
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post('/auth/login', validate(loginSchema), (req, res) => userController.login(req, res));

/**
 * @swagger
 * /api/v1/auth/forgot-password:
 *   post:
 *     summary: Demander un code de réinitialisation de mot de passe
 *     tags: [Auth]
 *     description: >
 *       Envoie un code à 6 chiffres par email, valable 15 minutes (5 tentatives max).
 *       La réponse est identique que l'email existe ou non afin d'éviter toute fuite d'information.
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
 *                 example: quentin@example.com
 *     responses:
 *       200:
 *         description: Réponse générique (ne révèle pas si l'email existe)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Si cet email est associé à un compte, un code à 6 chiffres a été envoyé.
 *       400:
 *         description: Email invalide
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
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
 *     summary: Réinitialiser le mot de passe avec le code reçu par email
 *     tags: [Auth]
 *     description: >
 *       Le champ `code` accepte `"482913"` ou `"482 913"` (avec espace).
 *       Le compte est bloqué après 5 tentatives incorrectes.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, code, password]
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: quentin@example.com
 *               code:
 *                 type: string
 *                 description: Code à 6 chiffres reçu par email (espaces ignorés)
 *                 example: "482913"
 *               password:
 *                 type: string
 *                 description: 8 caractères min, 1 majuscule, 1 chiffre
 *                 example: NouveauMdp1!
 *     responses:
 *       200:
 *         description: Mot de passe modifié avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Mot de passe modifié avec succès. Vous pouvez vous reconnecter.
 *       400:
 *         description: Code incorrect, expiré, trop de tentatives, ou données invalides
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post(
  '/auth/reset-password',
  validate(resetPasswordSchema),
  (req, res) => userController.resetPassword(req, res)
);

// ── Utilisateur connecté ───────────────────────────────────────

/**
 * @swagger
 * /api/v1/users/me:
 *   get:
 *     summary: Récupérer son propre profil
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Profil de l'utilisateur connecté
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UserPublic'
 *       401:
 *         description: Token manquant ou invalide
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/users/me', authenticate, (req, res) => userController.getMe(req, res));

/**
 * @swagger
 * /api/v1/users/{id}:
 *   delete:
 *     summary: Supprimer son propre compte
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     description: Un utilisateur ne peut supprimer que son propre compte. Le mot de passe est requis en confirmation.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de l'utilisateur (doit correspondre au token JWT)
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [password]
 *             properties:
 *               password:
 *                 type: string
 *                 example: MonMdp123!
 *     responses:
 *       204:
 *         description: Compte supprimé avec succès
 *       401:
 *         description: Token invalide ou mot de passe incorrect
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       403:
 *         description: Tentative de suppression d'un autre compte
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.delete('/users/:id', authenticate, (req, res) => userController.deleteSelf(req, res));

/**
 * @swagger
 * /api/v1/users/{id}:
 *   patch:
 *     summary: Modifier son profil (ou celui d'un autre si admin)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     description: >
 *       Un utilisateur peut modifier son propre profil.
 *       Seul un admin peut modifier le champ `role` ou `is_active`.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             minProperties: 1
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               username:
 *                 type: string
 *                 minLength: 3
 *                 maxLength: 30
 *               password:
 *                 type: string
 *                 description: 8 caractères min, 1 majuscule, 1 chiffre
 *               role:
 *                 type: string
 *                 enum: [admin, user, moderator]
 *                 description: Réservé aux admins
 *               is_active:
 *                 type: boolean
 *                 description: Réservé aux admins
 *     responses:
 *       200:
 *         description: Profil mis à jour
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UserPublic'
 *       400:
 *         description: Données invalides ou email/username déjà utilisé
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       403:
 *         description: Action non autorisée
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.patch('/users/:id', authenticate, validate(updateUserSchema), (req, res) => userController.update(req, res));

/**
 * @swagger
 * /api/v1/users:
 *   get:
 *     summary: Lister tous les utilisateurs
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Numéro de page
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *           maximum: 100
 *         description: Nombre de résultats par page
 *     responses:
 *       200:
 *         description: Liste paginée des utilisateurs
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/UserPublic'
 *                 total:
 *                   type: integer
 *                   example: 42
 *                 page:
 *                   type: integer
 *                   example: 1
 *                 limit:
 *                   type: integer
 *                   example: 10
 *                 totalPages:
 *                   type: integer
 *                   example: 5
 *       401:
 *         description: Token manquant ou invalide
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/users', authenticate, (req, res) => userController.getAll(req, res));

// ── Commandes ─────────────────────────────────────────────────
router.use('/orders', orderRoutes);

// ── Images (ImageKit) ──────────────────────────────────────────
router.use('/images', imagekitRoutes);

export default router;

// ── Composants Swagger réutilisables ──────────────────────────
/**
 * @swagger
 * components:
 *   securitySchemes:
 *     bearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 *
 *   schemas:
 *     UserPublic:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           example: 1
 *         email:
 *           type: string
 *           format: email
 *           example: quentin@example.com
 *         username:
 *           type: string
 *           example: quentin_dev
 *         role:
 *           type: string
 *           enum: [admin, user, moderator]
 *           example: user
 *         is_active:
 *           type: boolean
 *           example: true
 *         created_at:
 *           type: string
 *           format: date-time
 *         updated_at:
 *           type: string
 *           format: date-time
 *
 *     AuthResponse:
 *       type: object
 *       properties:
 *         user:
 *           $ref: '#/components/schemas/UserPublic'
 *         token:
 *           type: string
 *           description: JWT à passer dans Authorization Bearer
 *           example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
 *
 *     Error:
 *       type: object
 *       properties:
 *         error:
 *           type: string
 *           example: Email ou mot de passe incorrect
 */