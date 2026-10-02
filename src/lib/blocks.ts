export const BLOCKS = {
  contexto: { id: "contexto", label: "Contexto", letter: "A" },
  funciona: { id: "funciona", label: "Cómo funciona", letter: "B" },
  estado: { id: "estado", label: "Estado del arte", letter: "C" },
  aplicacion: { id: "aplicacion", label: "Aplicación a tu trabajo", letter: "D" },
  referencia: { id: "referencia", label: "Referencia", letter: "E" },
} as const;

export type BlockId = keyof typeof BLOCKS;
export const BLOCK_IDS = Object.keys(BLOCKS) as BlockId[];
