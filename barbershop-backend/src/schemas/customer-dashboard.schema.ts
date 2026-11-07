import { z } from 'zod'

// Acceptă atât 'YYYY-MM-DD' cât și ISO complet (ce trimite p-datePicker)
const dateParam = z
  .string()
  .refine((val) => !isNaN(Date.parse(val)), { message: "Data este invalidă" })
  .optional();

const emptyToUndefined = (val: unknown) => (val === '' ? undefined : val);


export const customerAppointmentsQuerySchema = z.object({
  serviceId: z
    .preprocess(
        emptyToUndefined, 
        z.coerce
            .number()
            .int()
            .positive().optional()),

  barberId: z
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
            .max(100000).optional()),

  maxDuration: z
    .preprocess(
        emptyToUndefined, 
        z.coerce
            .number()
            .int()
            .positive()
            .max(1440).optional()),

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
            'start_time', 'barber_name', 'rating'
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