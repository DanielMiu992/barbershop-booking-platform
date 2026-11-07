import { z } from 'zod';

const nameRegex = /^[a-zA-ZĂÂÎȘȚăâîșț\s-]+$/;
const roMobileRegex = /^07[1-9][0-9]{7}$/;
const timeRegex = /^([01]\d|2[0-3]):[0-5]\d$/;
const isoDateRegex = /^\d{4}-\d{2}-\d{2}$/;

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
    // console.log("dateParam refine val", val)
    const d = new Date(val);
    // console.log("dateParam refine d", d)
    return !isNaN(d.getTime()) && val === d.toISOString().slice(0, 10);
  }, { message: "Data nu există în calendar" })
  .optional();


export const availableSlotsQuerySchema = z.object({
  barberId: z.coerce
    .number()//{ message: "ID-ul frizerului trebuie să fie un număr" }
    .int()
    .positive(), //{ message: "ID-ul frizerului este invalid" }

  date: dateParam.unwrap(),   // scoatem .optional() — data e obligatorie aici

  serviceIds: z
    .string({ message: "Lista de servicii este obligatorie" })
    .transform((val) => val.split(',').filter(Boolean).map(Number))
    .pipe(
      z.array(z.number().int().positive())
        .min(1, { message: "Trebuie selectat cel puțin un serviciu" })
        .max(10, { message: "Nu poți selecta mai mult de 10 servicii" })
    )
    .refine(
      (ids) => new Set(ids).size === ids.length,
      { message: "Lista conține servicii duplicate" }
    ),
});



const guestUserSchema = z.object({
  first_name: z
    .string({ message: "Numele trebuie să fie un text" })
    .min(2, { message: "Numele trebuie să aibă cel puțin 2 caractere" })
    .max(60, { message: "Numele nu poate depăși 60 de caractere" })
    .regex(nameRegex, { message: "Numele nu poate conține caractere speciale" })
    .transform((val) => val.trim().replace(/\s+/g, ' ')),

  last_name: z
    .string({ message: "Prenumele trebuie să fie un text" })
    .min(2, { message: "Prenumele trebuie să aibă cel puțin 2 caractere" })
    .max(60, { message: "Prenumele nu poate depăși 60 de caractere" })
    .regex(nameRegex, { message: "Prenumele nu poate conține caractere speciale" })
    .transform((val) => val.trim().replace(/\s+/g, ' ')),

  email: z
    .email({ message: "Adresa de email este invalidă" })
    .max(150, { message: "Adresa de email este prea lungă" })
    .transform((val) => val.trim().toLowerCase()),

  phone: z
    .string({ message: "Numărul de telefon trebuie să fie un text" })
    .regex(roMobileRegex, { message: "Număr de telefon invalid" }),
});

export const createAppointmentSchema = z.object({
  serviceIds: z
    .array(z.number().int().positive({ message: "ID-ul serviciului este invalid" }))
    .min(1, { message: "Trebuie selectat cel puțin un serviciu" })
    .max(10, { message: "Nu poți selecta mai mult de 10 servicii" })
    .refine(
      (ids) => new Set(ids).size === ids.length,
      { message: "Lista conține servicii duplicate" }
    ),

  barberId: z
    .number({ message: "Frizerul este obligatoriu" })
    .int()
    .positive({ message: "Frizerul selectat este invalid" }),

  dateStr: z
    .string({ message: "Data este obligatorie" })
    .regex(isoDateRegex, { message: "Data trebuie să fie în formatul aaaa-ll-zz" })
    .refine((val) => {
      const d = new Date(val);
      return !isNaN(d.getTime()) && val === d.toISOString().slice(0, 10);
    }, { message: "Data nu există în calendar" })
    .refine(
      (val) => val >= new Date().toISOString().slice(0, 10),
      { message: "Nu se pot face programări în trecut" }
    ),

  slotStr: z
    .string({ message: "Ora este obligatorie" })
    .regex(timeRegex, { message: "Ora trebuie să fie în formatul HH:MM" }),

  guestUser: guestUserSchema.optional(),
});