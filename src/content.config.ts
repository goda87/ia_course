import { defineCollection } from "astro:content";
import { glob } from "astro/loaders";
import { z } from "astro/zod";

const modulos = defineCollection({
  loader: glob({ pattern: "**/*.mdx", base: "./src/content/modulos" }),
  schema: z.object({
    title: z.string(),
    order: z.number().int(),
    block: z.enum(["contexto", "funciona", "estado", "aplicacion", "referencia"]),
    summary: z.string(),
    minutes: z.number().int().positive(),
    /** Fecha de verificación de los datos que aparecen en el módulo, si aplica */
    verifiedAt: z.string().optional(),
  }),
});

export const collections = { modulos };
