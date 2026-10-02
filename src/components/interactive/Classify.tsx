import { AnimatePresence, MotionConfig, motion } from "motion/react";
import { useState } from "react";

export interface ClassifyItem {
  text: string;
  answer: string;
  explain: string;
}

interface Props {
  question: string;
  options: string[];
  items: ClassifyItem[];
}

/** Mini-ejercicio: clasificar ejemplos en categorías, con explicación tras cada respuesta. */
export default function Classify({ question, options, items }: Props) {
  const [i, setI] = useState(0);
  const [picked, setPicked] = useState<string | null>(null);
  const [score, setScore] = useState(0);
  const done = i >= items.length;
  const item = items[i];

  const pick = (o: string) => {
    if (picked || !item) return;
    setPicked(o);
    if (o === item.answer) setScore((s) => s + 1);
  };
  const next = () => {
    setPicked(null);
    setI((v) => v + 1);
  };
  const restart = () => {
    setI(0);
    setScore(0);
    setPicked(null);
  };

  return (
    <MotionConfig reducedMotion="user">
      <div className="mx-auto max-w-xl">
        <p className="mb-4 text-center text-sm text-muted">{question}</p>
        <AnimatePresence mode="wait" initial={false}>
          {done ? (
            <motion.div
              key="done"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="rounded-2xl bg-bg-soft p-6 text-center"
            >
              <p className="font-display text-3xl font-semibold">
                {score} / {items.length}
              </p>
              <p className="mt-2 text-muted">
                {score === items.length
                  ? "¡Perfecto! Tienes la distinción clara."
                  : "Bien. Revisa las explicaciones: la frontera no siempre es obvia."}
              </p>
              <button
                onClick={restart}
                className="mt-4 rounded-full border border-line px-4 py-2 text-sm hover:bg-card"
              >
                Repetir
              </button>
            </motion.div>
          ) : (
            item && (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -30 }}
                transition={{ duration: 0.2 }}
              >
                <p className="text-xs text-muted tabular-nums">
                  {i + 1} de {items.length}
                </p>
                <p className="mt-1 rounded-2xl border border-line bg-bg-soft p-5 text-lg font-medium">
                  {item.text}
                </p>
                <div className="mt-4 grid gap-2 sm:grid-cols-2">
                  {options.map((o) => {
                    const isRight = picked && o === item.answer;
                    const isWrong = picked === o && o !== item.answer;
                    return (
                      <button
                        key={o}
                        onClick={() => pick(o)}
                        disabled={!!picked}
                        className={`rounded-xl border-2 px-4 py-3 font-medium transition ${
                          isRight
                            ? "border-emerald-500 bg-emerald-500/10"
                            : isWrong
                              ? "border-red-500 bg-red-500/10"
                              : "border-line hover:border-[var(--accent)]"
                        } ${picked && !isRight && !isWrong ? "opacity-50" : ""}`}
                      >
                        {o} {isRight ? "✓" : isWrong ? "✗" : ""}
                      </button>
                    );
                  })}
                </div>
                {picked && (
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-4 rounded-xl bg-[var(--accent-soft)] p-4"
                    aria-live="polite"
                  >
                    <p>
                      <strong>
                        {picked === item.answer ? "¡Correcto! " : `Es «${item.answer}». `}
                      </strong>
                      {item.explain}
                    </p>
                    <button
                      onClick={next}
                      className="mt-3 rounded-full bg-fg px-4 py-2 text-sm font-medium text-bg"
                    >
                      {i + 1 < items.length ? "Siguiente" : "Ver resultado"}
                    </button>
                  </motion.div>
                )}
              </motion.div>
            )
          )}
        </AnimatePresence>
      </div>
    </MotionConfig>
  );
}
