import { AnimatePresence, MotionConfig, motion } from "motion/react";
import { useState } from "react";

export interface Layer {
  id: string;
  icon: string;
  name: string;
  short: string;
  detail: string;
  examples: string[];
  question: string;
}

interface Props {
  layers: Layer[];
}

/** Arquitectura por capas de un agente especializado: de la persona (arriba) al modelo (abajo). */
export default function AgentArchitecture({ layers }: Props) {
  const [id, setId] = useState(layers[0]!.id);
  const layer = layers.find((l) => l.id === id)!;
  return (
    <MotionConfig reducedMotion="user">
      <div className="grid gap-5 md:grid-cols-[1fr_1.1fr]">
        <ol className="flex flex-col gap-1.5" aria-label="Capas del sistema">
          {layers.map((l) => {
            const active = l.id === id;
            return (
              <li key={l.id}>
                <button
                  onClick={() => setId(l.id)}
                  aria-pressed={active}
                  className={`flex w-full items-center gap-3 rounded-xl border-2 px-3 py-2 text-left transition ${
                    active
                      ? "border-[var(--accent)] bg-[var(--accent-soft)]"
                      : "border-line bg-card hover:bg-bg-soft"
                  }`}
                >
                  <span className="text-xl" aria-hidden="true">
                    {l.icon}
                  </span>
                  <span className="min-w-0">
                    <span className="block text-sm font-semibold">{l.name}</span>
                    <span className="block truncate text-xs text-muted">{l.short}</span>
                  </span>
                </button>
              </li>
            );
          })}
        </ol>
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={id}
            initial={{ opacity: 0, x: 12 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="rounded-xl bg-bg-soft p-4"
            aria-live="polite"
          >
            <p className="text-2xl" aria-hidden="true">
              {layer.icon}
            </p>
            <h3 className="font-display text-xl font-semibold">{layer.name}</h3>
            <p className="mt-2 text-sm">{layer.detail}</p>
            <p className="mt-3 text-xs font-semibold tracking-wider text-muted uppercase">
              Ejemplos
            </p>
            <ul className="mt-1 flex flex-wrap gap-1.5">
              {layer.examples.map((e) => (
                <li
                  key={e}
                  className="rounded-full border border-line bg-card px-2.5 py-0.5 text-xs"
                >
                  {e}
                </li>
              ))}
            </ul>
            <p className="mt-4 rounded-lg border-l-4 border-[var(--accent)] bg-card p-3 text-sm">
              <strong>Pregunta clave: </strong>
              {layer.question}
            </p>
          </motion.div>
        </AnimatePresence>
      </div>
    </MotionConfig>
  );
}
