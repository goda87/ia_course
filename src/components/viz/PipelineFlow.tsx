import { AnimatePresence, MotionConfig, motion, useReducedMotion } from "motion/react";
import { useEffect, useState } from "react";

export interface PipelineStep {
  icon: string;
  title: string;
  text: string;
}

interface Props {
  steps: PipelineStep[];
  /** Avance automático en milisegundos; 0 lo desactiva */
  autoplay?: number;
}

/** Diagrama de flujo por pasos: resalta un paso cada vez y explica lo que ocurre en él. */
export default function PipelineFlow({ steps, autoplay = 0 }: Props) {
  const reduce = useReducedMotion();
  const [i, setI] = useState(0);
  const [auto, setAuto] = useState(autoplay > 0);

  useEffect(() => {
    if (!auto || reduce || !autoplay) return;
    const id = setInterval(() => setI((v) => (v + 1) % steps.length), autoplay);
    return () => clearInterval(id);
  }, [auto, reduce, autoplay, steps.length]);

  const pick = (k: number) => {
    setAuto(false);
    setI(k);
  };
  const step = steps[i]!;

  return (
    <MotionConfig reducedMotion="user">
      <ol
        className="flex flex-col items-stretch gap-2 md:flex-row md:items-center"
        aria-label="Pasos del proceso"
      >
        {steps.map((s, k) => (
          <li key={s.title} className="flex flex-1 flex-col items-center gap-2 md:flex-row">
            <button
              onClick={() => pick(k)}
              aria-current={k === i ? "step" : undefined}
              className={`relative flex w-full flex-1 items-center gap-2 rounded-xl border-2 px-3 py-2.5 text-left text-sm transition md:flex-col md:text-center ${
                k === i
                  ? "border-[var(--accent)] bg-[var(--accent-soft)]"
                  : "border-line bg-card hover:bg-bg-soft"
              }`}
            >
              <span className="text-2xl" aria-hidden="true">
                {s.icon}
              </span>
              <span className="leading-tight font-semibold">{s.title}</span>
              {k === i && !reduce && (
                <motion.span
                  layoutId="pipeline-dot"
                  className="absolute -top-1.5 -right-1.5 size-3 rounded-full bg-[var(--accent)]"
                />
              )}
            </button>
            {k < steps.length - 1 && (
              <span
                className={`text-lg ${k < i ? "text-[var(--accent)]" : "text-muted"} rotate-90 md:rotate-0`}
                aria-hidden="true"
              >
                →
              </span>
            )}
          </li>
        ))}
      </ol>
      <div className="mt-4 min-h-20 rounded-xl bg-bg-soft p-4" aria-live="polite">
        <AnimatePresence mode="wait" initial={false}>
          <motion.p
            key={i}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <strong>
              {i + 1}. {step.title}.
            </strong>{" "}
            {step.text}
          </motion.p>
        </AnimatePresence>
      </div>
      {autoplay > 0 && (
        <button onClick={() => setAuto((a) => !a)} className="mt-2 text-xs text-muted underline">
          {auto && !reduce ? "Pausar animación" : "Reproducir automáticamente"}
        </button>
      )}
    </MotionConfig>
  );
}
