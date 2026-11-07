import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { prisma } from '../config/db';
import { authenticateToken, AuthenticatedRequest } from '../middleware/auth';
import { QUERY_RAW_SET_BARBER_SPECIALITIES_RESPONSE } from '../interfaces/profile.interfaces';
import { changePasswordSchema, setSpecialtiesSchema, updateBarberProfileSchema, updateClientProfileSchema } from '../schemas/profile.schema';
import { validate } from '../middleware/validate';
import { requireRole } from '../middleware/require-role';

const router = Router();

// GET profilul propriu
router.get('/my-profile', authenticateToken, requireRole('barber'), async (req: AuthenticatedRequest, res) => {
  try {
    // if (req.user?.role !== 'barber') {
    //   res.status(403).json({ data: null, success: false, message: 'Acces interzis.' });
    //   return;
    // }

    const result = await prisma.$queryRaw<{ result: any }[]>`
      SELECT public.get_barber_profile_json(${req.user!.userId}) AS result
    `;

    const dbResponse = result[0]?.result

    // console.log("==|| API /barber-profile-details ||== result[0]?.result ==", result[0]?.result)
    // res.json(result[0]?.result);

    res.status(200).json(dbResponse);

  } catch (error) {
    console.error('Eroare la my-profile:', error);
    res.status(500).json({ data: null, success: false, message: 'Eroare internă.' });
  }
});


// PUT datele personale
router.put('/my-profile', authenticateToken, requireRole('barber'), validate(updateBarberProfileSchema), async (req: AuthenticatedRequest, res) => {
  try {

    const { first_name, last_name, phone, avatar_url, bio } = req.body;

    // console.log("==|| API UPDATE BARBER PROFILE ||== req.body ==", req.body)

    const result = await prisma.$queryRaw<{ result: any }[]>`
      SELECT public.update_barber_profile_json(
        ${req.user!.userId},
        ${first_name},
        ${last_name},
        ${phone},
        ${avatar_url || null},
        ${bio ?? ''}
      ) AS result
    `;

    const dbResponse = result[0]?.result;

    // console.log("==|| API UPDATE BARBER PROFILE ||== result[0]?.result ==", result[0]?.result)
    // res.json(result[0]?.result);

    res.status(200).json(dbResponse);

  } catch (error) {
    console.error('Eroare la update my-profile:', error);
    res.status(500).json({ data: null, success: false, message: 'Eroare internă.' });
  }
});


// PUT schimbare parolă
router.put('/my-password', authenticateToken, validate(changePasswordSchema), async (req: AuthenticatedRequest, res) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      res.status(401).json({ success: false, message: 'Neautentificat.' });
      return;
    }

    const { current_password, new_password } = req.body;

    // console.log("==|| my-password ||== req.body ==", req.body)

    // if (!current_password || !new_password || String(new_password).length < 8) {
    //   res.status(400).json({ success: false, message: 'Date invalide.' });
    //   return;
    // }

    const user = await prisma.users.findUnique({
      where: { id: userId },
      select: { password_hash: true },
    });

    if (!user || !(await bcrypt.compare(current_password, user.password_hash))) {
      res.status(400).json({ success: false, message: 'Parola curentă este incorectă.' });
      return;
    }

    await prisma.users.update({
      where: { id: userId },
      data: { password_hash: await bcrypt.hash(new_password, 10) },
    });

    res.status(200).json({ success: true, message: 'Parola a fost schimbată.' });
  } catch (error) {
    console.error('Eroare la schimbarea parolei:', error);
    res.status(500).json({ success: false, message: 'Eroare internă.' });
  }
});


router.post('/set-specialities', 
  authenticateToken, 
  requireRole('barber'),
  validate(setSpecialtiesSchema),
  async (req: AuthenticatedRequest, res) => {
    try {
      const p_specialty_ids = req.body.params.map((sp: { id: number }) => sp.id);

      // console.log("==|| API /set-specialities ||== p_specialty_ids ==", p_specialty_ids)

      const dbResponse = await prisma.$queryRaw<QUERY_RAW_SET_BARBER_SPECIALITIES_RESPONSE[]>`
        SELECT public.set_barber_specialties_json(
          ${req.user!.userId},
          ${p_specialty_ids}
        ) AS result
      `;

      const finalData = dbResponse[0].result;

      // if (!finalData.success) {
      //   res.status(422).json(finalData);
      //   return;
      // }

      res.status(200).json(finalData);

    } catch (error) {
      console.error('SET BARBER SPECIALTIES ERROR:', error);
      res.status(500).json({ 
        data: null, 
        success: false, 
        message: 'A apărut o eroare la actualizarea specializărilor.' 
      });
    }
});

router.get('/my-customer-profile', authenticateToken, requireRole('customer'), async (req: AuthenticatedRequest, res) => {
  try {


    const result = await prisma.$queryRaw<{ result: any }[]>`
      SELECT public.get_customer_profile_json(${req.user!.userId}) AS result
    `;

    // console.log("API /my-customer-profile == || result[0]?.result ||==", result[0]?.result)

    res.status(200).json(result[0]?.result);

  } catch (error) {
    console.error('Eroare la my-customer-profile:', error);
    res.status(500).json({ data: null, success: false, message: 'Eroare internă.' });
  }
});


router.put('/my-customer-profile', authenticateToken, requireRole('customer'), validate(updateClientProfileSchema), async (req: AuthenticatedRequest, res) => {
  try {

    // console.log("==|| PUT /my-customer-profile||== req.body ==", req.body)

    const { first_name, last_name, phone, avatar_url } = req.body;

    const result = await prisma.$queryRaw<{ result: any }[]>`
      SELECT public.update_customer_profile_json(
        ${req.user!.userId}, 
        ${first_name}, 
        ${last_name}, 
        ${phone},
        ${avatar_url}
      ) AS result
    `;

    // console.log("==|| PUT /my-customer-profile||== result[0]?.result == ", result[0]?.result)

    res.status(200).json(result[0]?.result);
  } catch (error) {
    console.error('Eroare la update customer profile:', error);
    res.status(500).json({ data: null, success: false, message: 'Eroare internă.' });
  }
});




export default router;
