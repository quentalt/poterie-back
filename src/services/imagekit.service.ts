import { imagekit, FOLDERS, type FolderKey } from '../config/imagekit';
import type {
  UploadImageDto,
  ImageKitFile,
  ListFilesQuery,
  AuthSignature,
} from '../types/imagekit.types';

export class ImageKitService {
  /**
   * Génère les paramètres d'authentification pour un upload
   * côté client (front React / Next.js).
   * Le token expire après 30 minutes.
   */
  getAuthSignature(): AuthSignature {
    const { token, expire, signature } = imagekit.getAuthenticationParameters();
    return { token, expire, signature };
  }

  /**
   * Upload serveur : reçoit un buffer (multer memoryStorage)
   * et l'envoie à ImageKit.
   */
  async upload(
    fileBuffer: Buffer,
    mimeType: string,
    dto: UploadImageDto
  ): Promise<ImageKitFile> {
    const folderKey: FolderKey = dto.folder ?? 'products';
    const folderPath = FOLDERS[folderKey];

    const result = await imagekit.upload({
      file:            fileBuffer,
      fileName:        dto.fileName,
      folder:          folderPath,
      tags:            dto.tags ?? [],
      useUniqueFileName: dto.useUniqueFileName ?? true,
      // Transformations automatiques à l'upload
      transformation: {
        pre: 'w-2000,f-webp,q-85', // max 2000px, converti en WebP
      },
    });

    return this.normalize(result);
  }

  /**
   * Liste les fichiers d'un dossier avec filtres optionnels.
   */
  async list(query: ListFilesQuery = {}): Promise<ImageKitFile[]> {
    const folderKey: FolderKey = query.folder ?? 'products';
    const path = FOLDERS[folderKey];

    const results = await imagekit.listFiles({
      path,
      tags:        query.tags,
      limit:       query.limit  ?? 50,
      skip:        query.skip   ?? 0,
      searchQuery: query.searchQuery
        ? `name : "${query.searchQuery}"`
        : undefined,
      fileType: 'image',
      sort: 'DESC_CREATED',
    });

    return (results as unknown[]).map((f) => this.normalize(f));
  }

  /**
   * Détail d'un fichier par son fileId.
   */
  async getById(fileId: string): Promise<ImageKitFile> {
    const result = await imagekit.getFileDetails(fileId);
    return this.normalize(result);
  }

  /**
   * Supprime un fichier par son fileId.
   */
  async delete(fileId: string): Promise<void> {
    await imagekit.deleteFile(fileId);
  }

  /**
   * Supprime plusieurs fichiers en une fois.
   */
  async bulkDelete(fileIds: string[]): Promise<{ deleted: string[]; errors: string[] }> {
    const results = await Promise.allSettled(
      fileIds.map((id) => imagekit.deleteFile(id))
    );

    const deleted: string[] = [];
    const errors:  string[] = [];

    results.forEach((r, i) => {
      if (r.status === 'fulfilled') deleted.push(fileIds[i]);
      else errors.push(fileIds[i]);
    });

    return { deleted, errors };
  }

  /**
   * Génère une URL optimisée avec transformations à la volée.
   * Utile pour les vignettes catalogue ou les images SEO.
   */
  buildUrl(filePath: string, width?: number, height?: number): string {
    return imagekit.url({
      path: filePath,
      transformation: [
        {
          width:  width  ? String(width)  : '800',
          height: height ? String(height) : undefined,
          format: 'webp',
          quality: '80',
          cropMode: 'maintain_ratio',
        },
      ],
    });
  }

  // Normalise la réponse ImageKit vers notre type interne
  private normalize(raw: unknown): ImageKitFile {
    const f = raw as Record<string, unknown>;
    return {
      fileId:       String(f['fileId']       ?? f['$id'] ?? ''),
      name:         String(f['name']         ?? ''),
      url:          String(f['url']          ?? ''),
      thumbnailUrl: String(f['thumbnailUrl'] ?? f['url'] ?? ''),
      filePath:     String(f['filePath']     ?? ''),
      tags:         Array.isArray(f['tags']) ? (f['tags'] as string[]) : [],
      size:         Number(f['size']         ?? 0),
      width:        f['width']  != null ? Number(f['width'])  : null,
      height:       f['height'] != null ? Number(f['height']) : null,
      createdAt:    String(f['createdAt']    ?? ''),
      updatedAt:    String(f['updatedAt']    ?? ''),
    };
  }
}

export const imagekitService = new ImageKitService();
