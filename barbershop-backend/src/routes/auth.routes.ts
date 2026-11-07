import { Router } from 'express';
//import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '../config/db';
import { QUERY_RAW_CLAIM_ACCOUNT_RESPONSE, QUERY_RAW_LOGIN_RESPONSE, QUERY_RAW_REGISTER_RESPONSE } from '../interfaces/auth.interfaces';
import { validate } from '../middleware/validate';
import { claimAccount, registerSchema } from '../schemas/auth.schema';
import z from 'zod';
import rateLimit from 'express-rate-limit';


const JWT_SECRET = process.env.JWT_SECRET as string; // checked at startup in server.ts

const router = Router();

const registerLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  limit: 5,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  skipFailedRequests: true,
  message: { id: null, success: false, message: 'Prea multe încercări de înregistrare. Încearcă mai târziu.' },
});


const claimAccountLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 5,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  skipFailedRequests: true,
  message: { id: null, success: false, message: 'Prea multe încercări. Încearcă din nou mai târziu.' },
});

// validate(registerSchema),
router.post('/register', registerLimiter, validate(registerSchema), async (req, res) => {
  try {

    const {first_name, last_name, email, phone, password} = req.body as z.infer<typeof registerSchema>;
  
    const p_password_hash = await bcrypt.hash(password, 10);

    // Apelăm funcția stocată actualizată
    const dbResponse = await prisma.$queryRaw<QUERY_RAW_REGISTER_RESPONSE[]>`
      SELECT public.register_user_json(
        ${email},
        ${p_password_hash},
        ${first_name},
        ${last_name},
        ${phone},
        ${'customer'}
      ) AS result
    `;

    const finalData = dbResponse[0].result;

    res.json(finalData);

  } catch (error) {
    console.error('REGISTER ROUTE ERROR:', error);
    res.status(500).json({ id: null, error: 'Eroare la înregistrare.' });
  }
});



router.post('/claim-account', claimAccountLimiter, validate(claimAccount), async (req, res) => {
  try {

    // console.log('== || /api/claim-account || == req.body', req.body);
    const { email, password } = req.body as z.infer<typeof claimAccount>

    const p_password_hash = await bcrypt.hash(password, 10);

    const dbResponse = await prisma.$queryRaw<QUERY_RAW_CLAIM_ACCOUNT_RESPONSE[]>`
      SELECT public.claim_customer_account_json(
        ${email},
        ${p_password_hash}
      ) AS result
    `;

    console.log('== || /api/claim-account || == dbResponse ==', dbResponse);
    console.log('== || /api/claim-account || == dbResponse[0].result ==', dbResponse[0].result);
    

    const finalData = dbResponse[0].result;

    if (!finalData.success && finalData.code == "mt1") {
      res.status(422).json(finalData);
      return;
    }

    res.status(200).json(finalData);

  } catch (error) {
    console.error('CLAIM ACCOUNT ROUTE ERROR:', error);
    res.status(500).json({ id: null, success: false, message: 'Eroare internă de server la activarea contului' });
  }
});


router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({ error: 'Email-ul și parola sunt obligatorii.' });
      return;
    }


    console.log('== || /api/login || == req.body', req.body);

    // 1. Apelăm funcția stocată pentru a aduce datele utilizatorului într-o singură operație optimizată
    const dbResponse = await prisma.$queryRaw<QUERY_RAW_LOGIN_RESPONSE[]>`
      SELECT public.get_user_for_login_json(${email}) AS result
    `;

    console.log('== || /api/login || == dbResponse ==', dbResponse);
    console.log('== || /api/login || == dbResponse[0].result == ', dbResponse[0].result);



    const userData = dbResponse[0].result;


    //Dacă utilizatorul nu există în baza de date
    if (!userData.success) {
      res.status(401).json({ error: 'Email sau parolă incorectă.' });
      return;
    }

    // 2. Verificăm validitatea parolei în Node.js (izolat de CPU-ul bazei de date)
    const isPasswordValid = await bcrypt.compare(password, userData.user_data!.password_hash);
    if (!isPasswordValid) {
      res.status(401).json({ error: 'Email sau parolă incorectă.' });
      return;
    }

    // 3. Generăm token-ul JWT valabil 24h
    const token = jwt.sign(
      { userId: userData.user_data?.id, role: userData.user_data?.role },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    // 4. Trimitem răspunsul curat către frontend, fără a expune vreodată hash-ul parolei
    res.json({
      token,
      user: {
        first_name: userData.user_data?.first_name,
        last_name: userData.user_data?.last_name,
        role: userData.user_data?.role,
        user_id: userData.user_data?.id
      }
    });

  } catch (error) {
    console.error('LOGIN ROUTE ERROR:', error);
    res.status(500).json({ error: 'Eroare la autentificare.' });
  }
});




export default router;
