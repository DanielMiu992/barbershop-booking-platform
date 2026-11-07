import { z } from 'zod'

const specialChars = /^[a-zA-ZĂÂÎȘȚăâîșț\s-]+$/;
const roMobileRegex = /^07[1-9][0-9]{7}$/;
const avatarRegex = /^\/uploads\/avatars\/[a-f0-9]{32}\.(jpg|jpeg|png|webp)$/;

export const updateClientProfileSchema = z.object({
  first_name: 
    z
    .string({ error: "Numele trebuie să fie un text" })
    .min(1, { error: "Numele nu poate fi un text gol" })
    .min(2, { error: "Numele trebuie sa aibe cel putin 2 caractere" })
    .max(50, { error: "Numele nu poate depasi 50 de caractere" })
    .regex(specialChars, { error: "Numele nu poate conține caractere speciale (ex: @, !, $, %)" }),
  last_name: 
    z
    .string({ error: "Prenumele trebuie să fie un text" })
    .min(1, { error: "Prenumele nu poate fi un text gol" })
    .min(2, { error: "Prenumele trebuie sa aibe cel putin 2 caractere" })
    .max(50, { error: "Prenumele nu poate depasi 50 de caractere" })
    .regex(specialChars, { error: "Prenumele nu poate conține caractere speciale (ex: @, !, $, %)" }),
  phone: 
    z
    .string({ error: "Numărul de telefon trebuie să fie un text" })
    .regex(roMobileRegex, { error: "Nr de telefon invalid" }),
  avatar_url: 
    z
    .string()
    .regex(avatarRegex, { message: "Calea avatarului este invalidă" })
    .optional()
    .or(z.literal(''))
  });



export const updateBarberProfileSchema = z.object({
  first_name: 
    z
    .string({ message: "Numele trebuie să fie un text" })
    .min(1, { message: "Numele nu poate fi un text gol" })
    .min(2, { message: "Numele trebuie sa aibe cel putin 2 caractere" })
    .max(50, { message: "Numele nu poate depasi 50 de caractere" })
    .regex(specialChars, { message: "Numele nu poate conține caractere speciale (ex: @, !, $, %)" })
    .transform((val) => {
      return val
        .trim()              
        .replace(/\s+/g, ' ')
    }),

  last_name: 
    z
    .string({ message: "Prenumele trebuie să fie un text" })
    .min(1, { message: "Prenumele nu poate fi un text gol" })
    .min(2, { message: "Prenumele trebuie sa aibe cel putin 2 caractere" })
    .max(50, { message: "Prenumele nu poate depasi 50 de caractere" })
    .regex(specialChars, { message: "Prenumele nu poate conține caractere speciale (ex: @, !, $, %)" })
    .transform((val) => {
      return val
        .trim()               
        .replace(/\s+/g, ' ')
    }),
  phone: 
    z
    .string({ message: "Numărul de telefon trebuie să fie un text" })
    .regex(roMobileRegex, { message: "Nr de telefon invalid" }),
  avatar_url: 
    z
    .string()
    .regex(avatarRegex, { message: "Calea avatarului este invalidă" })
    .optional()
    .or(z.literal('')),
  bio:
    z
    .string({ message: "Bio trebuie să fie un text" })
    .min(2, { message: "Bio trebuie sa aibe cel putin 2 caractere" })
    .max(500, { message: "Bio nu poate depasi 500 de caractere" })
    .optional()
    .refine((val) => {

      if (!val) return true;

      const containsLinks = /(https?:\/\/[^\s]+|www\.[^\s]+)/gi.test(val);
      const containsEmail = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g.test(val);
      
      if (containsLinks || containsEmail) return false;

      const isCleanText = /^[a-zA-ZĂÂÎȘȚăâîșț0-9\s.,!?;:"'()\-–—]+$/u.test(val);
      const containsFunctionCall = /\b(console\.|alert\(|eval\(|prompt\()/gi.test(val);

      return isCleanText && !containsFunctionCall;


    }, {
      message: "Câmpul Bio nu poate conține link-uri, tag-uri HTML, adrese de email sau elemente de scripting."
    })
});

export const changePasswordSchema = z.object({
  current_password: z
    .string({ message: "Parola curentă trebuie să fie un text" })
    .min(1, { message: "Parola curentă este obligatorie" }),

  new_password: z
    .string({ message: "Parola nouă trebuie să fie un text" })
    .min(1, { message: "Parola nouă este obligatorie" })
    .min(10, { message: "Parola trebuie să aibă cel puțin 10 caractere" })
    .max(72, { message: "Parola nu poate depăși 72 de caractere" })
    .regex(/[A-Z]/, { message: "Parola trebuie să conțină cel puțin o literă mare" })
    .regex(/[a-z]/, { message: "Parola trebuie să conțină cel puțin o literă mică" })
    .regex(/[0-9]/, { message: "Parola trebuie să conțină cel puțin o cifră" })
    .regex(/[^a-zA-Z0-9]/, { message: "Parola trebuie să conțină cel puțin un caracter special" }),

  confirm_password: z
    .string({ message: "Confirmarea parolei trebuie să fie un text" })
    .min(1, { message: "Confirmarea parolei este obligatorie" }),
})
.refine((data) => data.new_password === data.confirm_password, {
  message: "Parolele nu coincid",
  path: ["confirm_password"],
})
.refine((data) => data.current_password !== data.new_password, {
  message: "Parola nouă trebuie să fie diferită de cea curentă",
  path: ["new_password"],
});


export const setSpecialtiesSchema = z.object({
  params: z
    .array(
      z.object({
        id: z.number({ message: "ID-ul specializării trebuie să fie un număr" })
          .int({ message: "ID-ul specializării trebuie să fie un număr întreg" })
          .positive({ message: "ID-ul specializării este invalid" }),
      }).loose(),   // permite name, etc. — le ignorăm, dar nu respingem cererea
    )
    .max(20, { message: "Poți selecta cel mult 20 de specializări" })
    .refine(
      (arr) => new Set(arr.map((s) => s.id)).size === arr.length,
      { message: "Lista conține specializări duplicate" }
    ),
});
