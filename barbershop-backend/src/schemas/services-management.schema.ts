import z from "zod";

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

export const serviceListQuerySchema = z.object({
  name: z.preprocess(emptyToUndefined,
    z.string().max(100, { message: "Textul căutat este prea lung" }).optional()),

  isActive: z.preprocess(nullableToUndefined,
    z.enum(['true', 'false'], { message: "Statusul trebuie să fie true sau false" })
      .transform((v) => v === 'true')
      .optional()),

  maxPrice: z
    .preprocess(
        emptyToUndefined, 
        z.coerce
            .number()
            .positive()
            .max(100000).optional()
        ),

  first: z.preprocess(emptyToUndefined,
    z.coerce.number().int().min(0).default(0)),

  rows: z.preprocess(emptyToUndefined,
    z.coerce.number().int().min(1).max(100).default(5)),

  sortField: z.preprocess(emptyToUndefined,
    z.enum([
      'name',
      'duration_minutes',
      'price',
      'is_active'
    ], { message: "Câmpul de sortare este invalid" }).optional()),

  sortOrder: z.preprocess(emptyToUndefined,
    z.coerce.number().int().refine((v) => v === 1 || v === -1, {
      message: "Ordinea de sortare trebuie să fie 1 sau -1",
    }).optional()),
});





export const specialtiesListQuerySchema = z.object({
  searchQuery: z.preprocess(emptyToUndefined,
    z.string().max(100, { message: "Textul căutat este prea lung" }).optional()),

  isActive: z.preprocess(nullableToUndefined,
    z.enum(['true', 'false'], { message: "Statusul trebuie să fie true sau false" })
      .transform((v) => v === 'true')
      .optional()),

  first: z.preprocess(emptyToUndefined,
    z.coerce.number().int().min(0).default(0)),

  rows: z.preprocess(emptyToUndefined,
    z.coerce.number().int().min(1).max(100).default(5)),

  sortField: z.preprocess(emptyToUndefined,
    z.enum([
      'name',
      'duration_minutes',
      'price',
      'is_active'
    ], { message: "Câmpul de sortare este invalid" }).optional()),

  sortOrder: z.preprocess(emptyToUndefined,
    z.coerce.number().int().refine((v) => v === 1 || v === -1, {
      message: "Ordinea de sortare trebuie să fie 1 sau -1",
    }).optional()),
});