import multer from 'multer';
import type { Request } from 'express';

const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/avif'];
const MAX_SIZE_MB = 10;

export const upload = multer({
  storage: multer.memoryStorage(), // On garde le buffer, pas de disque local

  limits: {
    fileSize: MAX_SIZE_MB * 1024 * 1024,
  },

  fileFilter: (_req: Request, file, cb) => {
    if (ALLOWED_MIME_TYPES.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error(`Format non supporté. Formats acceptés : ${ALLOWED_MIME_TYPES.join(', ')}`));
    }
  },
});
