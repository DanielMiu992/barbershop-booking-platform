import { Router } from 'express';
import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import { prisma } from '../config/db';
import { sendAccountClaimEmail, sendPasswordResetEmail } from '../utils/mail';
import rateLimit from 'express-rate-limit';

const router = Router();

function hashToken(token: string): string {
  return crypto.createHash('sha256').update(token).digest('hex');
}

const TOKEN_TTL_MINUTES = 10;


const claimLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,  // 15 minute
  limit: 3,
  standardHeaders: 'draft-7', //trimite RateLimit-* în răspuns, ceea ce ajută dacă vrei să afișezi în frontend cât mai are de așteptat.
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Prea multe cereri de resetare. Încearcă din nou peste 15 minute.',
  },
  // Numărăm doar cererile care chiar au declanșat trimiterea unui email
  skipFailedRequests: true, //cererile cu răspuns 4xx/5xx nu consumă din cotă. Util pentru că un email lipsă sau invalid (400) nu trimite nimic, deci nu are rost să penalizeze utilizatorul legitim care a greșit o dată la tastare
});


const claimEmailLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,  // 1 oră
  limit: 3,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  keyGenerator: (req) => {
    const email = typeof req.body?.email === 'string' 
      ? req.body.email.trim().toLowerCase() 
      : '';
    return `reset:${email}`;
  },
  message: {
    success: false,
    message: 'Prea multe cereri pentru această adresă. Încearcă din nou mai târziu.',
  },
  skipFailedRequests: true,
});


router.post('/claim-request', claimLimiter, claimEmailLimiter, async (req, res) => {
  try {
    const { email } = req.body;

    // console.log("==|| API /forgot-password ||== forgotPasswordLimiter ==", forgotPasswordLimiter);
    // console.log("==|| API /forgot-password ||== forgotPasswordEmailLimiter ==", forgotPasswordEmailLimiter);

    if (!email || typeof email !== 'string') {
      res.status(400).json({ success: false, message: 'Adresa de email este obligatorie.' });
      return;
    }

    const rawToken = crypto.randomBytes(32).toString('hex');

    const result = await prisma.$queryRaw<{ result: any }[]>`
      SELECT public.create_password_reset_token(
        ${email},
        ${hashToken(rawToken)},
        ${TOKEN_TTL_MINUTES},
        ${'claim'}
      ) AS result
    `;

    const data = result[0]?.result;

    console.log("==|| API /claim-request ||== data ==", data);


    if (data?.found) {
      const claimtUrl = `${process.env.FRONTEND_URL}/complete-claim?token=${rawToken}`;
      await sendAccountClaimEmail(data.email, data.first_name, claimtUrl);
    }

    res.json({
      success: true,
      message: 'Dacă adresa există în sistem, vei primi un email cu instrucțiuni.',
    });
  } catch (error) {
    console.error('Eroare la forgot-password:', error);
    res.status(500).json({ success: false, message: 'Eroare la procesarea cererii.' });
  }
});



router.get('/validate-claim-token', async (req, res) => {
  try {
    const { token } = req.query;

    if (!token || typeof token !== 'string') {
      res.json({ valid: false });
      return;
    }

    const record = await prisma.password_reset_tokens.findUnique({
      where: { token_hash: hashToken(token), purpose: 'claim' },
    });

    //const valid = !!record && record.used_at === null && record.expires_at > new Date();

    const valid = !!record 
              && record.purpose === 'claim'
              && record.used_at === null 
              && record.expires_at > new Date();


    res.json({ valid });

  } catch (error) {
    console.error('Eroare la validate-claim-token:', error);
    res.status(500).json({ valid: false });
  }
});



router.post('/complete-claim', async (req, res) => {
  try {
    const { token, password } = req.body;

    if (!token || typeof token !== 'string' || 
        !password || typeof password !== 'string' || password.length < 8) {
      res.status(400).json({ success: false, message: 'Date invalide.' });
      return;
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const result = await prisma.$queryRaw<{ result: { success: boolean } }[]>`
      SELECT public.consume_password_reset_token(
        ${hashToken(token)},
        ${passwordHash},
        ${'claim'}
      ) AS result
    `;

    if (!result[0]?.result?.success) {
      res.status(400).json({
        success: false,
        message: 'Link-ul de claim este invalid sau a expirat.',
      });
      return;
    }

    res.json({ success: true, message: 'Parola a fost setata cu succes.' });
  } catch (error) {
    console.error('Eroare la complete-claim:', error);
    res.status(500).json({ success: false, message: 'Eroare la setarea parolei.' });
  }
});

export default router;