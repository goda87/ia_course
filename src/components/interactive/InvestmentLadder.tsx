import { AnimatePresence, MotionConfig, motion } from "motion/react";
import { useState } from "react";

export interface Rung {
  level: number;
  name: string;
  what: string;
  cost: string;
  time: string;
  pros: string[];
  cons: string[];
  when: string;
}

interface Props {
  rungs: Rung[];
}

/** Escalera de inversión: cada peldaño es un enfoque más ambicioso (y caro) que el anterior. */
export default function InvestmentLadder({ rungs }: Props) {
  const [i, setI] = useState(1);
  const r = rungs[i]!;
  return (
    <MotionConfig reducedMotion="user">
      <div
        className="flex h-44 items-end gap-1.5 sm:gap-2"
        role="group"
        aria-label="Niveles de inversión"
      >
        {rungs.map((x, k) => {
          const active = k === i;
          return (
            <motion.button
              key={x.level}
              onClick={() => setI(k)}
              aria-pressed={active}
              initial={false}
              animate={{ height: `${28 + k * 18}%` }}
              whileHover={{ y: -3 }}
              className={`relative flex flex-1 flex-col justify-end rounded-t-xl border-2 border-b-0 p-2 text-left transition-colors ${
                active
                  ? "border-[var(--accent)] bg-[var(--accent-soft)]"
                  : "border-line bg-card hover:bg-bg-soft"
              }`}
            >
              <span className="text-xs text-muted">Nivel {x.level}</span>
              <span className="text-[11px] leading-tight font-semibold sm:text-sm">{x.name}</span>
            </motion.button>
          );
        })}
      </div>
      <div className="flex justify-between border-t-2 border-fg/60 pt-1 text-xs text-muted">
        <span>Menos inversión y control</span>
        <span>Más inversión y control</span>
      </div>

      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={i}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="mt-5"
          aria-live="polite"
        >
          <h3 className="font-display text-xl font-semibold">
            Nivel {r.level}. {r.name}
          </h3>
          <p className="mt-1">{r.what}</p>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <div className="rounded-xl bg-[var(--accent-soft)] p-3">
              <p className="text-xs font-semibold tracking-wider text-muted uppercase">
                Coste orientativo
              </p>
              <p className="mt-1 font-medium">{r.cost}</p>
            </div>
            <div className="rounded-xl bg-bg-soft p-3">
              <p className="text-xs font-semibold tracking-wider text-muted uppercase">Plazo</p>
              <p className="mt-1 font-medium">{r.time}</p>
            </div>
            <div className="rounded-xl bg-bg-soft p-3">
              <p className="text-xs font-semibold tracking-wider text-emerald-700 uppercase dark:text-emerald-400">
                A favor
              </p>
              <ul className="mt-1 list-disc space-y-0.5 pl-5 text-sm">
                {r.pros.map((p) => (
                  <li key={p}>{p}</li>
                ))}
              </ul>
            </div>
            <div className="rounded-xl bg-bg-soft p-3">
              <p className="text-xs font-semibold tracking-wider text-red-700 uppercase dark:text-red-400">
                En contra
              </p>
              <ul className="mt-1 list-disc space-y-0.5 pl-5 text-sm">
                {r.cons.map((p) => (
                  <li key={p}>{p}</li>
                ))}
              </ul>
            </div>
          </div>
          <p className="mt-3 text-sm">
            <strong>Tiene sentido cuando…</strong> {r.when}
          </p>
        </motion.div>
      </AnimatePresence>
    </MotionConfig>
  );
}
