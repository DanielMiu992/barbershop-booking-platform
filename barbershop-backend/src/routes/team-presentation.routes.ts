import {Router} from 'express';
import { prisma } from '../config/db';
import { validate, validateQuery } from '../middleware/validate';
import z from 'zod';

const router = Router();

router.get('/barbers-showcase', async (req, res) => {
  try {
    const result = await prisma.$queryRaw<{ result: any }[]>`
      SELECT public.get_barbers_showcase_json() AS result
    `;

    res.json(result[0]?.result ?? { data: [], success: false });
  } catch (error) {
    console.error('Eroare la barbers-showcase:', error);
    res.status(500).json({ data: [], success: false });
  }
});



export default router;