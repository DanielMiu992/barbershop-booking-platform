import { z } from 'zod'



// const dateParam = z
//   .string()
//   .refine((val) => !isNaN(Date.parse(val)), { message: "Data este invalidă" })
//   .optional();


// const dateParam = z
//     .string()
//     .refine(
//         (val) => /^\d{4}-\d{2}-\d{2}$/.test(val) || /^\d{2}\/\d{2}\/\d{4}$/.test(val),
//         { message: "Data trebuie să fie în formatul zz/ll/aaaa sau aaaa-ll-zz" }
//     )
//     .refine((val) => {
//         const iso = val.includes('/')
//         ? val.split('/').reverse().join('-')
//         : val;
//         const d = new Date(iso);
//         return !isNaN(d.getTime()) && iso.startsWith(d.toISOString().slice(0, 10));
//     }, { message: "Data nu există în calendar" })
//     .transform((val) => {
//         // Normalizăm dd/MM/yyyy la ISO
//         if (val.includes('/')) {
//         const [day, month, year] = val.split('/');
//         return `${year}-${month}-${day}`;
//         }
//         return val;
//     })
//     .optional()

const dateParam = z
  .string()
  .refine(
    (val) => /^\d{4}-\d{2}-\d{2}$/.test(val) || /^\d{2}\/\d{2}\/\d{4}$/.test(val),
    { message: "Data trebuie să fie în formatul zz/ll/aaaa sau aaaa-ll-zz" }
  )
  .transform((val) =>
    val.includes('/') ? val.split('/').reverse().join('-') : val
  )
  .refine((val) => {
    const d = new Date(val);
    return !isNaN(d.getTime()) && val === d.toISOString().slice(0, 10);
  }, { message: "Data nu există în calendar" })
  .optional();    

const emptyToUndefined = (val: unknown) => {
  if (typeof val !== 'string') return val;
  const trimmed = val.trim();
    console.log("trimmed =", trimmed);
  return trimmed === '' ? undefined : trimmed;
};


// const emptyToUndefined = (val: unknown) => (val === '' ? undefined : val);

export const barberAppointmentsQuerySchema = z.object({
  serviceId: z
    .preprocess(
        emptyToUndefined, 
        z.coerce
            .number()
            .int()
            .positive().optional()),

  maxPrice: z
    .preprocess(
        emptyToUndefined, 
        z.coerce
            .number()
            .positive()
            .max(100000).optional()
        ),

  maxDuration: z
    .preprocess(
        emptyToUndefined, 
        z.coerce
            .number()
            .int()
            .positive()
            .max(1440).optional()
        ),

  startDate: z.preprocess(emptyToUndefined, dateParam),

  endDate: z.preprocess(emptyToUndefined, dateParam),

  searchQuery: z
    .preprocess(
        emptyToUndefined, 
        z.string().max(100, { message: "Căutarea este prea lungă" }).optional()),

  first: z
    .preprocess(
        emptyToUndefined, 
        z.coerce
            .number()
            .int()
            .min(0).default(0)),

  rows: z
    .preprocess(
        emptyToUndefined, 
        z.coerce
            .number()
            .int()
            .min(1)
            .max(100).default(5)),

  sortField: z
    .preprocess(
        emptyToUndefined, 
        z.enum([
            'status', 'service_name', 'service_duration', 'service_price', 
            'start_time', 'customer_name', 'rating'
        ]).optional()),

  sortOrder: z
    .preprocess(
        emptyToUndefined, 
        z.coerce
            .number()
            .int()
            .refine((v) => v === 1 || v === -1, {
                message: "Ordinea de sortare trebuie să fie 1 sau -1",
            }).optional()),
})
.refine(
  (d) => !d.startDate || !d.endDate || Date.parse(d.startDate) <= Date.parse(d.endDate),
  { message: "Data de început nu poate fi după data de sfârșit", path: ["endDate"] }
);