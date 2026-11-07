import z from "zod";

const specialChars = /^[a-zA-ZĂÂÎȘȚăâîșț\s-]+$/;
const roMobileRegex = /^07[1-9][0-9]{7}$/;

const emptyToUndefined = (val: unknown) => {
  if (typeof val !== 'string') return val;
  const trimmed = val.trim();
  return trimmed === '' ? undefined : trimmed;
};

const passwordRules = z
  .string()
  .min(10, { message: "Parola trebuie să aibă cel puțin 10 caractere" })
  .max(72, { message: "Parola nu poate depăși 72 de caractere" })
  .regex(/[A-Z]/, { message: "Parola trebuie să conțină cel puțin o literă mare" })
  .regex(/[a-z]/, { message: "Parola trebuie să conțină cel puțin o literă mică" })
  .regex(/[0-9]/, { message: "Parola trebuie să conțină cel puțin o cifră" })
  .regex(/[^a-zA-Z0-9]/, { message: "Parola trebuie să conțină cel puțin un caracter special" });

export const registerSchema = z.object({
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

    password: passwordRules,
    //.optional(),

    confirm_password: z.string(),//.optional(),

})
.superRefine((data, ctx) => {

  if (data.password && data.password !== data.confirm_password) {
    ctx.addIssue({
      code: 'custom',
      path: ['confirm_password'],
      message: "Parolele introduse nu coincid"
    });
  }
});


export const claimAccount = z.object({
    email: z
        .email()
        .max(150)
        .transform((val) => val.trim().toLowerCase()),

    password: passwordRules,

    confirm_password: z.string()

})
.superRefine((data, ctx) => {

  if (data.password && data.password !== data.confirm_password) {
    ctx.addIssue({
      code: 'custom',
      path: ['confirm_password'],
      message: "Parolele introduse nu coincid"
    });
  }
});
