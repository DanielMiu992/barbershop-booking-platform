import { prisma } from "../config/db";
import { ReviewInviteData, sendReviewInviteEmail } from "../utils/mail";
import cron from 'node-cron';

const REVIEW_HOURS_AFTER = 3;
const REVIEW_MAX_AGE_HOURS = 72;

export async function sendPendingReviewInvites(): Promise<void> {
  try {
    const result = await prisma.$queryRaw<{ result: ReviewInviteData[] }[]>`
      SELECT public.claim_review_invites(
        ${REVIEW_HOURS_AFTER}, 
        ${REVIEW_MAX_AGE_HOURS}
      ) AS result
    `;

    const invites = result[0]?.result ?? [];
    if (invites.length === 0) return;

    console.log(`[review-invites] ${invites.length} invitații de trimis.`);

    for (const invite of invites) {
      try {
        await sendReviewInviteEmail(invite);
        console.log(`[review-invites] Trimis către ${invite.customer_email}`);
      } catch (err) {
        console.error(`[review-invites] Eșec pentru ${invite.customer_email}:`, err);
      }
    }
  } catch (error) {
    console.error('[review-invites] Eroare la rulare:', error);
  }
}

export function startReminderJobReview(): void {
  cron.schedule('30 * * * *', sendPendingReviewInvites, { timezone: 'Europe/Bucharest' });

  console.log('Jobul de notificări REVIEW a pornit.');
}