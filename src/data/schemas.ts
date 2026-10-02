import { z } from "zod";

/** Fecha ISO corta: AAAA-MM-DD */
const isoDate = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Fecha en formato AAAA-MM-DD");
/** Mes ISO: AAAA-MM */
const isoMonth = z.string().regex(/^\d{4}-\d{2}$/, "Mes en formato AAAA-MM");
const sources = z.array(z.url()).min(1, "Cada dato necesita al menos una fuente");

export const timelineItem = z.object({
  id: z.string(),
  year: z.number().int(),
  month: z.number().int().min(1).max(12).optional(),
  era: z.enum(["origenes", "inviernos", "deep-learning", "transformer", "generativa", "agentes"]),
  title: z.string(),
  what: z.string(),
  why: z.string(),
  business: z.string().optional(),
  /** Hito clave: se resalta en la línea de tiempo */
  key: z.boolean().default(false),
  sources,
  verifiedAt: isoDate,
});
export const timeline = z.array(timelineItem);
export type TimelineItem = z.infer<typeof timelineItem>;

export const glossaryItem = z.object({
  id: z.string().regex(/^[a-z0-9-]+$/),
  term: z.string(),
  aliases: z.array(z.string()).default([]),
  short: z.string().max(220),
  long: z.string().optional(),
  analogy: z.string().optional(),
  /** Módulo donde se explica a fondo */
  module: z.string().optional(),
});
export const glossary = z.array(glossaryItem);
export type GlossaryItem = z.infer<typeof glossaryItem>;

export const country = z.enum(["US", "CN", "EU", "other"]);

export const company = z.object({
  id: z.string(),
  name: z.string(),
  country,
  hq: z.string(),
  founded: z.number().int().optional(),
  kind: z.enum(["laboratorio", "big-tech", "especialista", "infraestructura"]),
  summary: z.string(),
  strategy: z.string(),
  openWeights: z.enum(["si", "no", "parcial"]),
  products: z.array(z.string()).default([]),
  url: z.url(),
  sources,
  verifiedAt: isoDate,
});
export const companies = z.array(company);
export type Company = z.infer<typeof company>;

export const modelType = z.enum(["llm", "razonamiento", "imagen", "video", "audio", "multimodal"]);

export const model = z.object({
  id: z.string(),
  name: z.string(),
  company: z.string(),
  country,
  type: z.array(modelType).min(1),
  released: isoMonth,
  openWeights: z.boolean(),
  license: z.string(),
  strengths: z.array(z.string()).min(1),
  limitations: z.array(z.string()).default([]),
  /** Ventana de contexto en tokens (solo LLM) */
  context: z.number().int().positive().nullable().default(null),
  pricing: z
    .object({
      unit: z.string(),
      input: z.number().nonnegative().nullable(),
      output: z.number().nonnegative().nullable(),
      currency: z.literal("USD"),
      note: z.string().optional(),
    })
    .nullable()
    .default(null),
  sources,
  verifiedAt: isoDate,
});
export const models = z.array(model);
export type Model = z.infer<typeof model>;

const range = z
  .object({ min: z.number().nonnegative(), max: z.number().nonnegative() })
  .refine((r) => r.max >= r.min, "max debe ser >= min");

export const costItem = z.object({
  id: z.string(),
  label: z.string(),
  unit: z.string(),
  range,
  currency: z.enum(["USD", "EUR"]),
  note: z.string().optional(),
  sources,
  verifiedAt: isoDate,
});
export const costs = z.array(costItem);
export type CostItem = z.infer<typeof costItem>;
