import {Router} from 'express';
import { AuthenticatedRequest, authenticateToken } from '../middleware/auth';
import { formatToSqlDate } from '../utils/date.utils';
import { prisma } from '../config/db';
import { QUERY_RAW_ADMIN_APPOINTMENTS_LIST_RESULT, QUERY_RAW_GET_APPOINTMENT_OVERVIEW_RESPONSE, QUERY_RAW_SET_CLIENT_RATE_RESPONSE} from '../interfaces/admin-dashboard.interfaces';
import { requireRole } from '../middleware/require-role';
import { validate, validateQuery } from '../middleware/validate';
import { adminAppointmentsQuerySchema, setClientRatingSchema } from '../schemas/admin-dashboard.schema';
import z from 'zod';


const router = Router();

router.get('/get-admin-appointments-list', 
  authenticateToken, requireRole('admin'), validateQuery(adminAppointmentsQuerySchema), async (req: AuthenticatedRequest, res) => {
  try {

    const q = (req as any).validatedQuery as z.infer<typeof adminAppointmentsQuerySchema>;

    const result: QUERY_RAW_ADMIN_APPOINTMENTS_LIST_RESULT[] = await prisma.$queryRaw<QUERY_RAW_ADMIN_APPOINTMENTS_LIST_RESULT[]>`
      SELECT public.get_admin_appointments_json(
        ${q.barberId ?? null}, 
        ${q.status ?? null}, 
        ${formatToSqlDate(q.startDate)}, 
        ${formatToSqlDate(q.endDate)},        
        ${q.rows}, 
        ${q.first}, 
        ${q.customerName ?? null}, 
        ${q.serviceId ?? null},
        ${q.searchQuery ?? null},
        ${q.sortField ?? null},
        ${q.sortOrder ?? null}
      ) AS result
    `;

    const finalResponse = result[0]?.result || { data: [], total: 0 };

    res.status(200).json(finalResponse);

    //${q.rows} - limit
    //${q.first} - offset
 
  } catch (error) {
    console.error('Eroare la aducerea programărilor de admin cu filtre:', error);
    res.status(500).json({ error: 'Eroare la extragerea datelor filtrate.' });
  }
});


router.post('/set-client-rate', 
  authenticateToken, requireRole('admin', 'barber'), validate(setClientRatingSchema), async (req: AuthenticatedRequest, res) => {
  try {

    const {p_appointment_id, p_rating} = req.body as z.infer<typeof setClientRatingSchema>;

    const dbResponse = await prisma.$queryRaw<QUERY_RAW_SET_CLIENT_RATE_RESPONSE[]>`
      SELECT public.rate_customer_by_staff_json(
        ${p_appointment_id}, 
        ${p_rating}
      ) AS result
    `; 

    // console.log("== || /api/set-client-rate || == req.body ==", req.body)
    // console.log('== || /api/set-client-rate || == dbResponse ==', dbResponse);
    // console.log('== || /api/set-client-rate || == dbResponse[0].result ==', dbResponse[0].result);

    const finalData = dbResponse[0].result;

    res.status(finalData.code).json(finalData);


  } catch (error) {
    console.error('SET CLIENT RATE ERROR:', error);
    res.status(500).json({ appointment_id: req.body?.p_appointment_id, success: false, message: 'a aparut o eroare la actualizarea datelor' });
  }
});


//router.get('/get-admin-appointment-overview', authenticateToken, async (req: AuthenticatedRequest, res) => {
//   try {

//     if (req.user?.role !== 'admin') {
//       res.status(403).json({ appointment_id: null, success: false, message: 'Acces interzis. Necesită drepturi de administrator.' });
//       return;
//     }


//     const appointment_id = req.query.appointment_id ? parseInt(String(req.query.appointment_id), 10) : null;
//     console.log("== || /api/get-admin-appointment-overview || == appointment_id == ", appointment_id)

//     const result = await prisma.$queryRaw<QUERY_RAW_GET_APPOINTMENT_OVERVIEW_RESPONSE[]>`
//       SELECT public.get_appointment_overview_json(
//         ${appointment_id}
//       ) AS result
//     `;

//     const finalResponse = result[0]?.result;

//     res.json(finalResponse);
 
//   } catch (error) {
//     console.error('Eroare la aducerea rezumat programare:', error);
//     res.status(500).json({ error: 'Eroare la extragerea datelor.' });
//   }
// });




export default router;