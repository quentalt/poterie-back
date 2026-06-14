import type { Request, Response } from 'express';
import { imagekitService } from '../services/imagekit.service';
import type { ListFilesQuery, UploadImageDto } from '../types/imagekit.types';

export class ImageKitController {
  /**
   * GET /images/auth
   * Renvoie token + signature pour upload direct depuis le front.
   * Réservé aux utilisateurs connectés.
   */
  getAuthSignature(req: Request, res: Response): void {
    try {
      const auth = imagekitService.getAuthSignature();
      res.json(auth);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erreur ImageKit';
      res.status(500).json({ error: message });
    }
  }

  /**
   * POST /images/upload
   * Upload serveur via multer (multipart/form-data).
   * Body fields : fileName, folder?, tags? (virgule-séparés), useUniqueFileName?
   */
  async upload(req: Request, res: Response): Promise<void> {
    try {
      if (!req.file) {
        res.status(400).json({ error: 'Aucun fichier reçu (champ : image)' });
        return;
      }

      const { fileName, folder, tags, useUniqueFileName } = req.body as Record<string, string>;

      if (!fileName) {
        res.status(400).json({ error: 'Le champ fileName est requis' });
        return;
      }

      const dto: UploadImageDto = {
        fileName,
        folder: (folder as UploadImageDto['folder']) ?? 'products',
        tags:   tags ? tags.split(',').map((t) => t.trim()) : [],
        useUniqueFileName: useUniqueFileName !== 'false',
      };

      const file = await imagekitService.upload(
        req.file.buffer,
        req.file.mimetype,
        dto
      );

      res.status(201).json(file);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erreur upload';
      res.status(500).json({ error: message });
    }
  }

  /**
   * GET /images
   * Liste les images avec filtres optionnels.
   * Query params : folder, tags, limit, skip, searchQuery
   */
  async list(req: Request, res: Response): Promise<void> {
    try {
      const query: ListFilesQuery = {
        folder:      req.query.folder as ListFilesQuery['folder'],
        tags:        req.query.tags        as string | undefined,
        limit:       req.query.limit  ? parseInt(String(req.query.limit),  10) : undefined,
        skip:        req.query.skip   ? parseInt(String(req.query.skip),   10) : undefined,
        searchQuery: req.query.search as string | undefined,
      };

      const files = await imagekitService.list(query);
      res.json({ data: files, count: files.length });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erreur listing';
      res.status(500).json({ error: message });
    }
  }

  /**
   * GET /images/:fileId
   * Détail d'un fichier.
   */
  async getById(req: Request, res: Response): Promise<void> {
    try {
      const file = await imagekitService.getById(String(req.params['fileId']));
      res.json(file);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Fichier introuvable';
      res.status(404).json({ error: message });
    }
  }

  /**
   * DELETE /images/:fileId
   * Supprime un fichier.
   */
  async delete(req: Request, res: Response): Promise<void> {
    try {
      await imagekitService.delete(String(req.params['fileId']));
      res.status(204).send();
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erreur suppression';
      res.status(500).json({ error: message });
    }
  }

  /**
   * DELETE /images
   * Suppression en masse. Body : { fileIds: string[] }
   */
  async bulkDelete(req: Request, res: Response): Promise<void> {
    try {
      const { fileIds } = req.body as { fileIds?: unknown };

      if (!Array.isArray(fileIds) || fileIds.length === 0) {
        res.status(400).json({ error: 'fileIds doit être un tableau non vide' });
        return;
      }

      const result = await imagekitService.bulkDelete(fileIds as string[]);
      res.json(result);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erreur suppression';
      res.status(500).json({ error: message });
    }
  }

  /**
   * GET /images/url
   * Génère une URL transformée à la volée.
   * Query : path (requis), width?, height?
   */
  buildUrl(req: Request, res: Response): void {
    try {
      const path   = String(req.query.path   ?? '');
      const width  = req.query.width  ? String(req.query.width)  : undefined;
      const height = req.query.height ? String(req.query.height) : undefined;
      if (!path) {
        res.status(400).json({ error: 'Le paramètre path est requis' });
        return;
      }

      const url = imagekitService.buildUrl(
        path,
        width  ? parseInt(width,  10) : undefined,
        height ? parseInt(height, 10) : undefined
      );

      res.json({ url });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erreur génération URL';
      res.status(500).json({ error: message });
    }
  }
}

export const imagekitController = new ImageKitController();
