import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import pdf_routes from './routes/pdf.routes';
import combo_routes from './routes/combo-box.routes';
import auth_routes from './routes/auth.routes';
import barbers_management_routes from './routes/barbers-management.routes';
import services_management_routes from './routes/services-management.routes';
import customer_dashboard_routes from './routes/customer-dashboard.routes';
import booking_routes from './routes/booking.routes';
import admin_dashboard_list from './routes/admin_dashboard.routes';
import common from './routes/common.routes';
import barber_dashboard_routes from './routes/barber-dashboard.routes';
import password_reset_routes from './routes/password_reset.routes';
import profile_routes from './routes/profile.routes';
import claim_routes from './routes/claim.routes'
import team_presentation_routes from './routes/team-presentation.routes';



// npx prisma db pull npx prisma generate
import path from 'path';
import { prisma } from './config/db';
import { startReminderJob } from './jobs/appointment-reminders.job';
import { startReminderJobReview } from './jobs/review-invites.job';
import { startAvatarJob } from './jobs/orphan-avatars.job';

// dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

//app.set('trust proxy', 1);//fără configurare, toate cererile par să vină de la aceeași adresă, iar limitarea ar bloca toți utilizatorii deodată


async function startServer() {
  try {
    console.log('Se inițializează conexiunea cu baza de date...');
    
    // FORȚĂM PRISMA SĂ SE CONECTEZE ACUM (Warm-up)
    await prisma.$connect();
    console.log('Conexiunea la PostgreSQL a fost stabilită cu succes!');

    // Pornim serverul Express DOAR după ce baza de date este pregătită
    app.listen(3000, '0.0.0.0', () => {
      console.log(`Serverul de backend rulează pe http://localhost:${port}`);
    });

    startReminderJob();
    startReminderJobReview();
    startAvatarJob();

  } catch (error) {
    console.error('Eroare critică la pornirea serverului / conexiunea DB:', error);
    process.exit(1);
  }
}

// Rulăm funcția de pornire
startServer();


app.use('/api/', auth_routes);
app.use('/api', password_reset_routes);
app.use('/api', barber_dashboard_routes);
app.use('/api/', barbers_management_routes);
app.use('/api/', services_management_routes);
app.use('/api/', customer_dashboard_routes);
app.use('/api/', admin_dashboard_list);
app.use('/api/', booking_routes);
app.use('/api/', profile_routes);
app.use('/api/export-pdf', pdf_routes);
app.use('/api', combo_routes);
app.use('/api', common);
app.use('/api', claim_routes);
app.use('/api', team_presentation_routes);


app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));








