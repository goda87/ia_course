import { AnimatePresence, MotionConfig, motion } from "motion/react";
import { useState } from "react";

export interface BeforeAfterItem {
  topic: string;
  before: string;
  after: string;
}

interface Props {
  items: BeforeAfterItem[];
  beforeLabel?: string;
  afterLabel?: string;
}

/** Interruptor global «antes / ahora» que da la vuelta a todas las tarjetas a la vez. */
export default function BeforeAfter({ items, beforeLabel = "2021", afterLabel = "Hoy" }: Props) {
  const [now, setNow] = useState(false);
  return (
    <MotionConfig reducedMotion="user">
      <div className="mb-5 flex items-center justify-center gap-3">
        <span className={`text-sm font-medium ${now ? "text-muted" : ""}`}>{beforeLabel}</span>
        <button
          role="switch"
          aria-checked={now}
          aria-label={`Ver cómo era en ${beforeLabel} o cómo es ${afterLabel.toLowerCase()}`}
          onClick={() => setNow((v) => !v)}
          className={`relative h-8 w-16 rounded-full border border-line transition-colors ${
            now ? "bg-[var(--accent)]" : "bg-bg-soft"
          }`}
        >
          <motion.span
            className="absolute top-1 left-1 block size-6 rounded-full bg-card shadow"
            animate={{ x: now ? 32 : 0 }}
            transition={{ type: "spring", stiffness: 500, damping: 30 }}
          />
        </button>
        <span className={`text-sm font-medium ${now ? "" : "text-muted"}`}>{afterLabel}</span>
      </div>
      <ul className="grid gap-3 sm:grid-cols-2">
        {items.map((it, i) => (
          <li
            key={it.topic}
            className={`relative overflow-hidden rounded-xl border p-4 transition-colors ${
              now ? "border-[var(--accent)] bg-[var(--accent-soft)]" : "border-line bg-bg-soft"
            }`}
          >
            <p className="text-xs font-semibold tracking-wider text-muted uppercase">{it.topic}</p>
            <AnimatePresence mode="wait" initial={false}>
              <motion.p
                key={now ? "a" : "b"}
                initial={{ opacity: 0, rotateX: -60 }}
                animate={{ opacity: 1, rotateX: 0 }}
                exit={{ opacity: 0, rotateX: 60 }}
                transition={{ duration: 0.3, delay: i * 0.04 }}
                className="mt-1 leading-snug"
              >
                {now ? it.after : it.before}
              </motion.p>
            </AnimatePresence>
          </li>
        ))}
      </ul>
    </MotionConfig>
  );
}
