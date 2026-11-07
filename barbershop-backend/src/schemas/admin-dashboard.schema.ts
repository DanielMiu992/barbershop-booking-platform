import { z } from 'zod'

const emptyToUndefined = (val: unknown) => (val === '' ? undefined : val);

const dateParam = z
    .string()
    .refine((val) => !isNaN(Date.parse(val)), { message: "Data este invalidă" })
    .optional();


export const adminAppointmentsQuerySchema = z.object({
  barberId: z
    .preprocess(
        emptyToUndefined, 
        z.coerce
            .number()
            .int()
            .positive().optional()
    ),

  serviceId: z
    .preprocess(
        emptyToUndefined, 
        z.coerce
            .number()
            .int()
            .positive().optional()
    ),

  status: z
    .preprocess(
        emptyToUndefined,
        z.enum([
            'confirmed', 'completed', 'cancelled'
        ],{ message: "Statusul este invalid" }).optional()
    ),

  customerName: z
    .preprocess(
        emptyToUndefined,
        z.string().max(100, { message: "Numele căutat este prea lung" }).optional()
    ),

  searchQuery: z
    .preprocess(
        emptyToUndefined,
        z.string().max(100, { message: "Căutarea este prea lungă" }).optional()
    ),

  startDate: z.preprocess(emptyToUndefined, dateParam),

  endDate: z.preprocess(emptyToUndefined, dateParam),

  first: z
    .preprocess(
        emptyToUndefined, 
        z.coerce
            .number()
            .int()
            .min(0).default(0)
    ),

  rows: z
    .preprocess(
        emptyToUndefined, 
        z.coerce
            .number()
            .int()
            .min(1)
            .max(100).default(5)
    ),

  sortField: z
    .preprocess(
        emptyToUndefined,
        z.enum([
            'customer_first_name',
            'customer_phone',
            'barber_first_name',
            'service_name',
            'service_price',
            'start_time',
            'appointment_customer_rating',
            'status',
        ], { message: "Câmpul de sortare este invalid" }).optional()
    ),

  sortOrder: z
    .preprocess(
        emptyToUndefined,
        z.coerce
            .number()
            .int()
            .refine((v) => v === 1 || v === -1, {
        message: "Ordinea de sortare trebuie să fie 1 sau -1",
        }).optional()
    ),
})
.refine(
  (d) => !d.startDate || !d.endDate || Date.parse(d.startDate) <= Date.parse(d.endDate),
  { message: "Data de început nu poate fi după data de sfârșit", path: ["endDate"] }
);

export const setClientRatingSchema = z.object({
    p_appointment_id:
        z
        .number()
        .int()
        .positive(),

    p_rating:
        z
        .number()
        .int()
        .positive()
        .max(5)
        // .refine((val) => {
        //     if(val > 5) return false
        // }, {message: "refine max val 5"})


})