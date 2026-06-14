export interface UploadImageDto {
  /** Nom du fichier sans extension */
  fileName: string;
  /** Dossier cible : 'products' | 'collections' | 'atelier' */
  folder?: 'products' | 'collections' | 'atelier';
  /** Tags libres ex: ["bol","grès","collection-2025"] */
  tags?: string[];
  /** Transformer automatiquement (webp, redimensionner…) */
  useUniqueFileName?: boolean;
}

export interface ImageKitFile {
  fileId: string;
  name: string;
  url: string;
  thumbnailUrl: string;
  filePath: string;
  tags: string[];
  size: number;
  width: number | null;
  height: number | null;
  createdAt: string;
  updatedAt: string;
}

export interface ListFilesQuery {
  folder?: 'products' | 'collections' | 'atelier';
  tags?: string;          // virgule-séparés ex: "bol,grès"
  limit?: number;
  skip?: number;
  searchQuery?: string;   // ex: nom d'une pièce
}

export interface AuthSignature {
  token: string;
  expire: number;
  signature: string;
}
