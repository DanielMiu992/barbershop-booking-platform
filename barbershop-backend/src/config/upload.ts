import multer from 'multer';
import path from 'path';
import fs from 'fs';
import crypto from 'crypto';

const AVATAR_DIR = path.join(process.cwd(), 'uploads', 'avatars');
fs.mkdirSync(AVATAR_DIR, { recursive: true });

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, AVATAR_DIR),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `${crypto.randomBytes(16).toString('hex')}${ext}`);
  },
});

const ALLOWED_MIME = ['image/jpeg', 'image/png', 'image/webp'];

export const avatarUpload = multer({
  storage,
  limits: { fileSize: 2 * 1024 * 1024 },  // 2 MB
  fileFilter: (_req, file, cb) => {
    if (!ALLOWED_MIME.includes(file.mimetype)) {
      cb(new Error('Sunt permise doar imagini JPG, PNG sau WEBP'));
      return;
    }
    cb(null, true);
  },
});

export function deleteAvatarFile(avatarUrl: string | null | undefined): void {
  if (!avatarUrl) return;
  const filename = path.basename(avatarUrl);
  const filePath = path.join(AVATAR_DIR, filename);
  fs.unlink(filePath, (err) => {
    if (err && err.code !== 'ENOENT') {
      console.error('Eroare la ștergerea avatarului vechi:', err);
    }
  });
}