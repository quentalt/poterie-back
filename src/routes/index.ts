import { Router } from 'express';
import { userController } from '../controllers/user.controller';
import { authenticate, requireRole } from '../middleware/auth.middleware';
import { validate, registerSchema, loginSchema, updateUserSchema } from '../middleware/validation.middleware';
import imagekitRoutes from "./imagekit.routes";

const router = Router();

// ── Auth (public) ─────────────────────────────────────────────
router.post('/auth/register', validate(registerSchema), (req, res) => userController.register(req, res));
router.post('/auth/login',    validate(loginSchema),    (req, res) => userController.login(req, res));

// ── Utilisateur connecté ───────────────────────────────────────
router.get('/users/me',      authenticate, (req, res) => userController.getMe(req, res));
router.delete('/me', authenticate, (req, res) => userController.deleteSelf(req, res));
router.patch('/users/:id',   authenticate, validate(updateUserSchema), (req, res) => userController.update(req, res));

// ── Admin uniquement ───────────────────────────────────────────
router.get('/users',         authenticate, requireRole('admin'), (req, res) => userController.getAll(req, res));
router.get('/users/:id',     authenticate, requireRole('admin'), (req, res) => userController.getById(req, res));
router.delete('/users/:id',  authenticate, requireRole('admin'), (req, res) => userController.delete(req, res));

// ── Images (ImageKit) ──────────────────────────────────────────
router.use('/images', imagekitRoutes);

export default router;
