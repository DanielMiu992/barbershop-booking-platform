import { PrismaClient } from '../generated/prisma/client'; // Asigură-te că folosești calea corectă către folderul tău generated
import { Pool } from 'pg';                         
import { PrismaPg } from '@prisma/adapter-pg';

// Configurăm Pool-ul o singură dată global
const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);

// Creăm singura instanță de PrismaClient din toată aplicația
export const prisma = new PrismaClient({ adapter });
// export const prisma = new PrismaClient({ adapter , log: ['query'] });

// prisma.$on('query', (e) => {
//   console.log('Query:', e.query);
//   console.log('Params:', e.params);
// });