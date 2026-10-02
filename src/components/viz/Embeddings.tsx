import { MotionConfig, motion } from "motion/react";
import { useState } from "react";

type Group = "ciudad" | "pais" | "persona" | "emocion" | "bebida";

const GROUP_COLOR: Record<Group, string> = {
  ciudad: "#0ea5e9",
  pais: "#14b8a6",
  persona: "#a855f7",
  emocion: "#f43f5e",
  bebida: "#f59e0b",
};
const GROUP_LABEL: Record<Group, string> = {
  ciudad: "Capitales",
  pais: "Países",
  persona: "Personas",
  emocion: "Emociones",
  bebida: "Bebidas",
};

// Posiciones ilustrativas en 2D (los embeddings reales tienen miles de dimensiones)
const WORDS: { w: string; x: number; y: number; g: Group }[] = [
  { w: "Madrid", x: 18, y: 20, g: "ciudad" },
  { w: "París", x: 26, y: 14, g: "ciudad" },
  { w: "Roma", x: 30, y: 24, g: "ciudad" },
  { w: "Lisboa", x: 10, y: 28, g: "ciudad" },
  { w: "España", x: 18, y: 44, g: "pais" },
  { w: "Francia", x: 26, y: 38, g: "pais" },
  { w: "Italia", x: 30, y: 48, g: "pais" },
  { w: "Portugal", x: 12, y: 54, g: "pais" },
  { w: "rey", x: 62, y: 18, g: "persona" },
  { w: "reina", x: 74, y: 30, g: "persona" },
  { w: "hombre", x: 58, y: 36, g: "persona" },
  { w: "mujer", x: 70, y: 48, g: "persona" },
  { w: "alegría", x: 60, y: 68, g: "emocion" },
  { w: "felicidad", x: 72, y: 84, g: "emocion" },
  { w: "tristeza", x: 84, y: 66, g: "emocion" },
  { w: "enfado", x: 88, y: 78, g: "emocion" },
  { w: "café", x: 24, y: 76, g: "bebida" },
  { w: "té", x: 32, y: 84, g: "bebida" },
  { w: "zumo", x: 16, y: 86, g: "bebida" },
  { w: "cerveza", x: 38, y: 74, g: "bebida" },
];

const dist = (a: { x: number; y: number }, b: { x: number; y: number }) =>
  Math.hypot(a.x - b.x, a.y - b.y);

const ANALOGIES = [
  { label: "rey − hombre + mujer ≈ ?", from: "hombre", to: "mujer", start: "rey", end: "reina" },
  {
    label: "Madrid − España + Francia ≈ ?",
    from: "España",
    to: "Francia",
    start: "Madrid",
    end: "París",
  },
];

export default function Embeddings() {
  const [sel, setSel] = useState<string>("Madrid");
  const [analogy, setAnalogy] = useState<number | null>(null);
  const selected = WORDS.find((w) => w.w === sel)!;
  const neighbors = WORDS.filter((w) => w.w !== sel)
    .sort((a, b) => dist(a, selected) - dist(b, selected))
    .slice(0, 3)
    .map((w) => w.w);

  const get = (w: string) => WORDS.find((x) => x.w === w)!;
  const an = analogy !== null ? ANALOGIES[analogy]! : null;

  return (
    <MotionConfig reducedMotion="user">
      <div className="grid gap-5 md:grid-cols-[1fr_14rem]">
        <svg
          viewBox="0 0 100 100"
          className="aspect-square w-full rounded-xl bg-bg-soft"
          role="img"
          aria-label="Mapa de palabras: las de significado parecido aparecen cerca"
        >
          <defs>
            <marker
              id="arrow"
              viewBox="0 0 10 10"
              refX="8"
              refY="5"
              markerWidth="5"
              markerHeight="5"
              orient="auto-start-reverse"
            >
              <path d="M0,0 L10,5 L0,10 z" fill="currentColor" />
            </marker>
          </defs>
          {!an &&
            neighbors.map((n) => {
              const o = get(n);
              return (
                <motion.line
                  key={`${sel}-${n}`}
                  x1={selected.x}
                  y1={selected.y}
                  x2={o.x}
                  y2={o.y}
                  stroke="var(--accent)"
                  strokeWidth={0.4}
                  strokeDasharray="1 1"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ duration: 0.4 }}
                />
              );
            })}
          {an && (
            <g className="text-fg">
              {/* vector hombre→mujer */}
              <motion.line
                key={`a1-${analogy}`}
                x1={get(an.from).x}
                y1={get(an.from).y}
                x2={get(an.to).x}
                y2={get(an.to).y}
                stroke="currentColor"
                strokeWidth={0.6}
                markerEnd="url(#arrow)"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 0.6 }}
              />
              {/* mismo vector aplicado a rey */}
              <motion.line
                key={`a2-${analogy}`}
                x1={get(an.start).x}
                y1={get(an.start).y}
                x2={get(an.end).x}
                y2={get(an.end).y}
                stroke="var(--accent)"
                strokeWidth={0.8}
                markerEnd="url(#arrow)"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 0.6, delay: 0.7 }}
              />
            </g>
          )}
          {WORDS.map((w) => {
            const active = an
              ? [an.from, an.to, an.start, an.end].includes(w.w)
              : w.w === sel || neighbors.includes(w.w);
            return (
              <g
                key={w.w}
                onClick={() => {
                  setAnalogy(null);
                  setSel(w.w);
                }}
                className="cursor-pointer"
                opacity={active ? 1 : 0.45}
                role="button"
                tabIndex={0}
                aria-label={w.w}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    setAnalogy(null);
                    setSel(w.w);
                  }
                }}
              >
                <motion.circle
                  cx={w.x}
                  cy={w.y}
                  fill={GROUP_COLOR[w.g]}
                  initial={false}
                  animate={{ r: w.w === sel && !an ? 2.4 : 1.5 }}
                />
                <text
                  x={w.x}
                  y={w.y - 3}
                  textAnchor="middle"
                  fontSize={3.2}
                  fill="currentColor"
                  className="text-fg select-none"
                  fontWeight={w.w === sel && !an ? 700 : 400}
                >
                  {w.w}
                </text>
              </g>
            );
          })}
        </svg>

        <div className="space-y-4 text-sm">
          <div>
            <p className="text-xs font-semibold tracking-wider text-muted uppercase">
              Seleccionada
            </p>
            <p className="font-display text-2xl font-semibold">{an ? an.label : sel}</p>
            {!an && (
              <p className="mt-1">
                Más cercanas: <strong>{neighbors.join(", ")}</strong>
              </p>
            )}
            {an && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.3 }}
                className="mt-1"
              >
                El mismo «desplazamiento» que lleva de <strong>{an.from}</strong> a{" "}
                <strong>{an.to}</strong> lleva de <strong>{an.start}</strong> a{" "}
                <strong>{an.end}</strong>.
              </motion.p>
            )}
          </div>
          <div>
            <p className="text-xs font-semibold tracking-wider text-muted uppercase">
              Aritmética de significados
            </p>
            <div className="mt-1 flex flex-col gap-2">
              {ANALOGIES.map((a, i) => (
                <button
                  key={a.label}
                  onClick={() => setAnalogy(i)}
                  aria-pressed={analogy === i}
                  className={`rounded-lg border px-3 py-2 text-left ${analogy === i ? "border-[var(--accent)] bg-[var(--accent-soft)]" : "border-line hover:bg-bg-soft"}`}
                >
                  {a.label}
                </button>
              ))}
            </div>
          </div>
          <ul className="flex flex-wrap gap-x-3 gap-y-1 text-xs text-muted">
            {(Object.keys(GROUP_COLOR) as Group[]).map((g) => (
              <li key={g} className="flex items-center gap-1">
                <span className="size-2 rounded-full" style={{ background: GROUP_COLOR[g] }} />
                {GROUP_LABEL[g]}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </MotionConfig>
  );
}
