import type { Request, Response } from 'express';
import { orderService } from '../services/order.service';
import type { PaginationParams } from '../types/order.types';

export class OrderController {
  async create(req: Request, res: Response): Promise<void> {
    try {
      const order = await orderService.create(req.body);
      res.status(201).json(order);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erreur création commande';
      res.status(400).json({ error: message });
    }
  }

  async list(req: Request, res: Response): Promise<void> {
    try {
      const page = parseInt(String(req.query.page ?? '1'), 10) || 1;
      const limit = parseInt(String(req.query.limit ?? '10'), 10) || 10;
      const result = await orderService.getAll({ page, limit });
      res.json(result);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erreur listing commandes';
      res.status(500).json({ error: message });
    }
  }

  async getById(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(String(req.params.id), 10);
      if (isNaN(id)) {
        res.status(400).json({ error: 'ID invalide' });
        return;
      }
      const order = await orderService.getById(id);
      res.json(order);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Commande introuvable';
      res.status(404).json({ error: message });
    }
  }

  async update(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(String(req.params.id), 10);
      if (isNaN(id)) {
        res.status(400).json({ error: 'ID invalide' });
        return;
      }
      const order = await orderService.update(id, req.body);
      res.json(order);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erreur mise à jour commande';
      const status = message.includes('introuvable') ? 404 : 400;
      res.status(status).json({ error: message });
    }
  }

  async delete(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(String(req.params.id), 10);
      if (isNaN(id)) {
        res.status(400).json({ error: 'ID invalide' });
        return;
      }
      await orderService.delete(id);
      res.status(204).send();
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erreur suppression commande';
      res.status(404).json({ error: message });
    }
  }
}

export const orderController = new OrderController();
