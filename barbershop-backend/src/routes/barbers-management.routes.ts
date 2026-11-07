import {Router} from 'express';
import { AuthenticatedRequest, authenticateToken } from '../middleware/auth';
import { prisma } from '../config/db';
import bcrypt from 'bcryptjs';


const router = Router();

import {
  QUERY_RAW_BARBERS_LIST_RESULT, 
  QUERY_RAW_SAVE_BARBER_DATA_RESULT, 
  QUERY_RAW_SET_BARBER_SCHEDULE_RESPONSE, 
  QUERYRAW_BARBER_SCHEDULE_LIST_RESPONSE
} from '../interfaces/barbers-management.interfaces'
import { avatarUpload, deleteAvatarFile } from '../config/upload';
import { requireRole } from '../middleware/require-role';
import { validate, validateFile, validateQuery } from '../middleware/validate';
import { avatarFileSchema, barberDetailsSchema, barbersAppointmentsQuerySchema, setBarberScheduleSchema, upsertBarberSchema } from '../schemas/barbers-management.schema';
import z from 'zod';

router.get('/get-barbers-list', 
  authenticateToken, requireRole('admin'), validateQuery(barbersAppointmentsQuerySchema), async (req: AuthenticatedRequest, res) => {
  try {

    const q = (req as any).validatedQuery as z.infer<typeof barbersAppointmentsQuerySchema>;
    // console.log("==|| API /get-barbers-list || == q ==", q)

    const dbResponse = await prisma.$queryRaw<QUERY_RAW_BARBERS_LIST_RESULT[]>`
      SELECT public.get_barbers_list_json(
        ${q.search ?? null}, 
        ${q.active ?? null}, 
        ${q.rows}, 
        ${q.first},
        ${q.sortField ?? null},
        ${q.sortOrder ?? null}
      ) AS result
    `;

    // ${q.rows}, - limit
    // ${q.first},- offset

    const finalResponse = dbResponse[0]?.result || { data: [], total: 0 };
    
    res.status(200).json(finalResponse);

  } catch (error) {
    console.error('Eroare la filtrarea frizerilor:', error);
    res.status(500).json({ error: 'Eroare internă de server.' });
  }
});


// router.post('/upload-avatar', authenticateToken, requireRole('admin', 'barber', 'customer'), (req: AuthenticatedRequest, res) => {
//   console.log("==|| API /upload-avatary")
//   if (!['admin', 'barber', 'customer'].includes(req.user?.role ?? '')) {
//     res.status(403).json({ success: false, message: 'Acces interzis.' });
//     return;
//   }

//   avatarUpload.single('avatar')(req, res, (err) => {
//     if (err) {
//       res.status(400).json({ success: false, message: err.message });
//       return;
//     }
//     if (!req.file) {
//       res.status(400).json({ success: false, message: 'Niciun fișier primit.' });
//       return;
//     }

//     res.json({
//       success: true,
//       avatar_url: `/uploads/avatars/${req.file.filename}`,
//     });
//   });
// });

router.post('/upload-avatar', 
  authenticateToken, 
  requireRole('admin', 'barber', 'customer'),  
  (req: AuthenticatedRequest, res) => {

    avatarUpload.single('avatar')(req, res, (err) => {
      if (err) {
        res.status(400).json({ 
          success: false, 
          message: err.message 
        });
        return;
      }
      if (!req.file) {
        res.status(400).json({ 
          success: false, 
          message: 'Niciun fișier primit' 
        });
        return;
      }

      res.json({
        success: true,
        avatar_url: `/uploads/avatars/${req.file.filename}`,
      });
    });
  },
  validateFile(avatarFileSchema),
  (req: AuthenticatedRequest, res) => {
    res.json({
      success: true,
      avatar_url: `/uploads/avatars/${req.file!.filename}`,
    });
  }
);

// validate(upsertBarberSchema),

router.post('/save-barber-data', 
  authenticateToken, requireRole('admin'), validate(upsertBarberSchema), async (req: AuthenticatedRequest, res) => {
  try {


    const { id, first_name, last_name, email, phone, password, avatar_url, is_active } = req.body as z.infer<typeof upsertBarberSchema>;
    const p_id = id || null;

    console.log("== || API /api/save-barber-data || == p_id ==", p_id)
    console.log("== || API /api/save-barber-data || == req.body ==", req.body)


    if (p_id && avatar_url) {
      const existing = await prisma.users.findUnique({ 
        where: { id: p_id }, 
        select: { avatar_url: true } 
      });
      if (existing?.avatar_url && existing.avatar_url !== avatar_url) {
        deleteAvatarFile(existing.avatar_url);
      }
    }

    const p_password_hash = password ? await bcrypt.hash(password, 10) : null;

    // console.log("== || API /api/save-barber-data || == p_password_hash ==", p_password_hash)


    const dbResponse = await prisma.$queryRaw<QUERY_RAW_SAVE_BARBER_DATA_RESULT[]>`
      SELECT public.upsert_barber_json(
        ${p_id},
        ${first_name},
        ${last_name},
        ${avatar_url || null},
        ${is_active},
        ${email},
        ${p_password_hash},
        ${phone}
      ) AS result
    `;

    const finalData = dbResponse[0].result;

    console.log(" == || API /api/save-barber-data || == dbResponse == ", dbResponse);

    res.status(200).json(finalData);


    // const {id, last_name, first_name, email, phone, password, avatar_url, is_active } = req.body;

    // const activeStatus = is_active !== undefined ? filterToBoolean(is_active) : true;
    // const p_id = id ? parseInt(String(id)) : null;

    // if (p_id && avatar_url) {
    //   const existing = await prisma.users.findUnique({ 
    //     where: { id: p_id }, 
    //     select: { avatar_url: true } 
    //   });
    //   if (existing?.avatar_url && existing.avatar_url !== avatar_url) {
    //     deleteAvatarFile(existing.avatar_url);
    //   }
    // }

    // Helper simplu pentru parsarea booleană din body
    // function filterToBoolean(val: any): boolean {
    //   return val === true || val === 'true' || val === 1 || val === '1';
    // }

    // console.log("== || /api/save-barber-data || == activeStatus ==", activeStatus)
    // console.log("== || /api/save-barber-data || == id ==", id)

    // const p_password_hash = password ? await bcrypt.hash(password, 10) : null;

    // 3. Executăm funcția stocată din PostgreSQL utilizând Prisma
    // const dbResponse = await prisma.$queryRaw<QUERY_RAW_SAVE_BARBER_DATA_RESULT[]>`
    //   SELECT public.upsert_barber_json(
    //     ${p_id},
    //     ${first_name},
    //     ${last_name},
    //     ${avatar_url || null},
    //     ${activeStatus},
    //     ${email},
    //     ${p_password_hash},
    //     ${phone}
    //   ) AS result
    // `;

    //  console.log(" == || /api/save-barber-data || == dbResponse == ", dbResponse);

    //  const finalData = dbResponse[0].result;

    //  res.json(finalData);

    // if (!rawJsonText) {
    //   res.status(500).json({ id: null, success: false, message: 'a aparut o eroare la salvarea inregistrarii' });
    //   return;
    // }

    // const finalData = JSON.parse(rawJsonText);

    // 4. Întoarcem direct structura dictată de baza de date
    // if (!finalData.success) {
    //   res.status(400).json(finalData);
    //   return;
    // }

    // res.status(200).json(finalData);

  } catch (error) {
    console.error('API UPSERT BARBER ERROR:', error);
    res.status(500).json({ id: null, success: false, message: 'a aparut o eroare la salvarea inregistrarii' });
  }
});



router.get('/get-barber-schedule', 
  authenticateToken, requireRole('admin'), validate(barberDetailsSchema), async (req: AuthenticatedRequest, res) => {
  try {

    const q = (req as any).validatedQuery as z.infer<typeof barberDetailsSchema>;

    const dbResponse = await prisma.$queryRaw<QUERYRAW_BARBER_SCHEDULE_LIST_RESPONSE[]>`
      SELECT public.get_barber_schedule_json(${q.p_barber_id}) AS result
    `;

    const finalData = dbResponse[0].result;
    
    res.status(200).json(finalData);

    console.log("== || /api/get-barber-schedule || == dbResponse[0].result ==", dbResponse[0].result)

    // if (req.user?.role !== 'admin') {
    //   res.status(403).json({ data: null, success: false , message: 'Acces interzis. Necesită drepturi de administrator.'});
    //   return;
    // }

    // console.log("== || /api/get-barber-schedule || == REQUEST RECEIVED req.query==", req.query)

    // const p_barber_id = parseInt(String(req.query.p_barber_id));
    // const dbResponse = await prisma.$queryRaw<QUERYRAW_BARBER_SCHEDULE_LIST_RESPONSE[]>`
    //   SELECT public.get_barber_schedule_json(${p_barber_id}) AS result
    // `;
    // console.log("== || /api/get-barber-schedule || == dbResponse[0].result ==", dbResponse[0].result)
    // const finalData = dbResponse[0].result;

    // res.json(finalData);

  } catch (error) {
    console.error('LOAD BARBER SCHEDULE ERROR:', error);
    res.status(500).json({ data: null, success: false });
  }
});



router.post('/set-barber-schedule', 
  authenticateToken, requireRole('admin'), validate(setBarberScheduleSchema), async (req: AuthenticatedRequest, res) => {
  try {

    console.log("== || /api/set-barber-schedule || == REQUEST RECEIVED req.body ==", req.body)

    const { p_barber_id, schedule } = req.body as z.infer<typeof setBarberScheduleSchema>;

    const activeDays = schedule.filter((day) => day.is_active);

    const p_days_of_week = activeDays.map((d) => d.day_of_week);
    const p_starts_hour = activeDays.map((d) => d.start_hour); 
    const p_ends_hour = activeDays.map((d) => d.end_hour);

    const dbResponse = await prisma.$queryRaw<QUERY_RAW_SET_BARBER_SCHEDULE_RESPONSE[]>`
      SELECT public.save_barber_schedule_fast_json(
        ${p_barber_id}, 
        ${p_days_of_week}, 
        ${p_starts_hour}, 
        ${p_ends_hour}
      ) AS result
    `;

    console.log("== || /api/set-barber-schedule || == dbResponse ==", dbResponse)
    console.log("== || /api/set-barber-schedule || == dbResponse[0].result ==", dbResponse[0].result)

   const finalData = dbResponse[0].result;

   res.status(200).json(finalData);



    // const p_barber_id = parseInt(String(req.body.p_barber_id));
    // const { schedule } = req.body;
    // const activeDays = schedule.filter((day: any) => day.is_active === true);
    // const p_days_of_week = activeDays.map((d: any) => parseInt(d.day_of_week));
    // const p_starts_hour = activeDays.map((d: any) => d.start_hour); 
    // const p_ends_hour = activeDays.map((d: any) => d.end_hour);

    // const dbResponse = await prisma.$queryRaw<QUERY_RAW_SET_BARBER_SCHEDULE_RESPONSE[]>`
    //   SELECT public.save_barber_schedule_fast_json(
    //     ${p_barber_id}, 
    //     ${p_days_of_week}, 
    //     ${p_starts_hour}, 
    //     ${p_ends_hour}
    //   ) AS result
    // `;

    // console.log("== || /api/set-barber-schedule || == dbResponse ==", dbResponse)
    // const finalData = dbResponse[0].result;
    // res.json(finalData);

  } catch (error) {
    console.error('SCHEDULE SAVE ERROR:', error);
    res.status(500).json({ success: false, message: 'a aparut o eroare la salvarea datelor' });
  }
});









export default router;