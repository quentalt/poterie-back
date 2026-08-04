import { Router } from 'express';
import { authenticate } from '../middleware/auth.middleware';
import { validate, createOrderSchema, updateOrderSchema } from '../middleware/validation.middleware';
import { orderController } from '../controllers/order.controller';

const router = Router();

router.use(authenticate);

router.post('/', validate(createOrderSchema), (req, res) => orderController.create(req, res));
router.get('/', (req, res) => orderController.list(req, res));
router.get('/:id', (req, res) => orderController.getById(req, res));
router.patch('/:id', validate(updateOrderSchema), (req, res) => orderController.update(req, res));
router.delete('/:id', (req, res) => orderController.delete(req, res));

export default router;
