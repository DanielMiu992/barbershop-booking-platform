import {Router} from 'express';
import { AuthenticatedRequest, authenticateToken } from '../middleware/auth';
import { prisma } from '../config/db';
import { formatToSqlDate } from '../utils/date.utils';
import { QUERY_RAW_BARBER_APPOINTMENTS_LIST_RESPONSE } from '../interfaces/barber-dashboard.interfaces';
import { requireRole } from '../middleware/require-role';
import { validateQuery } from '../middleware/validate';
import { barberAppointmentsQuerySchema } from '../schemas/barber-dashboard.schema';
import z from 'zod';

const router = Router();

router.get('/get-barber-appointments-list', 
  authenticateToken, requireRole('barber'), validateQuery(barberAppointmentsQuerySchema), async (req: AuthenticatedRequest, res) => {
  try {

    const q = (req as any).validatedQuery as z.infer<typeof barberAppointmentsQuerySchema>;

    console.log("q - /get-barber-appointments-list", q)
    
    const dbResponse = await prisma.$queryRaw<QUERY_RAW_BARBER_APPOINTMENTS_LIST_RESPONSE[]>`
      SELECT public.get_barber_appointments_history_json_v2(
        ${req.user!.userId},
        ${q.serviceId},
        ${q.maxPrice},
        ${q.maxDuration},
        ${q.startDate},
        ${q.endDate},
        ${q.rows},
        ${q.first},
        ${q.searchQuery},
        ${q.sortField},
        ${q.sortOrder}
      ) AS result
    `;

    //         ${formatToSqlDate(q.startDate)},
        //${formatToSqlDate(q.endDate)},

    const finalResponse = dbResponse[0]?.result || { data: [], total: 0 };

    res.status(200).json(finalResponse);

    console.log('== || /api/get-barber-appointments-list || == dbResponse ==', dbResponse);
    console.log('== || /api/get-barber-appointments-list || == dbResponse[0]?.result == ', dbResponse[0]?.result);

  } catch (error) {
    console.error('API APPOINTMENTS HISTORY ERROR:', error);
    res.status(500).json({ error: 'Eroare internă la încărcarea istoricului.' });
  }
});


export default router;