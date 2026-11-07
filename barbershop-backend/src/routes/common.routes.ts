import {Router} from 'express';
import { AuthenticatedRequest, authenticateToken } from '../middleware/auth';
import { prisma } from '../config/db';
import { QUERY_RAW_GET_APPOINTMENT_DETAILS_RESPONSE, QUERY_RAW_GET_BARBER_DETAILS_RESPONSE, QUERY_RAW_SET_APPOINTMENT_COMPLETED_RESPONSE, QUERY_RAW_SET_CANCEL_APPOINTMENT_RESPONSE } from '../interfaces/common.interfaces';
import { sendCancellationToBarber, sendCancellationToCustomer } from '../utils/mail';
import { validate, validateQuery } from '../middleware/validate';
import { requireRole } from '../middleware/require-role';
import { appointmentDetailsSchema, barbersDetailsSchema, cancelAppointmentSchema, setAppointmentSchema } from '../schemas/common.schema';
import z from 'zod';

const router = Router();

// 
router.post('/set-cancel-appointment', 
  authenticateToken, requireRole('admin', 'barber', 'customer'), validate(cancelAppointmentSchema), async (req: AuthenticatedRequest, res) => {
  try {

    const {p_appointment_id, p_cancel_reason} = req.body as z.infer<typeof cancelAppointmentSchema>;
    
    const dbResponse = await prisma.$queryRaw<QUERY_RAW_SET_CANCEL_APPOINTMENT_RESPONSE[]>`
      SELECT public.cancel_appointment_unified_json(
        ${p_appointment_id},
        ${req.user!.userId},
        ${req.user!.role},
        ${p_cancel_reason}
      ) AS result
    `;
    

    console.log('== || API /api/cancel_appointment_unified_json || == dbResponse ==', dbResponse);
    console.log('== || API /api/cancel_appointment_unified_json|| == dbResponse[0].result ==', dbResponse[0].result);

    const cancelStatus = dbResponse[0].result;


    if (!cancelStatus || !cancelStatus.success || !cancelStatus.data) {
      res.status(cancelStatus.code).json(cancelStatus);
      return;
    }

    const data = cancelStatus.data;

    // Destinatarul depinde de cine a anulat
    const sendEmail = data.cancelled_by === 'customer'
      ? sendCancellationToBarber(data)
      : sendCancellationToCustomer(data);

    sendEmail.catch((err) => {
      console.error('Eroare la trimiterea emailului de anulare:', err);
    });


    //finalData.code - 422, 404, 200, 500
    res.status(cancelStatus.code).json(cancelStatus);


    // const p_appointment_id = parseInt(String(req.body.p_appointment_id));
    // const p_user_id = req.user?.userId; // Preluat în siguranță din token-ul JWT decodat
    // const p_user_role = req.user?.role;
    // const p_cancel_reason = req.body.p_cancel_reason;
    
    // if (!p_customer_id) {
    //   res.status(401).json({ appointment_id: p_appointment_id, success: false, message: 'Neautorizat.' });
    //   return;
    // }

    // const dbResponse = await prisma.$queryRaw<QUERY_RAW_SET_CANCEL_APPOINTMENT_RESPONSE[]>`
    //   SELECT public.cancel_appointment_unified_json(
    //     ${p_appointment_id},
    //     ${p_user_id},
    //     ${p_user_role},
    //     ${p_cancel_reason}
    //   ) AS result
    // `;

  } catch (error) {
    console.error('SET CANCEL APPOINTMENT:', error);

    res.status(500).json({ 
      appointment_id: req.body.p_appointment_id, 
      success: false, 
      message: 'a aparut o eroare la actualizarea datelor' 
    });
  }
});

router.post('/set-appointment-completed', 
  authenticateToken, requireRole('admin', 'barber'), validate(setAppointmentSchema), async (req: AuthenticatedRequest, res) => {
  try {

    const {p_appointment_id, p_appointment_overview} = req.body as z.infer<typeof setAppointmentSchema>;

    console.log('== || API /api/set-appointment-completed || == req.body; ==', req.body);

    const dbResponse = await prisma.$queryRaw<QUERY_RAW_SET_APPOINTMENT_COMPLETED_RESPONSE[]>`
      SELECT public.complete_admin_appointment_json(
        ${p_appointment_id},
        ${p_appointment_overview}
      ) AS result
    `;

    console.log('== || API /api/set-appointment-completed || == dbResponse ==', dbResponse);

    const finalData = dbResponse[0].result;

    //finalData.code - 422, 404, 200, 500

    res.status(finalData.code).json(finalData);



    
    // const p_appointment_id = parseInt(String(req.body.p_appointment_id));
    // const p_appointment_overview = req.body.p_appointment_overview

    // const dbResponse = await prisma.$queryRaw<QUERY_RAW_SET_APPOINTMENT_COMPLETED_RESPONSE[]>`
    //   SELECT public.complete_admin_appointment_json(
    //     ${p_appointment_id},
    //     ${p_appointment_overview}
    //   ) AS result
    // `;

    // console.log('== || /api/set-appointment-completed || == dbResponse ==', dbResponse);
    // console.log('== || /api/set-appointment-completed || == dbResponse[0].result ==', dbResponse[0].result);

    // const finalData = dbResponse[0].result;

    // const rawJsonText = dbResponse?.?.response;

    // if (!finalData.success) {
    //   // Status 422 Unprocessable Entit sintaxa este corectă, dar ID-ul programării trimis în corpul cererii (body) este valid ca structură, dar inexistent.
    //   res.status(422).json(finalData);
    //   return;
    // }

    // const finalResult = JSON.parse(rawJsonText);

    // if (!finalResult.success) {
    //   res.status(400).json(finalResult);
    //   return;
    // }

    // res.json(finalData);

  } catch (error) {
    console.error('SET APPOINTMENT COMPLETED:', error);
    res.status(500).json({ 
      appointment_id: req.body?.appointment_id, 
      success: false, 
      message: 'a aparut o eroare la actualizarea datelor' 
    });
  }
});



router.get('/get-appointment-details', 
  authenticateToken, requireRole('admin', 'barber', 'customer'), validateQuery(appointmentDetailsSchema), async (req: AuthenticatedRequest, res) => {
  try {

    const q = (req as any).validatedQuery as z.infer<typeof appointmentDetailsSchema>;

    const result = await prisma.$queryRaw<QUERY_RAW_GET_APPOINTMENT_DETAILS_RESPONSE[]>`
      SELECT public.get_appointment_complete_details_json(
        ${q.appointment_id}
      ) AS result
    `;

    const finalResponse = result[0]?.result; 
    res.status(200).json(finalResponse);
 
  } catch (error) {
    console.error('Eroare la aducerea rezumat programare:', error);
    res.status(500).json({ error: 'Eroare la extragerea datelor.' });
  }
});


router.get('/get-barber-details', 
  authenticateToken, requireRole('admin'), validateQuery(barbersDetailsSchema),  async (req: AuthenticatedRequest, res) => {
  try {

    const q = (req as any).validatedQuery as z.infer<typeof barbersDetailsSchema>;
    
    const result = await prisma.$queryRaw<QUERY_RAW_GET_BARBER_DETAILS_RESPONSE[]>`
      SELECT public.get_barber_details(
        ${q.barber_id}
      ) AS result
    `;

    const finalResponse = result[0]?.result; 

    console.log("== || API /api/get-barber-details || == result == ", result);
    console.log("== || API /api/get-barber-details || == finalResponse == ", finalResponse);

    res.status(200).json(finalResponse);
     
  } catch (error) {
    console.error('Eroare la aducerea detalii frizer:', error);
    res.status(500).json({ error: 'Eroare la extragerea datelor.' });
  }
});



export default router;