import { MotionConfig, motion } from "motion/react";
import { useEffect, useLayoutEffect, useRef, useState } from "react";

interface Sentence {
  words: string[];
  /** índice de palabra → pesos de atención hacia otras palabras */
  focus: Record<number, Record<number, number>>;
  explain: Record<number, string>;
}

const SENTENCES: Sentence[] = [
  {
    words: ["La", "campaña", "no", "funcionó", "porque", "era", "demasiado", "cara"],
    focus: {
      5: { 1: 0.8, 7: 0.35, 3: 0.15 },
      7: { 1: 0.7, 6: 0.45, 5: 0.25 },
      3: { 1: 0.75, 2: 0.6 },
    },
    explain: {
      5: "«era» se fija sobre todo en «campaña»: el modelo entiende que lo que era cara es la campaña.",
      7: "«cara» mira a «campaña» y a «demasiado»: aquí «cara» significa costosa, no la parte de la cabeza.",
      3: "«funcionó» atiende a «no» (negación) y a «campaña» (qué es lo que no funcionó).",
    },
  },
  {
    words: [
      "La",
      "campaña",
      "no",
      "funcionó",
      "porque",
      "el",
      "público",
      "era",
      "demasiado",
      "joven",
    ],
    focus: {
      7: { 6: 0.85, 9: 0.3, 1: 0.1 },
      9: { 6: 0.8, 8: 0.4 },
      3: { 1: 0.75, 2: 0.6 },
    },
    explain: {
      7: "Ahora «era» se fija en «público», no en «campaña». La misma palabra, otro contexto, otro significado.",
      9: "«joven» se refiere a «público»: el modelo lo deduce gracias a la atención.",
      3: "«funcionó» atiende a «no» y a «campaña», igual que antes.",
    },
  },
];

export default function Attention() {
  const [si, setSi] = useState(0);
  const s = SENTENCES[si]!;
  const firstFocus = Number(Object.keys(s.focus).find((k) => k !== "3") ?? 3);
  const [sel, setSel] = useState(firstFocus);
  const box = useRef<HTMLDivElement>(null);
  const refs = useRef<(HTMLButtonElement | null)[]>([]);
  const [pos, setPos] = useState<{ x: number; w: number }[]>([]);

  useEffect(() => setSel(firstFocus), [si]);

  useLayoutEffect(() => {
    const measure = () => {
      const b = box.current?.getBoundingClientRect();
      if (!b) return;
      setPos(
        refs.current.slice(0, s.words.length).map((el) => {
          const r = el!.getBoundingClientRect();
          return { x: r.left - b.left + r.width / 2, w: r.width };
        }),
      );
    };
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, [si, s.words.length]);

  const weights = s.focus[sel] ?? {};
  const H = 90;

  return (
    <MotionConfig reducedMotion="user">
      <div className="mb-4 flex flex-wrap gap-2">
        {SENTENCES.map((_, i) => (
          <button
            key={i}
            onClick={() => setSi(i)}
            aria-pressed={si === i}
            className={`rounded-full border px-3 py-1 text-sm ${si === i ? "border-[var(--accent)] bg-[var(--accent-soft)] font-medium" : "border-line"}`}
          >
            Frase {i + 1}
          </button>
        ))}
      </div>

      <div className="overflow-x-auto pb-2">
        <div ref={box} className="relative w-max">
          <svg
            className="pointer-events-none absolute top-0 left-0 w-full"
            height={H}
            aria-hidden="true"
          >
            {pos.length === s.words.length &&
              Object.entries(weights).map(([j, wgt]) => {
                const a = pos[sel]!.x;
                const b = pos[Number(j)]!.x;
                const h = Math.min(H - 6, 20 + Math.abs(a - b) * 0.35);
                return (
                  <motion.path
                    key={`${si}-${sel}-${j}`}
                    d={`M ${a} ${H} C ${a} ${H - h}, ${b} ${H - h}, ${b} ${H}`}
                    fill="none"
                    stroke="var(--accent)"
                    strokeWidth={1 + wgt * 7}
                    strokeLinecap="round"
                    initial={{ pathLength: 0, opacity: 0 }}
                    animate={{ pathLength: 1, opacity: 0.25 + wgt * 0.75 }}
                    transition={{ duration: 0.5 }}
                  />
                );
              })}
          </svg>
          <div className="flex gap-1.5 pt-[90px] text-lg sm:text-xl">
            {s.words.map((w, i) => {
              const clickable = i in s.focus;
              const wgt = weights[i] ?? 0;
              return (
                <button
                  key={`${si}-${i}`}
                  ref={(el) => {
                    refs.current[i] = el;
                  }}
                  disabled={!clickable}
                  onClick={() => setSel(i)}
                  aria-pressed={sel === i}
                  className={`rounded-lg px-2 py-1 transition ${
                    sel === i
                      ? "bg-fg text-bg"
                      : clickable
                        ? "border border-dashed border-[var(--accent)] hover:bg-[var(--accent-soft)]"
                        : ""
                  }`}
                  style={
                    wgt && sel !== i
                      ? {
                          background: `color-mix(in srgb, var(--accent) ${Math.round(wgt * 45)}%, transparent)`,
                        }
                      : undefined
                  }
                >
                  {w}
                </button>
              );
            })}
          </div>
        </div>
      </div>
      <motion.p
        key={`${si}-${sel}`}
        initial={false}
        animate={{ opacity: 1 }}
        className="mt-4 rounded-xl bg-bg-soft p-4 text-sm"
        aria-live="polite"
      >
        {s.explain[sel]}
      </motion.p>
      <p className="mt-2 text-xs text-muted">
        Pulsa las palabras con borde discontinuo. El grosor de cada arco indica cuánta «atención»
        presta esa palabra a las demás. Pesos ilustrativos.
      </p>
    </MotionConfig>
  );
}
