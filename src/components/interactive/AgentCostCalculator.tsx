import { MotionConfig, motion } from "motion/react";
import { useMemo, useState } from "react";
import type { CostItem, Model } from "@/data/schemas";
import { money, moneyRange, num } from "@/lib/format";

interface Props {
  models: Model[];
  costs: CostItem[];
}

const SESSION_TYPES = [
  {
    id: "ligera",
    label: "Ligera",
    desc: "consultas y textos cortos",
    input: 30_000,
    output: 4_000,
  },
  {
    id: "media",
    label: "Media",
    desc: "trabajar sobre un guion completo",
    input: 300_000,
    output: 20_000,
  },
  {
    id: "intensa",
    label: "Intensa",
    desc: "agente con muchos pasos y subagentes",
    input: 2_000_000,
    output: 80_000,
  },
];

/** Calculadora de coste mensual de un agente: usuarios × sesiones × tokens × precio. */
export default function AgentCostCalculator({ models, costs }: Props) {
  const llms = useMemo(
    () =>
      models.filter(
        (m) =>
          m.type.includes("llm") &&
          m.pricing?.unit === "1M tokens" &&
          m.pricing.input !== null &&
          m.pricing.output !== null,
      ),
    [models],
  );
  const imgCost = costs.find((c) => c.id === "api-imagen")!.range;
  const [modelId, setModelId] = useState(
    llms.find((m) => m.id === "claude-sonnet-5-5")?.id ?? llms[0]!.id,
  );
  const [users, setUsers] = useState(10);
  const [sessions, setSessions] = useState(20);
  const [stype, setStype] = useState("media");
  const [images, setImages] = useState(200);
  const [cacheDiscount, setCacheDiscount] = useState(true);

  const model = llms.find((m) => m.id === modelId)!;
  const st = SESSION_TYPES.find((s) => s.id === stype)!;
  // Con caché de prompt, la mayor parte de la entrada repetida se cobra mucho más barata. Supuesto prudente: −50 % en entrada.
  const inputFactor = cacheDiscount ? 0.5 : 1;
  const perSession =
    (st.input * model.pricing!.input! * inputFactor + st.output * model.pricing!.output!) / 1e6;
  const monthlyLLM = perSession * sessions * users;
  const monthlyImg = { min: images * users * imgCost.min, max: images * users * imgCost.max };
  const total = { min: monthlyLLM + monthlyImg.min, max: monthlyLLM + monthlyImg.max };
  const max = Math.max(monthlyLLM, monthlyImg.max, 1);

  return (
    <MotionConfig reducedMotion="user">
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="space-y-4 text-sm">
          <div>
            <label htmlFor="calc-model" className="font-medium">
              Modelo de lenguaje
            </label>
            <select
              id="calc-model"
              value={modelId}
              onChange={(e) => setModelId(e.target.value)}
              className="mt-1 w-full rounded-lg border border-line bg-card p-2"
            >
              {llms.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.name} — {money(m.pricing!.input!)} / {money(m.pricing!.output!)} por 1M tokens
                </option>
              ))}
            </select>
          </div>
          <Range label="Personas usuarias" value={users} min={1} max={200} onChange={setUsers} />
          <Range
            label="Sesiones por persona y mes"
            value={sessions}
            min={1}
            max={100}
            onChange={setSessions}
          />
          <fieldset>
            <legend className="font-medium">Tipo de sesión</legend>
            <div className="mt-1 grid gap-1.5 sm:grid-cols-3">
              {SESSION_TYPES.map((s) => (
                <button
                  key={s.id}
                  onClick={() => setStype(s.id)}
                  aria-pressed={stype === s.id}
                  className={`rounded-lg border p-2 text-left ${stype === s.id ? "border-[var(--accent)] bg-[var(--accent-soft)]" : "border-line"}`}
                >
                  <span className="block font-semibold">{s.label}</span>
                  <span className="block text-xs text-muted">{s.desc}</span>
                </button>
              ))}
            </div>
          </fieldset>
          <Range
            label="Imágenes (storyboard, moodboards) por persona y mes"
            value={images}
            min={0}
            max={2000}
            step={50}
            onChange={setImages}
          />
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={cacheDiscount}
              onChange={(e) => setCacheDiscount(e.target.checked)}
              className="size-4 accent-[var(--accent)]"
            />
            Aplicar caché de prompt (abarata el contexto que se repite)
          </label>
        </div>

        <div className="space-y-4">
          <div className="rounded-2xl bg-[var(--accent-soft)] p-5 text-center">
            <p className="text-sm text-muted">Coste mensual estimado</p>
            <p className="font-display text-4xl font-semibold tabular-nums">
              {moneyRange(total.min, total.max)}
            </p>
            <p className="mt-1 text-sm text-muted">
              ≈ {moneyRange(total.min / users, total.max / users)} por persona y mes
            </p>
          </div>
          <Row
            label="Modelo de lenguaje"
            value={money(monthlyLLM)}
            width={(monthlyLLM / max) * 100}
          />
          <Row
            label="Generación de imágenes"
            value={moneyRange(monthlyImg.min, monthlyImg.max)}
            width={(monthlyImg.max / max) * 100}
          />
          <div className="rounded-xl bg-bg-soft p-3 text-xs leading-relaxed text-muted">
            <p>
              <strong className="text-fg">Por sesión:</strong> {num(st.input)} tokens de entrada
              {cacheDiscount ? " (con −50 % por caché)" : ""} y {num(st.output)} de salida ={" "}
              {money(perSession)}.
            </p>
            <p className="mt-1">
              <strong className="text-fg">Mensual:</strong> {money(perSession)} × {sessions}{" "}
              sesiones × {users} personas, más {num(images * users)} imágenes a{" "}
              {moneyRange(imgCost.min, imgCost.max)}.
            </p>
            <p className="mt-1">
              No incluye: licencia o suscripción del producto, desarrollo y mantenimiento, ni
              infraestructura. Compáralo con el coste de las horas de trabajo que ahorra.
            </p>
          </div>
        </div>
      </div>
    </MotionConfig>
  );
}

function Range({
  label,
  value,
  min,
  max,
  step = 1,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  onChange: (n: number) => void;
}) {
  const id = `r-${label.replace(/\W+/g, "-")}`;
  return (
    <div>
      <label htmlFor={id} className="flex justify-between font-medium">
        {label} <span className="tabular-nums">{num(value)}</span>
      </label>
      <input
        id={id}
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full accent-[var(--accent)]"
      />
    </div>
  );
}

function Row({ label, value, width }: { label: string; value: string; width: number }) {
  return (
    <div>
      <p className="flex justify-between text-sm">
        <span className="font-medium">{label}</span>
        <span className="tabular-nums">{value}</span>
      </p>
      <div className="mt-1 h-5 overflow-hidden rounded-lg bg-bg-soft">
        <motion.div
          className="h-full rounded-lg bg-[var(--accent)]"
          initial={false}
          animate={{ width: `${Math.max(1, width)}%` }}
        />
      </div>
    </div>
  );
}
