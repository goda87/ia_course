import { MotionConfig, motion } from "motion/react";
import { useMemo, useState } from "react";
import type { Model } from "@/data/schemas";

interface Props {
  models: Model[];
}

const SCENARIOS = [
  {
    id: "chat",
    label: "Consulta de chat",
    input: 2000,
    output: 500,
    desc: "una pregunta con algo de contexto y una respuesta de media página",
  },
  {
    id: "doc",
    label: "Resumir un informe",
    input: 40000,
    output: 1500,
    desc: "un documento de unas 60 páginas y un resumen de dos páginas",
  },
  {
    id: "agente",
    label: "Tarea de agente",
    input: 400000,
    output: 30000,
    desc: "un agente que da unos 30 pasos releyendo su contexto en cada uno",
  },
];

const FLAG: Record<string, string> = { US: "🇺🇸", CN: "🇨🇳", EU: "🇪🇺", other: "🌐" };

/** Coste de 1.000 tareas iguales con cada modelo de texto que publica precio. */
export default function PriceBars({ models }: Props) {
  const [sid, setSid] = useState(SCENARIOS[0]!.id);
  const sc = SCENARIOS.find((s) => s.id === sid)!;
  const rows = useMemo(
    () =>
      models
        .filter(
          (m) =>
            m.type.includes("llm") &&
            m.pricing?.unit === "1M tokens" &&
            m.pricing.input !== null &&
            m.pricing.output !== null,
        )
        .map((m) => ({
          m,
          cost: ((sc.input * m.pricing!.input! + sc.output * m.pricing!.output!) / 1e6) * 1000,
        }))
        .sort((a, b) => b.cost - a.cost),
    [models, sc],
  );
  const max = Math.max(...rows.map((r) => r.cost));

  return (
    <MotionConfig reducedMotion="user">
      <div className="flex flex-wrap gap-2" role="group" aria-label="Tipo de tarea">
        {SCENARIOS.map((s) => (
          <button
            key={s.id}
            onClick={() => setSid(s.id)}
            aria-pressed={s.id === sid}
            className={`rounded-full border px-3 py-1 text-sm ${s.id === sid ? "border-[var(--accent)] bg-[var(--accent-soft)] font-medium" : "border-line hover:bg-bg-soft"}`}
          >
            {s.label}
          </button>
        ))}
      </div>
      <p className="mt-3 text-sm text-muted">
        Coste de <strong className="text-fg">1.000</strong> tareas de tipo{" "}
        {`«${sc.label.toLowerCase()}»`}: {sc.desc} ({sc.input.toLocaleString("es-ES")} tokens de
        entrada y {sc.output.toLocaleString("es-ES")} de salida cada una).
      </p>
      <ul className="mt-4 space-y-1.5">
        {rows.map(({ m, cost }) => (
          <li
            key={m.id}
            className="grid grid-cols-[minmax(0,10rem)_1fr_5.5rem] items-center gap-2 text-sm"
          >
            <span className="truncate" title={m.name}>
              {FLAG[m.country]} {m.name}
            </span>
            <span className="h-5 rounded bg-bg-soft">
              <motion.span
                className="block h-full rounded bg-[var(--accent)]"
                initial={false}
                animate={{ width: `${Math.max(0.6, (cost / max) * 100)}%` }}
                transition={{ type: "spring", stiffness: 120, damping: 20 }}
              />
            </span>
            <span className="text-right tabular-nums">
              {cost.toLocaleString("es-ES", {
                style: "currency",
                currency: "USD",
                maximumFractionDigits: cost < 10 ? 2 : 0,
              })}
            </span>
          </li>
        ))}
      </ul>
      <p className="mt-3 text-xs text-muted">
        Precios de lista por API, sin descuentos por caché ni por lote, que pueden reducir mucho el
        coste real. Los modelos de razonamiento generan además tokens de «pensamiento» que también
        se pagan.
      </p>
    </MotionConfig>
  );
}
