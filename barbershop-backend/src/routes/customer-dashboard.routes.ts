import {Router} from 'express';
import { AuthenticatedRequest, authenticateToken } from '../middleware/auth';
import { formatToSqlDate } from '../utils/date.utils';
import { prisma } from '../config/db';
import { QUERY_RAW_CANCEL_APPOINTMENT_BY_CLIENT_RESPONSE, QUERY_RAW_CUSTOMER_APPOINTMENTS_LIST_RESPONSE, QUERY_RAW_SET_BARBER_RATE_RESPONSE } from '../interfaces/customer-dashboard.interfaces';
import { requireRole } from '../middleware/require-role';
import { validateQuery } from '../middleware/validate';
import { customerAppointmentsQuerySchema } from '../schemas/customer-dashboard.schema';
import z from 'zod';


const router = Router();


router.get('/get-customer-appointments-list', authenticateToken, requireRole('customer'), 
  validateQuery(customerAppointmentsQuerySchema),  async (req: AuthenticatedRequest, res) => {
  try {

    const q = (req as any).validatedQuery as z.infer<typeof customerAppointmentsQuerySchema>;

    console.log('== || /api/get-customer-appointments-list || == q == ', q);

    const dbResponse = await prisma.$queryRaw<QUERY_RAW_CUSTOMER_APPOINTMENTS_LIST_RESPONSE[]>`
      SELECT public.get_customer_appointments_history_json(
        ${req.user!.userId},
        ${q.serviceId ?? null},
        ${q.maxPrice ?? null},
        ${q.maxDuration ?? null},
        ${q.barberId ?? null},
        ${formatToSqlDate(q.startDate)},
        ${formatToSqlDate(q.endDate)},
        ${q.rows},
        ${q.first},
        ${q.searchQuery ?? null},
        ${q.sortField ?? null},
        ${q.sortOrder ?? null}
      ) AS result
    `;
    // console.log('== || /api/get-customer-appointments-list || == dbResponse ==', dbResponse);
    console.log('== || /api/get-customer-appointments-list || == dbResponse[0]?.result == ', dbResponse[0]?.result);

    const finalResponse = dbResponse[0]?.result || { data: [], total: 0 };

    res.status(200).json(finalResponse);

    
    // const p_customer_id = req.user!.userId;

    // const p_sort_field = req.query.sortField ? String(req.query.sortField) : null;
    // const p_sort_order = req.query.sortOrder ? parseInt(String(req.query.sortOrder), 10) : null;

    // const p_service_id = (req.query.serviceId as string) || null;
    // const p_max_service_price = req.query.maxPrice ? parseFloat(req.query.maxPrice as string) : null;
    // const p_max_service_duration = req.query.maxDuration ? parseInt(req.query.maxDuration as string) : null;
    // const p_barber_id = (req.query.barberId as string) || null;

    // const p_start_date = formatToSqlDate(req.query.startDate);
    // const p_end_date = formatToSqlDate(req.query.endDate);

    // const p_search_query = (req.query.searchQuery as string) || null;
    // const p_offset = req.query.first ? parseInt(req.query.first as string) : 0;
    // const p_limit = req.query.rows ? parseInt(req.query.rows as string) : 10;

    // Executăm funcția stocată utilizând mecanismul securizat de conversie text
    // const dbResponse = await prisma.$queryRaw<QUERY_RAW_CUSTOMER_APPOINTMENTS_LIST_RESPONSE[]>`
    //   SELECT public.get_customer_appointments_history_json(
    //     ${p_customer_id},
    //     ${p_service_id},
    //     ${p_max_service_price},
    //     ${p_max_service_duration},
    //     ${p_barber_id},
    //     ${p_start_date},
    //     ${p_end_date},
    //     ${p_limit},
    //     ${p_offset},
    //     ${p_search_query},
    //     ${p_sort_field},
    //     ${p_sort_order}
    //   ) AS result
    // `;

  } catch (error) {
    console.error('API APPOINTMENTS HISTORY ERROR:', error);
    res.status(500).json({ error: 'Eroare internă la încărcarea istoricului.' });
  }
});



// router.post('/cancel-appointment-by-client', authenticateToken, requireRole('barber'), async (req: AuthenticatedRequest, res) => {
//   try {


//     if (req.user?.role !== 'customer') {
//       res.status(403).json({ appointment_id: null, success: false, message: 'Acces interzis. Necesită drepturi de client.' });
//       return;
//     }
//     const p_appointment_id = parseInt(String(req.body.p_appointment_id));
//     const p_customer_id = req.user?.userId; // Preluat în siguranță din token-ul JWT decodat
    
//     if (!p_customer_id) {
//       res.status(401).json({ appointment_id: p_appointment_id, success: false, message: 'Neautorizat.' });
//       return;
//     }

//     // Apelăm funcția din PostgreSQL folosind șablonul securizat $queryRaw
//     const dbResponse = await prisma.$queryRaw<QUERY_RAW_CANCEL_APPOINTMENT_BY_CLIENT_RESPONSE[]>`
//       SELECT public.cancel_customer_appointment_json(
//         ${p_appointment_id}, 
//         ${p_customer_id}
//       ) AS result
//     `;

//     const finalData = dbResponse[0].result;

//     res.json(finalData);

//   } catch (error) {
//     console.error('CANCEL APPOINTMENT ERROR:', error);
//     res.status(500).json({ appointment_id: parseInt(req.body.id), success: false, message: 'a aparut o eroare la actualizarea datelor' });
//   }
// });



router.post('/set-barber-rate', authenticateToken, requireRole('barber'), async (req: AuthenticatedRequest, res) => {
  try {

    console.log("== || /api/set-barber-rate || == req.body ==", req.body)

    if (req.user?.role !== 'customer') {
      res.status(403).json({ appointment_id: null, barber_id: null, success: false, message: 'Acces interzis' });
      return;
    }

    
    const p_appointment_id = parseInt(String(req.body.p_appointment_id));
    const p_barber_id = parseInt(String(req.body.p_barber_id));
    const p_rating = parseInt(String(req.body.p_rating)); 
    

    // Apelăm funcția din PostgreSQL folosind șablonul securizat $queryRaw
    const dbResponse = await prisma.$queryRaw<QUERY_RAW_SET_BARBER_RATE_RESPONSE[]>`
      SELECT public.rate_barber_and_appointment_json(
        ${p_appointment_id}, 
        ${p_rating}
      ) AS result
    `; 

    console.log('== || /api/set-barber-rate || == dbResponse ==', dbResponse);
    console.log('== || /api/set-barber-rate || == dbResponse[0].result ==', dbResponse[0].result);

    const finalData = dbResponse[0].result;

    // const rawJsonText = dbResponse?.?.response;

    // if (!rawJsonText) {
    //   res.status(500).json({ appointment_id: p_appointment_id, success: false, message: 'a aparut o eroare la actualizarea datelor' });
    //   return;
    // }

    // const finalResult = JSON.parse(rawJsonText);

    // if (!finalResult.success) {
    //   res.status(400).json(finalResult);
    //   return;
    // }

    res.json(finalData);

  } catch (error) {
    console.error('SET BARBER RATE ERROR:', error);
    res.status(500).json({ appointment_id: parseInt(req.body.p_appointment_id), success: false, message: 'a aparut o eroare la actualizarea datelor' });
  }
});





export default router;