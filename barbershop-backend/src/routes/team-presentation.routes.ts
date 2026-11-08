import {Router} from 'express';
import { prisma } from '../config/db';
import { validate, validateQuery } from '../middleware/validate';
import { BARBERS_SHOWCASE_RESPONSE } from '../interfaces/team-presentation.interfaces';

const router = Router();

router.get('/barbers-showcase', async (req, res) => {
  try {
    const result = await prisma.$queryRaw<BARBERS_SHOWCASE_RESPONSE[]>`
      SELECT public.get_barbers_showcase_json() AS result
    `;

    console.log(" == || api /barbers-showcase || == result[0]?.result ==", result[0]?.result)

    res.status(200).json(result[0]?.result ?? { data: [], success: false });

  } catch (error) {
    console.error('Eroare la barbers-showcase:', error);
    res.status(500).json({ data: [], success: false });
  }
});



export default router;