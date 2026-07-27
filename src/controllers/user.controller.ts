import type { Request, Response } from 'express';
import { userService } from '../services/user.service';
import { passwordResetService } from '../services/password-reset.service';

export class UserController {
  // POST /auth/register
  
  async register(req: Request, res: Response): Promise<void> {
    try {
      const result = await userService.register(req.body);
      res.status(201).json(result);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erreur interne';
      res.status(400).json({error: message});
    }
  }

  // POST /auth/login
  async login(req: Request, res: Response): Promise<void> {
    try {
      const result = await userService.login(req.body);
      res.json(result);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erreur interne';
      res.status(401).json({error: message});
    }
  }

  async requestReset(req: Request, res: Response): Promise<void> {
    try {
      const { email } = req.body as { email?: string };
      if (!email) {
        res.status(400).json({ error: 'Email requis' });
        return;
      }

      await passwordResetService.requestReset(email);

      // Réponse identique que l'email existe ou non → pas de fuite d'info
      res.json({
        message: 'Si cet email est associé à un compte, un code à 6 chiffres a été envoyé.',
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erreur interne';
      res.status(500).json({ error: message });
    }
  }
async resetPassword(req: Request, res: Response): Promise<void> {
    try {
      const { email, code, password } = req.body as {
        email?: string;
        code?: string;
        password?: string;
      };

      if (!email || !code || !password) {
        res.status(400).json({ error: 'email, code et password sont requis' });
        return;
      }

      await passwordResetService.resetPassword(email, code, password);

      res.json({ message: 'Mot de passe modifié avec succès. Vous pouvez vous reconnecter.' });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erreur interne';
      res.status(400).json({ error: message });
    }
  }


  // GET /users/me
  async getMe(req: Request, res: Response): Promise<void> {
    try {
      const user = await userService.getById(req.user!.userId);
      res.json(user);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erreur interne';
      res.status(404).json({error: message});
    }
  }

  // GET /users — admin uniquement
  async getAll(req: Request, res: Response): Promise<void> {
    try {
      const page = parseInt(String(req.query.page ?? '1')) || 1;
      const limit = parseInt(String(req.query.limit ?? '10')) || 10;
      const result = await userService.getAll({page, limit});
      res.json(result);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erreur interne';
      res.status(500).json({error: message});
    }
  }

  // GET /users/:id
  async getById(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(String(req.params.id), 10);
      if (isNaN(id)) {
        res.status(400).json({error: 'ID invalide'});
        return;
      }
      const user = await userService.getById(id);
      res.json(user);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erreur interne';
      res.status(404).json({error: message});
    }
  }

  // PATCH /users/:id
  async update(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(String(req.params.id), 10);
      if (isNaN(id)) {
        res.status(400).json({error: 'ID invalide'});
        return;
      }
      const user = await userService.update(
          id,
          req.body,
          req.user!.userId,
          req.user!.role
      );
      res.json(user);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erreur interne';
      const status = message.includes('autorisée') || message.includes('admin') ? 403 : 400;
      res.status(status).json({error: message});
    }
  }

  // DELETE /users/:id — admin uniquement
  async delete(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(String(req.params.id), 10);
      if (isNaN(id)) {
        res.status(400).json({error: 'ID invalide'});
        return;
      }
      await userService.delete(id);
      res.status(204).send();
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erreur interne';
      res.status(404).json({error: message});
    }
  }

  async deleteSelf(req: Request, res: Response): Promise<void> {
    try {
      const { password } = req.body as { password?: string };
      if (!password) {
        res.status(400).json({ error: 'Le mot de passe est requis pour confirmer la suppression' });
        return;
      }

      await userService.deleteSelf(req.user!.userId, password);
      res.status(204).send();
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erreur interne';
      const status = message.includes('incorrect') ? 401 : 400;
      res.status(status).json({ error: message });
    }
  }
}

export const userController = new UserController();
