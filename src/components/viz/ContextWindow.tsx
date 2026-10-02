import { AnimatePresence, MotionConfig, motion } from "motion/react";
import { useState } from "react";

interface Block {
  id: number;
  label: string;
  size: number;
  kind: "system" | "user" | "assistant" | "doc";
}

const CAPACITY = 100;
const KIND_STYLE: Record<Block["kind"], string> = {
  system: "bg-fg text-bg",
  user: "bg-sky-300 text-sky-950 dark:bg-sky-800 dark:text-sky-50",
  assistant: "bg-[var(--accent)] text-bg",
  doc: "bg-amber-300 text-amber-950 dark:bg-amber-700 dark:text-amber-50",
};
const KIND_LABEL: Record<Block["kind"], string> = {
  system: "Instrucciones del sistema",
  user: "Mensaje del usuario",
  assistant: "Respuesta de la IA",
  doc: "Documento",
};

const ADDERS: { label: string; blocks: Omit<Block, "id">[] }[] = [
  {
    label: "Pregunta y respuesta",
    blocks: [
      { label: "Pregunta", size: 4, kind: "user" },
      { label: "Respuesta", size: 8, kind: "assistant" },
    ],
  },
  {
    label: "Adjuntar informe de 40 páginas",
    blocks: [{ label: "Informe PDF", size: 38, kind: "doc" }],
  },
  {
    label: "Pedir un resumen largo",
    blocks: [
      { label: "Petición", size: 3, kind: "user" },
      { label: "Resumen", size: 16, kind: "assistant" },
    ],
  },
];

let nextId = 1;

export default function ContextWindow() {
  const [blocks, setBlocks] = useState<Block[]>([
    { id: 0, label: "System prompt", size: 10, kind: "system" },
  ]);
  const [forgotten, setForgotten] = useState<string[]>([]);
  const used = blocks.reduce((s, b) => s + b.size, 0);

  const add = (items: Omit<Block, "id">[]) => {
    let next = [...blocks, ...items.map((b) => ({ ...b, id: nextId++ }))];
    const lost: string[] = [];
    // Si no cabe, lo más antiguo (salvo las instrucciones) se cae de la ventana
    while (next.reduce((s, b) => s + b.size, 0) > CAPACITY) {
      const idx = next.findIndex((b) => b.kind !== "system");
      lost.push(next[idx]!.label);
      next = next.filter((_, k) => k !== idx);
    }
    setBlocks(next);
    if (lost.length) setForgotten((f) => [...lost, ...f].slice(0, 6));
  };

  const reset = () => {
    setBlocks([{ id: 0, label: "System prompt", size: 10, kind: "system" }]);
    setForgotten([]);
  };

  return (
    <MotionConfig reducedMotion="user">
      <div className="flex flex-wrap gap-2">
        {ADDERS.map((a) => (
          <button
            key={a.label}
            onClick={() => add(a.blocks)}
            className="rounded-full border border-line px-3 py-1.5 text-sm hover:border-[var(--accent)] hover:bg-[var(--accent-soft)]"
          >
            + {a.label}
          </button>
        ))}
        <button
          onClick={reset}
          className="ml-auto rounded-full px-3 py-1.5 text-sm text-muted hover:bg-bg-soft"
        >
          Reiniciar
        </button>
      </div>

      <div className="mt-5">
        <div className="mb-1 flex justify-between text-xs text-muted">
          <span>Ventana de contexto</span>
          <span className="tabular-nums">
            {used} / {CAPACITY} % ocupado
          </span>
        </div>
        <div
          className="flex h-14 overflow-hidden rounded-xl border-2 border-fg/70 bg-bg-soft"
          role="img"
          aria-label={`Ventana de contexto ocupada al ${used} %`}
        >
          <AnimatePresence initial={false}>
            {blocks.map((b) => (
              <motion.div
                key={b.id}
                layout
                initial={{ opacity: 0, scaleX: 0 }}
                animate={{ opacity: 1, scaleX: 1 }}
                exit={{ opacity: 0, y: 40 }}
                transition={{ duration: 0.35 }}
                style={{ width: `${b.size}%`, originX: 0 }}
                className={`flex shrink-0 items-center justify-center overflow-hidden border-r border-bg px-1 text-[10px] leading-tight font-medium sm:text-xs ${KIND_STYLE[b.kind]}`}
                title={`${KIND_LABEL[b.kind]}: ${b.label}`}
              >
                <span className="truncate">{b.size >= 6 ? b.label : ""}</span>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
        <ul className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted">
          {(Object.keys(KIND_LABEL) as Block["kind"][]).map((k) => (
            <li key={k} className="flex items-center gap-1.5">
              <span className={`size-2.5 rounded-sm ${KIND_STYLE[k]}`} />
              {KIND_LABEL[k]}
            </li>
          ))}
        </ul>
      </div>

      <div className="mt-4 min-h-12 rounded-xl bg-bg-soft p-3 text-sm" aria-live="polite">
        {forgotten.length ? (
          <>
            <strong>El modelo ya no ve:</strong> {forgotten.join(", ")}. Si le preguntas por ello,
            no lo «recordará» (o, peor, se lo inventará).
          </>
        ) : (
          <span className="text-muted">Añade mensajes y documentos hasta llenar la ventana.</span>
        )}
      </div>
    </MotionConfig>
  );
}
