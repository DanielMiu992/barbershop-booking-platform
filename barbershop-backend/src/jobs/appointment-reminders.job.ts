import { prisma } from "../config/db";
import cron from 'node-cron';

import { sendAppointmentReminderEmail, AppointmentReminderData, ReminderType } from '../utils/mail';

interface ReminderConfig {
  type: ReminderType;
  hoursAhead: number;
  windowMinutes: number;
}

const REMINDER_CONFIGS: ReminderConfig[] = [
  { type: '24h', hoursAhead: 24, windowMinutes: 60 },
  { type: '3h',  hoursAhead: 3,  windowMinutes: 60 },
];

async function processReminders(config: ReminderConfig): Promise<void> {
  try {
    const result = await prisma.$queryRaw<{ result: AppointmentReminderData[] }[]>`
      SELECT public.claim_appointment_reminders(
        ${config.type}, 
        ${config.hoursAhead}, 
        ${config.windowMinutes}
      ) AS result
    `;

    // console.log("==|| JOB /claim_appointment_reminders ||== result[0]?.result == ", result[0]?.result)
    const appointments = result[0]?.result ?? [];

    if (appointments.length === 0) return;

    console.log(`[reminders ${config.type}] ${appointments.length} programări de notificat.`);

    for (const appointment of appointments) {
      try {
        await sendAppointmentReminderEmail(appointment, config.type);
        console.log(`[reminders ${config.type}] Trimis către ${appointment.customer_email}`);
      } catch (err) {
        console.error(`[reminders ${config.type}] Eșec pentru ${appointment.customer_email}:`, err);
      }
    }
  } catch (error) {
    console.error(`[reminders ${config.type}] Eroare la rulare:`, error);
  }
}

export async function sendPendingReminders(): Promise<void> {
  for (const config of REMINDER_CONFIGS) {
    await processReminders(config);
  }
}

export function startReminderJob(): void {
  cron.schedule('0 * * * *', sendPendingReminders, {
    timezone: 'Europe/Bucharest',
  });

  console.log('Job-ul de remindere a pornit.');
}