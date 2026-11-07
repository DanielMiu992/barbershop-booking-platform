import { z } from 'zod'

// const emptyToUndefined = (val: unknown) => (val === '' ? undefined : val);

const emptyToUndefined = (val: unknown) => {
  if (typeof val !== 'string') return val;
  const trimmed = val.trim();
  return trimmed === '' ? undefined : trimmed;

}

export const appointmentDetailsSchema = z.object({
    appointment_id: z
        .preprocess(
            emptyToUndefined, 
            z.coerce
                .number()
                .int()
                .positive()
    ),
})

export const barbersDetailsSchema = z.object({
    barber_id: z
        .preprocess(
            emptyToUndefined, 
            z.coerce
                .number()
                .int()
                .positive()
    ),

})

export const setAppointmentSchema = z.object({
    p_appointment_id: 
        z
        .number()
        .int()
        .positive(),
    
    p_appointment_overview:
        z
        .string({ message: "Câmpul Nota/Observatie trebuie să fie un text" })
        .min(2, { message: "Câmpul Nota/Observatie trebuie sa aibe cel putin 2 caractere" })
        .max(500, { message: "Câmpul Nota/Observatie nu poate depasi 500 de caractere" })
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
            message: "Câmpul Nota/Observatie nu poate conține link-uri, tag-uri HTML, adrese de email sau elemente de scripting."
        })
})



export const cancelAppointmentSchema = z.object({
    p_appointment_id:
        z
        .number({ message: "Id-ul trebuie să fie un număr" })
        .int({ message: "Id-ul trebuie să fie un număr întreg, fără zecimale" })
        .gte(1, { message: "Id-ul programării trebuie să fie un număr pozitiv valid." })
        .max(2147483647, { message: "Id-ul introdus este mult prea mare și este invalid." }),

    // p_user_role:
    //     z
    //     .string({ message: "Role trebuie să fie un text" })
    //     .refine((val) => {
    //         return ['admin', 'customer', 'barber'].includes(val);
    //     }, {message: "Rolul utilizatorului este invalid"}),
        
    p_cancel_reason:
        z
        .string({ message: "Nota/Observatie trebuie să fie un text" })
        .min(2, { message: "Nota/Observatie trebuie sa aibe cel putin 2 caractere" })
        .max(500, { message: "Nota/Observatie nu poate depasi 500 de caractere" })
        .refine((val) => {

            if (!val) return true;

            const containsLinks = /(https?:\/\/[^\s]+|www\.[^\s]+)/gi.test(val);
            const containsEmail = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g.test(val);

            if (containsLinks || containsEmail) return false;

            const isCleanText = /^[a-zA-ZĂÂÎȘȚăâîșț0-9\s.,!?;:"'()\-–—]+$/u.test(val);
            const containsFunctionCall = /\b(console\.|alert\(|eval\(|prompt\()/gi.test(val);

            return isCleanText && !containsFunctionCall;

        }, {
            message: "Câmpul Nota/Observatie nu poate conține link-uri, tag-uri HTML, adrese de email sau elemente de scripting."
        })

})