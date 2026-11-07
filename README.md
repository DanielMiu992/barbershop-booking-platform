# Barbershop Booking Platform

A full-stack web application for running a barbershop: customers book appointments online, barbers manage their schedule, and admins manage the team, services and reports.

Built as a personal project with **Angular 19**, **PrimeNG 19**, **Node.js / Express** and **PostgreSQL**.

## Features

**Customers**
- Multi-step online booking: choose barber, services, date and time slot
- Appointment history with cancellation, details and ratings
- Email confirmations with calendar invites (.ics) and automatic reminders

**Barbers**
- Personal dashboard with upcoming and past appointments
- Complete or cancel appointments, view customer ratings
- Profile management with avatar upload and specialties

**Admins**
- Dashboard with server-side paginated tables (lazy loading, filtering, sorting)
- Barber management: add barbers, set weekly schedules, account claiming flow
- Services and specialties management
- PDF report export

**Authentication**
- Registration, login, email-based password reset and account claiming
- JWT authentication with role-based access (admin / barber / customer)

## Tech stack

| Layer | Technologies |
|---|---|
| Frontend | Angular 19 (standalone components, Signals, new control flow, lazy-loaded routes, functional guards and interceptors), TypeScript, RxJS, typed reactive forms with custom validators |
| UI | PrimeNG 19 (Aura theme), Tailwind CSS, SCSS, PrimeIcons, Font Awesome |
| Backend | Node.js, Express 5, TypeScript, Zod validation, express-rate-limit, Multer |
| Database | PostgreSQL with Prisma ORM |
| Other | JWT, bcrypt, Nodemailer, ical-generator, node-cron, PDFKit |

## Project structure

```
barbershop-frontend/   Angular application
  src/app/core/        auth service, route guards, JWT interceptor
  src/app/features/    pages (booking, dashboards, admin screens, auth flows)
  src/app/shared/      layouts, navbar, reusable components
  src/app/validators/  custom form validators
barbershop-backend/    Express REST API
  prisma/              database schema
  src/routes/          API endpoints
  src/schemas/         Zod request validation
  src/middleware/      authentication, roles, validation
  src/jobs/            scheduled jobs (reminders, review invites, cleanup)
```

## Getting started

### Prerequisites
- Node.js 20+
- PostgreSQL

### Backend

```bash
cd barbershop-backend
npm install
cp .env.example .env      # then fill in your own values
npx prisma db push        # create the database tables
npx prisma generate       # generate the Prisma client
npm run dev               # API on http://localhost:3000
```

### Frontend

```bash
cd barbershop-frontend
npm install
npm start                 # app on http://127.0.0.1:4200 (API calls are proxied to the backend)
```

## Author

**Daniel Miu** — Front-End Developer (Angular)
