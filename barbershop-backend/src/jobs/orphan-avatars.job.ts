import fs from 'fs/promises';
import path from 'path';
import cron from 'node-cron';
import { prisma } from '../config/db';

const AVATAR_DIR = path.join(process.cwd(), 'uploads', 'avatars');
const MIN_AGE_HOURS = 24;   // nu atingem fișiere mai noi de atât

export async function cleanupOrphanAvatars(): Promise<void> {
  try {
    const files = await fs.readdir(AVATAR_DIR);
    if (files.length === 0) return;

    // Toate avatarele referențiate în baza de date
    // const barbers = await prisma.barbers.findMany({
    //   where: { avatar_url: { not: null } },
    //   select: { avatar_url: true },
    // });

    // const referenced = new Set(
    //   barbers
    //     .map((b) => b.avatar_url)
    //     .filter((url): url is string => !!url)
    //     .map((url) => path.basename(url))
    // );

    // const referenced = new Set(
    //     (await prisma.barbers.findMany({
    //         where: { avatar_url: { not: null } },
    //         select: { avatar_url: true },
    //     }))
    //         .map((b) => b.avatar_url)
    //         .filter((url): url is string => !!url)
    //         .map((url) => path.basename(url))
    //     );


    const rows = await prisma.$queryRaw<{ filename: string }[]>`
        SELECT split_part(avatar_url, '/', -1) AS filename
        FROM public.users
        WHERE avatar_url IS NOT NULL
        `;
    const referenced = new Set(rows.map((r) => r.filename));

    const cutoff = Date.now() - MIN_AGE_HOURS * 60 * 60 * 1000;
    let deleted = 0;

    for (const file of files) {
      if (referenced.has(file)) continue;

      const filePath = path.join(AVATAR_DIR, file);
      const stats = await fs.stat(filePath);

      // Marja de siguranță: un fișier proaspăt poate fi un upload
      // în curs, care încă nu a apucat să fie salvat în baza de date
      if (stats.mtimeMs > cutoff) continue;

      await fs.unlink(filePath);
      deleted++;
      console.log(`[avatars] Șters fișier orfan: ${file}`);
    }

    if (deleted > 0) {
      console.log(`[avatars] Curățenie completă: ${deleted} fișiere șterse.`);
    }
  } catch (error) {
    console.error('[avatars] Eroare la curățenie:', error);
  }
}

export function startAvatarJob(): void {
    cron.schedule('0 4 * * *', cleanupOrphanAvatars, { timezone: 'Europe/Bucharest' });
  console.log('Job-ul avatare a pornit.');

//   cron.schedule('*/5 * * * *', cleanupOrphanAvatars, { timezone: 'Europe/Bucharest' });
//   console.log('Job-ul avatare a pornit în modul de testare (din 5 în 5 minute).');
}