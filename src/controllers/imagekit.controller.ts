import type { Request, Response } from 'express';
import { imagekitService } from '../services/imagekit.service';
import type {ListFilesQuery, RenameImageDto, UploadImageDto} from '../types/imagekit.types';

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
      const files = Array.isArray(req.files)
        ? req.files
        : req.file
          ? [req.file]
          : [];

      if (files.length === 0) {
        res.status(400).json({ error: 'Aucun fichier reçu (champ : images ou image)' });
        return;
      }

      const body = req.body as Record<string, unknown>;
      const folder = body.folder as UploadImageDto['folder'] | undefined;
      const tags = typeof body.tags === 'string'
        ? String(body.tags).split(',').map((t) => t.trim()).filter(Boolean)
        : [];
      const useUniqueFileName = body.useUniqueFileName !== 'false';
      const title = typeof body.title === 'string' ? String(body.title).trim() : undefined;
      const status = typeof body.status === 'string' ? String(body.status).trim() : undefined;
      const category = typeof body.category === 'string' ? String(body.category).trim() : undefined;

      const fileNames = Array.isArray(body.fileNames)
        ? body.fileNames.map(String)
        : typeof body.fileNames === 'string'
          ? String(body.fileNames).split(',').map((s) => s.trim())
          : [];
      const descriptions = Array.isArray(body.descriptions)
        ? body.descriptions.map(String)
        : typeof body.descriptions === 'string'
          ? String(body.descriptions).split(',').map((s) => s.trim())
          : [];
      const globalDescription = typeof body.description === 'string'
        ? String(body.description).trim()
        : undefined;

      const uploadPromises = files.map((file, index) => {
        const baseName = fileNames[index] ?? file.originalname ?? `image-${Date.now()}`;
        const description = descriptions[index] ?? globalDescription;

        const dto: UploadImageDto = {
          fileName: baseName,
          folder: folder ?? 'products',
          tags,
          useUniqueFileName,
          title,
          status,
          category,
          description,
        };

        return imagekitService.upload(
          file.buffer,
          file.mimetype,
          dto,
        );
      });

      const uploadedFiles = await Promise.all(uploadPromises);
      res.status(201).json({ files: uploadedFiles });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erreur upload';
      res.status(500).json({ error: message });
    }
  }

  /**
   * PATCH /images/:fileId
   * Renomme un fichier. Body : { newFileName, purgeCache? }
   */
  async rename(req: Request, res: Response): Promise<void> {
    try {
      const { newFileName, purgeCache } = req.body as Record<string, unknown>;

      if (!newFileName || typeof newFileName !== 'string') {
        res.status(400).json({ error: 'Le champ newFileName est requis' });
        return;
      }

      const dto: RenameImageDto = {
        newFileName,
        purgeCache: purgeCache === undefined ? true : Boolean(purgeCache),
      };

      const file = await imagekitService.rename(String(req.params['fileId']), dto);
      res.json(file);
    } catch (error) {
      console.error('rename failed for fileId=', req.params['fileId'], error);

      const message =
          error instanceof Error
              ? error.message
              : typeof error === 'object' && error !== null && 'message' in error
                  ? String((error as { message: unknown }).message)
                  : 'Erreur renommage';

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
