import z from "zod";

const specialChars = /^[a-zA-ZĂÂÎȘȚăâîșț\s-]+$/;
const roMobileRegex = /^07[1-9][0-9]{7}$/;
const avatarRegex = /^\/uploads\/avatars\/[a-f0-9]{32}\.(jpg|jpeg|png|webp)$/;
const timeRegex = /^([01]\d|2[0-3]):[0-5]\d$/;

const emptyToUndefined = (val: unknown) => {
  if (typeof val !== 'string') return val;
  const trimmed = val.trim();
  return trimmed === '' ? undefined : trimmed;
};

// Tratează și string-ul 'null' ca "fără filtru"
const nullableToUndefined = (val: unknown) => {
  if (typeof val !== 'string') return val;
  const trimmed = val.trim();
  return (trimmed === '' || trimmed === 'null') ? undefined : trimmed;
};


const passwordRules = z
  .string()
  .min(10, { message: "Parola trebuie să aibă cel puțin 10 caractere" })
  .max(72, { message: "Parola nu poate depăși 72 de caractere" })
  .regex(/[A-Z]/, { message: "Parola trebuie să conțină cel puțin o literă mare" })
  .regex(/[a-z]/, { message: "Parola trebuie să conțină cel puțin o literă mică" })
  .regex(/[0-9]/, { message: "Parola trebuie să conțină cel puțin o cifră" })
  .regex(/[^a-zA-Z0-9]/, { message: "Parola trebuie să conțină cel puțin un caracter special" });

const ALLOWED_MIME = ['image/jpeg', 'image/png', 'image/webp'] as const;
const ALLOWED_EXT = ['.jpg', '.jpeg', '.png', '.webp'] as const;
const MAX_SIZE = 2 * 1024 * 1024;

const scheduleDaySchema = z.object({
  day_of_week: z
    .number({ message: "Ziua săptămânii trebuie să fie un număr" })
    .int()
    .min(0, { message: "Ziua săptămânii este invalidă" })
    .max(6, { message: "Ziua săptămânii este invalidă" }),

  is_active: z.boolean({ message: "Starea zilei trebuie să fie true sau false" }),

  start_hour: z
    .string({ message: "Ora de început trebuie să fie un text" })
    .regex(timeRegex, { message: "Ora de început trebuie să fie în formatul HH:MM" }),

  end_hour: z
    .string({ message: "Ora de sfârșit trebuie să fie un text" })
    .regex(timeRegex, { message: "Ora de sfârșit trebuie să fie în formatul HH:MM" }),
})
.refine(
  // Verificăm ordinea orelor doar pentru zilele lucrătoare
  (d) => !d.is_active || d.start_hour < d.end_hour,
  { message: "Ora de început trebuie să fie mai mică decât ora de sfârșit", path: ["end_hour"] }
);

export const setBarberScheduleSchema = z.object({
  p_barber_id: z
    .number({ message: "ID-ul frizerului trebuie să fie un număr" })
    .int()
    .positive({ message: "ID-ul frizerului este invalid" }),

  schedule: z
    .array(scheduleDaySchema)
    .min(1, { message: "Programul trebuie să conțină cel puțin o zi" })
    .max(7, { message: "Programul nu poate avea mai mult de 7 zile" })
    .refine(
      (days) => new Set(days.map((d) => d.day_of_week)).size === days.length,
      { message: "Programul conține zile duplicate" }
    ),
});



export const barbersAppointmentsQuerySchema = z.object({
  search: z.preprocess(emptyToUndefined,
    z.string().max(100, { message: "Textul căutat este prea lung" }).optional()),

  active: z.preprocess(nullableToUndefined,
    z.enum(['true', 'false'], { message: "Statusul trebuie să fie true sau false" })
      .transform((v) => v === 'true')
      .optional()),

  first: z.preprocess(emptyToUndefined,
    z.coerce.number().int().min(0).default(0)),

  rows: z.preprocess(emptyToUndefined,
    z.coerce.number().int().min(1).max(100).default(5)),

  sortField: z.preprocess(emptyToUndefined,
    z.enum([
      'first_name',
      'email',
      'phone',
      'is_active',
      'rating_avg',
    ], { message: "Câmpul de sortare este invalid" }).optional()),

  sortOrder: z.preprocess(emptyToUndefined,
    z.coerce.number().int().refine((v) => v === 1 || v === -1, {
      message: "Ordinea de sortare trebuie să fie 1 sau -1",
    }).optional()),
});

export const upsertBarberSchema = z.object({
  id: z.number().int().positive().nullish(),

  first_name: z
    .string({ message: "Numele trebuie să fie un text" })
    .min(2, { message: "Numele trebuie să aibă cel puțin 2 caractere" })
    .max(50, { message: "Numele nu poate depăși 50 de caractere" })
    .regex(specialChars, { message: "Numele nu poate conține caractere speciale (ex: @, #, $, !)" })
    .transform((val) => val.trim().replace(/\s+/g, ' ')),

  last_name: z
    .string({ message: "Prenumele trebuie să fie un text" })
    .min(2, { message: "Prenumele trebuie să aibă cel puțin 2 caractere" })
    .max(50, { message: "Prenumele nu poate depăși 50 de caractere" })
    .regex(specialChars, { message: "Prenumele nu poate conține caractere speciale (ex: @, #, $, !)" })
    .transform((val) => val.trim().replace(/\s+/g, ' ')),

  email: z
    .email({ message: "Adresa de email este invalidă" })
    .max(150, { message: "Adresa de email este prea lungă" })
    .transform((val) => val.trim().toLowerCase()),

  phone: z
    .string({ message: "Numărul de telefon trebuie să fie un text" })
    .regex(roMobileRegex, { message: "Număr de telefon invalid" }),

  password: z
    .union([passwordRules, z.literal('')])
    .optional(),

  confirm_password: z.string().optional(),

  avatar_url: z
    .string()
    .regex(avatarRegex, { message: "Calea avatarului este invalidă" })
    .nullish()
    .or(z.literal('')),

  is_active: z.boolean().optional().default(true),
})
.superRefine((data, ctx) => {
  const isCreate = data.id === null || data.id === undefined;

  // La creare, parola e obligatorie
  if (isCreate && !data.password) {
    ctx.addIssue({
      code: 'custom',
      path: ['password'],
      message: "Parola este obligatorie la crearea unui frizer nou",
    });
  }

  // Dacă s-a introdus o parolă, confirmarea trebuie să coincidă
  if (data.password && data.password !== data.confirm_password) {
    ctx.addIssue({
      code: 'custom',
      path: ['confirm_password'],
      message: "Parolele introduse nu coincid",
    });
  }
});

export const avatarFileSchema = z.object({
  originalname: z
    .string()
    .max(255, { message: "Numele fișierului este prea lung" })
    .refine(
      (name) => ALLOWED_EXT.some((ext) => name.toLowerCase().endsWith(ext)),
      { message: "Sunt permise doar fișiere .jpg, .jpeg, .png sau .webp" }
    ),

  mimetype: z.enum(ALLOWED_MIME, {
    message: "Sunt permise doar imagini JPG, PNG sau WEBP",
  }),

  size: z
    .number()
    .positive({ message: "Fișierul este gol" })
    .max(MAX_SIZE, { message: "Fișierul nu poate depăși 2 MB" }),

  filename: z
    .string()
    .regex(/^[a-f0-9]{32}\.(jpg|jpeg|png|webp)$/, {
      message: "Numele generat al fișierului este invalid",
    }),
});

export const barberDetailsSchema = z.object({
    p_barber_id: z
        .preprocess(
            emptyToUndefined, 
            z.coerce
                .number()
                .int()
                .positive()
    ),
})



