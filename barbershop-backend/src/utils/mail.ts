import ical, { ICalCalendarMethod } from 'ical-generator';
import nodemailer from 'nodemailer';


import crypto from 'crypto';

export function generateCalendarUid(): string {
  const domain = new URL(process.env.FRONTEND_URL ?? 'http://localhost').hostname;
  return `${crypto.randomBytes(16).toString('hex')}@${domain}`;
}


// const transporter = nodemailer.createTransport({
//   host: process.env.SMTP_HOST,
//   port: Number(process.env.SMTP_PORT ?? 587),
//   secure: process.env.SMTP_SECURE === 'true',
//   auth: {
//     user: process.env.SMTP_USER,
//     pass: process.env.SMTP_PASS,
//   },
// });

const transporter = nodemailer.createTransport({
    host: 'smtp.ethereal.email',
    port: 587,
    auth: {
        user: 'eddie.pacocha@ethereal.email',
        pass: '1yRK8tyVTYNXvyFnGJ'
    }
});


export type ReminderType = '24h' | '3h';
export type CancelledBy = 'customer' | 'admin' | 'barber';

export interface AppointmentReminderData {
  customer_email: string;
  customer_first_name: string;
  barber_name: string;
  service_name: string;
  service_duration: number;
  service_price: number;
  start_time: string;
  start_time_iso: string;
  end_time_iso: string;
  calendar_uid: string;
}


export interface AppointmentCancellationData {
  cancelled_by: CancelledBy;
  reason: string | null;
  customer_email: string;
  customer_first_name: string;
  customer_name: string;
  barber_email: string;
  barber_first_name: string;
  barber_name: string;
  service_name: string;
  service_price: number;
  start_time: string;
  calendar_uid: string;
  start_time_iso: string;
  end_time_iso: string

}

export interface ReviewInviteData {
  appointment_id: number;
  customer_email: string;
  customer_first_name: string;
  barber_name: string;
  service_name: string;
  appointment_date: string;
}


interface CalendarEventData {
  uid: string;
  start_time_iso: string;
  end_time_iso: string;
  service_name: string;
  barber_name: string;
  service_duration?: number;
  service_price?: number;
}



export async function sendAccountClaimEmail(to: string, firstName: string, claimUrl: string) {
  await transporter.sendMail({
    from: process.env.SMTP_FROM,
    to,
    subject: 'Activează-ți contul - Barbershop',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px;">
        <h2>Activează-ți contul</h2>
        <p>Bună, ${firstName},</p>
        <p>Ai făcut rezervări la salonul nostru folosind această adresă de email.
           Îți poți activa contul ca să vezi istoricul programărilor și să rezervi mai ușor data viitoare.</p>
        <p style="margin: 24px 0;">
          <a href="${claimUrl}" 
             style="background:#2563eb;color:#fff;padding:12px 24px;
                    text-decoration:none;border-radius:6px;display:inline-block;">
            Activează contul
          </a>
        </p>
        <p style="color:#666;font-size:14px;">
          Link-ul expiră în 10 de minute și poate fi folosit o singură dată.<br>
          Dacă nu ai cerut tu activarea, ignoră acest email.
        </p>
      </div>
    `,
  });
}


export async function sendPasswordResetEmail(to: string, firstName: string, resetUrl: string) {
  await transporter.sendMail({
    from: process.env.SMTP_FROM,
    to,
    subject: 'Resetare parolă - Barbershop',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px;">
        <h2>Resetare parolă</h2>
        <p>Bună, ${firstName},</p>
        <p>Am primit o cerere de resetare a parolei pentru contul tău. 
           Apasă butonul de mai jos pentru a-ți seta o parolă nouă:</p>
        <p style="margin: 24px 0;">
          <a href="${resetUrl}" 
             style="background:#2563eb;color:#fff;padding:12px 24px;
                    text-decoration:none;border-radius:6px;display:inline-block;">
            Resetează parola
          </a>
        </p>
        <p style="color:#666;font-size:14px;">
          Link-ul expiră în 10 de minute și poate fi folosit o singură dată.<br>
          Dacă nu ai cerut tu resetarea, ignoră acest email — parola rămâne neschimbată.
        </p>
      </div>
    `,
  });
}


export async function sendAppointmentReminderEmail(data: AppointmentReminderData, type: ReminderType) {
  const isUrgent = type === '3h';

  const subject = isUrgent
    ? `Programarea ta este în curând - astăzi la ${data.start_time.split(' ')[1]}`
    : `Reminder: programarea ta de mâine, ${data.start_time}`;

  const heading = isUrgent ? 'Ne vedem în curând!' : 'Ne vedem mâine!';

  const intro = isUrgent
    ? 'Îți reamintim că programarea ta este peste câteva ore:'
    : 'Îți reamintim că ai o programare mâine la salonul nostru:';

  const footer = isUrgent
    ? `<p style="color:#666;font-size:14px;">
         Te așteptăm! Dacă întârzii sau nu mai poți ajunge, sună-ne cât mai repede.
       </p>`
    : `<p style="color:#666;font-size:14px;">
         Dacă nu mai poți ajunge, te rugăm să anulezi programarea din contul tău,
         ca să putem oferi intervalul altui client.
       </p>`;

  await transporter.sendMail({
    from: process.env.SMTP_FROM,
    to: data.customer_email,
    subject,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px;">
        <h2>${heading}</h2>
        <p>Bună, ${data.customer_first_name},</p>
        <p>${intro}</p>
        <table style="border-collapse:collapse;margin:20px 0;width:100%;">
          <tr>
            <td style="padding:8px 12px;border:1px solid #e5e7eb;background:#f9fafb;"><strong>Data și ora</strong></td>
            <td style="padding:8px 12px;border:1px solid #e5e7eb;">${data.start_time}</td>
          </tr>
          <tr>
            <td style="padding:8px 12px;border:1px solid #e5e7eb;background:#f9fafb;"><strong>Serviciu</strong></td>
            <td style="padding:8px 12px;border:1px solid #e5e7eb;">${data.service_name}</td>
          </tr>
          <tr>
            <td style="padding:8px 12px;border:1px solid #e5e7eb;background:#f9fafb;"><strong>Frizer</strong></td>
            <td style="padding:8px 12px;border:1px solid #e5e7eb;">${data.barber_name}</td>
          </tr>
          <tr>
            <td style="padding:8px 12px;border:1px solid #e5e7eb;background:#f9fafb;"><strong>Durată</strong></td>
            <td style="padding:8px 12px;border:1px solid #e5e7eb;">${data.service_duration} minute</td>
          </tr>
          <tr>
            <td style="padding:8px 12px;border:1px solid #e5e7eb;background:#f9fafb;"><strong>Preț</strong></td>
            <td style="padding:8px 12px;border:1px solid #e5e7eb;">${data.service_price} RON</td>
          </tr>
        </table>
        ${footer}
        <p style="margin:24px 0;">
          <a href="${process.env.FRONTEND_URL}/customer-history"
             style="background:#2563eb;color:#fff;padding:12px 24px;
                    text-decoration:none;border-radius:6px;display:inline-block;">
            Vezi programările mele
          </a>
        </p>
      </div>
    `,
  });
}


// function buildAppointmentIcs(data: AppointmentReminderData): string {
//   const calendar = ical({ name: 'Barbershop' });

//   calendar.createEvent({
//     start: new Date(data.start_time_iso),
//     end: new Date(data.end_time_iso),
//     timezone: 'Europe/Bucharest',
//     summary: `Programare: ${data.service_name}`,
//     description:
//       `Frizer: ${data.barber_name}\n` +
//       `Servicii: ${data.service_name}\n` +
//       `Durată: ${data.service_duration} minute\n` +
//       `Preț: ${data.service_price} RON`,
//     location: process.env.SALON_ADDRESS ?? 'Barbershop',
//     url: `${process.env.FRONTEND_URL}/customer-history`,
//   });

//   return calendar.toString();
// }


function buildIcs(data: CalendarEventData, method: ICalCalendarMethod, sequence = 0): string {
  const calendar = ical({ name: 'Barbershop', method });

  calendar.createEvent({
    id: data.uid,                    // ← acelaşi UID la creare și anulare
    sequence,                        // ← incrementat la anulare
    start: new Date(data.start_time_iso),
    end: new Date(data.end_time_iso),
    timezone: 'Europe/Bucharest',
    summary: `Programare: ${data.service_name}`,
    description:
      `Frizer: ${data.barber_name}\n` +
      `Servicii: ${data.service_name}` +
      (data.service_duration ? `\nDurată: ${data.service_duration} minute` : '') +
      (data.service_price ? `\nPreț: ${data.service_price} RON` : ''),
    location: process.env.SALON_ADDRESS ?? 'Barbershop',
    url: `${process.env.FRONTEND_URL}/customer-history`,
  });

  return calendar.toString();
}


export async function sendAppointmentConfirmationEmail(data: AppointmentReminderData) {
  // const icsContent = buildAppointmentIcs(data);

  const icsContent = buildIcs({
    uid: data.calendar_uid,
    start_time_iso: data.start_time_iso,
    end_time_iso: data.end_time_iso,
    service_name: data.service_name,
    barber_name: data.barber_name,
    service_duration: data.service_duration,
    service_price: data.service_price,
  }, ICalCalendarMethod.REQUEST, 0);

  await transporter.sendMail({
    from: process.env.SMTP_FROM,
    to: data.customer_email,
    subject: `Programare confirmată - ${data.start_time}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px;">
        <h2>Programarea ta este confirmată</h2>
        <p>Bună, ${data.customer_first_name},</p>
        <p>Îți mulțumim pentru rezervare! Iată detaliile programării tale:</p>
        <table style="border-collapse:collapse;margin:20px 0;width:100%;">
          <tr>
            <td style="padding:8px 12px;border:1px solid #e5e7eb;background:#f9fafb;"><strong>Data și ora</strong></td>
            <td style="padding:8px 12px;border:1px solid #e5e7eb;">${data.start_time}</td>
          </tr>
          <tr>
            <td style="padding:8px 12px;border:1px solid #e5e7eb;background:#f9fafb;"><strong>Serviciu</strong></td>
            <td style="padding:8px 12px;border:1px solid #e5e7eb;">${data.service_name}</td>
          </tr>
          <tr>
            <td style="padding:8px 12px;border:1px solid #e5e7eb;background:#f9fafb;"><strong>Frizer</strong></td>
            <td style="padding:8px 12px;border:1px solid #e5e7eb;">${data.barber_name}</td>
          </tr>
          <tr>
            <td style="padding:8px 12px;border:1px solid #e5e7eb;background:#f9fafb;"><strong>Durată</strong></td>
            <td style="padding:8px 12px;border:1px solid #e5e7eb;">${data.service_duration} minute</td>
          </tr>
          <tr>
            <td style="padding:8px 12px;border:1px solid #e5e7eb;background:#f9fafb;"><strong>Preț</strong></td>
            <td style="padding:8px 12px;border:1px solid #e5e7eb;">${data.service_price} RON</td>
          </tr>
        </table>
        <p style="color:#666;font-size:14px;">
          Îți vom trimite un reminder cu o zi înainte. Dacă planurile se schimbă,
          poți anula programarea din contul tău.
        </p>
        <p style="margin:24px 0;">
          <a href="${process.env.FRONTEND_URL}/customer-history"
             style="background:#2563eb;color:#fff;padding:12px 24px;
                    text-decoration:none;border-radius:6px;display:inline-block;">
            Vezi programările mele
          </a>
        </p>
      </div>
    `,
    icalEvent: {
      filename: 'programare.ics',
      method: 'REQUEST',
      content: icsContent,
    },

  });  
}

// Anulare de către salon -> notificăm clientul
export async function sendCancellationToCustomer(data: AppointmentCancellationData) {
  const icsContent = data.calendar_uid
    ? buildIcs({
        uid: data.calendar_uid,
        start_time_iso: data.start_time_iso,
        end_time_iso: data.end_time_iso,
        service_name: data.service_name,
        barber_name: data.barber_name,
      }, ICalCalendarMethod.CANCEL, 1)
    : null;

  
  await transporter.sendMail({
    from: process.env.SMTP_FROM,
    to: data.customer_email,
    subject: `Programarea ta din ${data.start_time} a fost anulată`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px;">
        <h2>Programare anulată</h2>
        <p>Bună, ${data.customer_first_name},</p>
        <p>Ne pare rău să te anunțăm că programarea ta a fost anulată de către salon:</p>
        ${cancellationDetailsTable(data, false)}
        <p>Te invităm să faci o nouă rezervare la o dată care îți convine.</p>
        <p style="margin:24px 0;">
          <a href="${process.env.FRONTEND_URL}/booking"
             style="background:#2563eb;color:#fff;padding:12px 24px;
                    text-decoration:none;border-radius:6px;display:inline-block;">
            Fă o programare nouă
          </a>
        </p>
      </div>
    `,
    ...(icsContent && {
      icalEvent: { filename: 'anulare.ics', method: 'CANCEL', content: icsContent },
    }),
  });
}


function cancellationDetailsTable(data: AppointmentCancellationData, showCustomer: boolean): string {
  const rows = [
    ['Data și ora', data.start_time],
    ['Serviciu', data.service_name],
    showCustomer ? ['Client', data.customer_name] : ['Frizer', data.barber_name],
  ];

  return `
    <table style="border-collapse:collapse;margin:20px 0;width:100%;">
      ${rows.map(([label, value]) => `
        <tr>
          <td style="padding:8px 12px;border:1px solid #e5e7eb;background:#f9fafb;"><strong>${label}</strong></td>
          <td style="padding:8px 12px;border:1px solid #e5e7eb;">${value}</td>
        </tr>
      `).join('')}
    </table>
    ${data.reason ? `
      <p style="padding:12px;background:#fef3c7;border-radius:6px;">
        <strong>Motivul anulării:</strong> ${data.reason}
      </p>` : ''}
  `;
}



// Anulare de către client -> notificăm frizerul
export async function sendCancellationToBarber(data: AppointmentCancellationData) {
  await transporter.sendMail({
    from: process.env.SMTP_FROM,
    to: data.barber_email,
    subject: `Anulare: ${data.customer_name}, ${data.start_time}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px;">
        <h2>O programare a fost anulată</h2>
        <p>Bună, ${data.barber_first_name},</p>
        <p>Clientul a anulat următoarea programare:</p>
        ${cancellationDetailsTable(data, true)}
        <p style="color:#666;font-size:14px;">Intervalul este acum liber pentru alte rezervări.</p>
      </div>
    `,
  });
}


export async function sendReviewInviteEmail(data: ReviewInviteData) {
  const reviewUrl = `${process.env.FRONTEND_URL}/customer-history?review=${data.appointment_id}`;

  await transporter.sendMail({
    from: process.env.SMTP_FROM,
    to: data.customer_email,
    subject: 'Cum a fost experiența ta la salon?',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px;">
        <h2>Ne-ar plăcea să aflăm părerea ta</h2>
        <p>Bună, ${data.customer_first_name},</p>
        <p>
          Sperăm că ai fost mulțumit de vizita din <strong>${data.appointment_date}</strong>
          (${data.service_name}, cu ${data.barber_name}).
        </p>
        <p>
          Acordarea unei note durează câteva secunde și ne ajută să ne îmbunătățim serviciile.
        </p>
        <p style="margin:24px 0;">
          <a href="${reviewUrl}"
             style="background:#2563eb;color:#fff;padding:12px 24px;
                    text-decoration:none;border-radius:6px;display:inline-block;">
            Acordă o notă
          </a>
        </p>
        <p style="color:#666;font-size:14px;">
          Îți mulțumim că ne-ai ales!
        </p>
      </div>
    `,
  });
}




