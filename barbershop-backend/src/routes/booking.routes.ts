// import dotenv from 'dotenv';
import {Router} from 'express';
import { prisma } from '../config/db';
import jwt from 'jsonwebtoken';

import { 
  QUERY_RAW_AVAILABLE_SLOTS_LIST_RESPONSE, 
  QUERY_RAW_CREATE_APPOINTMENT_RESPONSE, 
  QUERY_RAW_UPSERT_GUEST_USER_RESPONSE 
} from '../interfaces/booking.interfaces';
import { generateCalendarUid, sendAppointmentConfirmationEmail } from '../utils/mail';
import { validate, validateQuery } from '../middleware/validate';
import { availableSlotsQuerySchema, createAppointmentSchema } from '../schemas/booking.schema';
import z from 'zod';
import rateLimit from 'express-rate-limit';

// dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET || 'secret_default';
const router = Router();

const publicSlotsLimiter = rateLimit({
  windowMs: 60 * 1000,
  limit: 60,          // generos — utilizatorii schimbă des data în calendar
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: { data: [], success: false, message: 'Prea multe cereri. Încearcă din nou în scurt timp.' },
});

const createAppointmentLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 5,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  skipFailedRequests: true,
  message: { data: null, success: false, message: 'Prea multe rezervări. Încearcă din nou mai târziu.' },
});


router.get('/get-available-slots', publicSlotsLimiter,
  validateQuery(availableSlotsQuerySchema), async (req, res) => {
  try {
    // const dateStr = req.query.date as string; // Format așteptat: "2026-06-25"

    const q = (req as any).validatedQuery as z.infer<typeof availableSlotsQuerySchema>;
    
    console.log("==|| API /get-available-slots ||== q ==", q)

    const dbResponse = await prisma.$queryRaw<QUERY_RAW_AVAILABLE_SLOTS_LIST_RESPONSE[]>`
      SELECT public.get_available_slots_json(
        ${q.barberId},
        ${q.date}::date,
        ${q.serviceIds}
      ) AS result
    `;

    console.log("==|| API /get-available-slots ||== dbResponse[0] ==", dbResponse[0])
    console.log("==|| API /get-available-slots ||== dbResponse[0].result ==", dbResponse[0].result)
    
    const availableSlots = dbResponse[0].result;
    
    res.status(200).json(availableSlots);

    // const { barberId, date, serviceIds } = req.query;

    // const parsedServiceIds = String(serviceIds ?? '')
    //   .split(',')
    //   .filter(Boolean)
    //   .map((id) => parseInt(id, 10));


    // const dbResponse = await prisma.$queryRaw<QUERY_RAW_AVAILABLE_SLOTS_LIST_RESPONSE[]>`
    //   SELECT public.get_available_slots_json(
    //     ${parseInt(String(barberId), 10)},
    //     ${String(date)}::date,
    //     ${parsedServiceIds}
    //   ) AS result
    // `;

    // const availableSlots = dbResponse[0].result;
    // res.json(availableSlots);

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Eroare la calcularea sloturilor disponibile.' });
  }
});



router.post('/create-appointment', createAppointmentLimiter,
  validate(createAppointmentSchema), async (req, res) => {
  try {
    const { serviceIds, barberId, dateStr, slotStr, guestUser } = req.body as z.infer<typeof createAppointmentSchema>;

    console.log("==|| API /create-appointment || == req.body ==", req.body);

    // 1. Validare rapidă a parametrilor esențiali ai programării
    if (!serviceIds || !barberId || !dateStr || !slotStr) {
      res.status(400).json({ error: 'Toate câmpurile (serviceId, barberId, dateStr, slotStr) sunt obligatorii.' });
      return;
    }

    let customerId: number | null = null;
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    // const parsedServiceIds = serviceIds.map((id: unknown) => parseInt(String(id), 10));


    // 2. Identificare utilizator prin Token (dacă există)
    if (token) {
      try {
        const decoded = jwt.verify(token, JWT_SECRET) as { userId: number };        
        customerId = decoded.userId;
      } catch (err) {
        res.status(401).json({ error: 'Sesiune expirată. Vă rugăm să vă reautentificați.' });
        return;
      }
    } 

    // 3. QUERY SEPARAT: Gestionare Guest utilizând funcția stocată dedicată
    if (!customerId) {

      if (!guestUser) {//|| !guestUser.email || !guestUser.first_name || !guestUser.last_name || !guestUser.phone
        res.status(400).json({ error: 'Pentru a rezerva fără cont, toate câmpurile de contact sunt obligatorii.' });
        return;
      }

      // const p_email = guestUser.email;
      // const p_first_name = guestUser.first_name; 
      // const p_last_name = guestUser.last_name;
      // const p_phone = guestUser.phone;

      const dbResponse = await prisma.$queryRaw<QUERY_RAW_UPSERT_GUEST_USER_RESPONSE[]>`
        SELECT public.upsert_guest_user(
          ${guestUser.email},
          ${guestUser.first_name},
          ${guestUser.last_name},
          ${guestUser.phone}
        ) AS result
      `;

      const userStatus = dbResponse[0]?.result;

      if (!userStatus || !userStatus.success || !userStatus.customer_id) {
        res.status(400).json({ error: userStatus?.message || 'A apărut o eroare la crearea utilizatorului.' });
        return;
      }
      customerId = userStatus.customer_id;
    }

    // 4. QUERY SEPARAT: Salvarea rezervării prin funcția ta existentă

    const calendarUid = generateCalendarUid();

    const dbResponse = await prisma.$queryRaw<QUERY_RAW_CREATE_APPOINTMENT_RESPONSE[]>`
      SELECT public.create_appointment_safe(
        ${customerId}, 
        ${barberId}, 
        ${serviceIds}, 
        ${dateStr}, 
        ${slotStr},
        ${calendarUid}
      ) AS result
    `;

    const appointmentStatus = dbResponse[0]?.result;

    console.log("==|| appointment data API ||==", appointmentStatus);
    console.log("==|| calendarUid API ||==", calendarUid);



    if (!appointmentStatus || !appointmentStatus?.success || !appointmentStatus.data) {
      res.status(409).json(appointmentStatus);
      return;
    }

    const appointment = appointmentStatus.data;


    sendAppointmentConfirmationEmail({
      customer_email: appointment.customer_email,
      customer_first_name: appointment.customer_first_name,
      barber_name: appointment.barber_name,
      service_name: appointment.services_names,
      service_duration: appointment.total_duration,
      service_price: appointment.total_price,
      start_time: appointment.start_time,
      start_time_iso: appointment.start_time_iso,
      end_time_iso: appointment.end_time_iso,
      calendar_uid: calendarUid
    }).catch((err) => {
      console.error('Eroare la trimiterea emailului de confirmare:', err);
    });

    // 5. Răspunsul personalizat în caz de succes
    res.status(201).json(appointmentStatus);

  } catch (error) {
    console.error('API APPOINTMENTS ERROR:', error);
    res.status(500).json({ data: null, success: false, message: 'Eroare internă de server la procesarea programării' });
  }
});



export default router;
