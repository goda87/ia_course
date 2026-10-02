import { AnimatePresence, MotionConfig, motion } from "motion/react";
import { useReducedMotionSafe } from "@/lib/motion";
import { useEffect, useRef, useState } from "react";

type Phase = "pensar" | "actuar" | "observar" | "humano" | "fin";

export interface AgentStep {
  phase: Phase;
  text: string;
  tool?: string;
}

export interface AgentScenario {
  goal: string;
  steps: AgentStep[];
}

const NODES: {
  id: Exclude<Phase, "fin" | "humano">;
  label: string;
  icon: string;
  angle: number;
}[] = [
  { id: "pensar", label: "Pensar", icon: "🧠", angle: -90 },
  { id: "actuar", label: "Actuar", icon: "🛠️", angle: 30 },
  { id: "observar", label: "Observar", icon: "👀", angle: 150 },
];

const PHASE_LABEL: Record<Phase, string> = {
  pensar: "Piensa",
  actuar: "Usa una herramienta",
  observar: "Observa el resultado",
  humano: "Pide aprobación",
  fin: "Entrega",
};

interface Props {
  scenario: AgentScenario;
}

/** El bucle de un agente: pensar → actuar → observar, hasta cumplir el objetivo. */
export default function AgentLoop({ scenario }: Props) {
  const reduce = useReducedMotionSafe();
  const [i, setI] = useState(-1);
  const [auto, setAuto] = useState(false);
  const logRef = useRef<HTMLOListElement>(null);
  const step = scenario.steps[i];
  const phase = step?.phase;
  const done = i >= scenario.steps.length - 1;

  useEffect(() => {
    if (!auto) return;
    if (done) {
      setAuto(false);
      return;
    }
    const id = setTimeout(() => setI((v) => v + 1), reduce ? 400 : 1600);
    return () => clearTimeout(id);
  }, [auto, i, done, reduce]);

  useEffect(() => {
    const el = logRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [i]);

  const R = 70;
  const pos = (angle: number) => ({
    x: 100 + R * Math.cos((angle * Math.PI) / 180),
    y: 100 + R * Math.sin((angle * Math.PI) / 180),
  });
  const activeNode = NODES.find((n) => n.id === phase);

  return (
    <MotionConfig reducedMotion="user">
      <p className="rounded-xl bg-bg-soft p-3 text-sm">
        <strong>Objetivo:</strong> {scenario.goal}
      </p>
      <div className="mt-4 grid gap-5 md:grid-cols-[15rem_1fr]">
        <div className="relative mx-auto w-60">
          <svg viewBox="0 0 200 200" className="w-full" aria-hidden="true">
            <circle
              cx="100"
              cy="100"
              r={R}
              fill="none"
              stroke="var(--border)"
              strokeWidth="2"
              strokeDasharray="4 4"
            />
            {activeNode && (
              <motion.circle
                r="7"
                fill="var(--accent)"
                initial={false}
                animate={pos(activeNode.angle)}
                style={{ cx: 0, cy: 0 }}
                transition={{ type: "spring", stiffness: 120, damping: 18 }}
              />
            )}
            <text x="100" y="96" textAnchor="middle" fontSize="11" fill="var(--muted)">
              {phase === "humano"
                ? "⏸ esperando"
                : phase === "fin"
                  ? "✓ terminado"
                  : i < 0
                    ? "listo"
                    : "trabajando"}
            </text>
            <text x="100" y="112" textAnchor="middle" fontSize="10" fill="var(--muted)">
              paso {Math.max(0, i + 1)} / {scenario.steps.length}
            </text>
          </svg>
          {NODES.map((n) => {
            const p = pos(n.angle);
            const active = n.id === phase;
            return (
              <div
                key={n.id}
                className={`absolute flex -translate-x-1/2 -translate-y-1/2 flex-col items-center rounded-xl border-2 px-2 py-1 text-xs font-semibold transition ${
                  active
                    ? "scale-110 border-[var(--accent)] bg-[var(--accent-soft)]"
                    : "border-line bg-card"
                }`}
                style={{ left: `${p.x / 2}%`, top: `${p.y / 2}%` }}
              >
                <span className="text-lg" aria-hidden="true">
                  {n.icon}
                </span>
                {n.label}
              </div>
            );
          })}
          <div
            className={`mx-auto mt-8 w-fit rounded-full border-2 px-3 py-1 text-xs font-semibold transition ${
              phase === "humano"
                ? "border-amber-500 bg-amber-100 dark:bg-amber-900/40"
                : "border-line text-muted"
            }`}
          >
            🙋 Persona supervisora
          </div>
        </div>

        <div className="flex min-w-0 flex-col">
          <ol
            ref={logRef}
            className="h-72 space-y-2 overflow-y-auto rounded-xl border border-line bg-bg-soft p-3 text-sm"
            aria-live="polite"
            aria-label="Registro del agente"
          >
            {i < 0 && (
              <li className="text-muted">
                Pulsa «Siguiente paso» o «Reproducir» para ver trabajar al agente.
              </li>
            )}
            <AnimatePresence initial={false}>
              {scenario.steps.slice(0, i + 1).map((s, k) => (
                <motion.li
                  key={k}
                  initial={{ opacity: 0, x: 12 }}
                  animate={{ opacity: 1, x: 0 }}
                  className={`rounded-lg p-2 ${k === i ? "bg-card shadow-sm" : "opacity-70"}`}
                >
                  <span
                    className={`mr-1 text-xs font-semibold uppercase ${s.phase === "humano" ? "text-amber-600" : "text-[var(--accent)]"}`}
                  >
                    {PHASE_LABEL[s.phase]}
                  </span>
                  {s.tool && <code className="mr-1 rounded bg-fg/10 px-1 text-xs">{s.tool}</code>}
                  {s.text}
                </motion.li>
              ))}
            </AnimatePresence>
          </ol>
          <div className="mt-3 flex flex-wrap gap-2">
            <button
              onClick={() => setI((v) => Math.min(v + 1, scenario.steps.length - 1))}
              disabled={done}
              className="rounded-full bg-fg px-4 py-2 text-sm font-medium text-bg disabled:opacity-40"
            >
              Siguiente paso
            </button>
            <button
              onClick={() => setAuto((a) => !a)}
              disabled={done}
              className="rounded-full border border-line px-4 py-2 text-sm disabled:opacity-40"
            >
              {auto ? "Pausar" : "▶ Reproducir"}
            </button>
            <button
              onClick={() => {
                setAuto(false);
                setI(-1);
              }}
              className="ml-auto rounded-full px-3 py-2 text-sm text-muted hover:bg-bg-soft"
            >
              Reiniciar
            </button>
          </div>
        </div>
      </div>
    </MotionConfig>
  );
}
