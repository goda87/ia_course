import { MotionConfig, motion } from "motion/react";
import { useMemo, useState } from "react";
import type { CostItem } from "@/data/schemas";
import { moneyRange, num } from "@/lib/format";

interface Props {
  costs: CostItem[];
}

type Method = "api-imagen" | "gpu-propia" | "api-video";

const METHODS: { id: Method; label: string; desc: string }[] = [
  {
    id: "api-imagen",
    label: "Imágenes por API",
    desc: "Cada fotograma se genera con un modelo comercial de imagen.",
  },
  {
    id: "gpu-propia",
    label: "Modelo propio en GPU",
    desc: "Modelo abierto con LoRA del estudio, en GPU alquiladas.",
  },
  {
    id: "api-video",
    label: "Vídeo por API",
    desc: "Se generan clips de vídeo a partir de fotogramas clave.",
  },
];

/**
 * Simulador del coste variable de producir animación con IA.
 * Todas las fórmulas y supuestos se muestran en pantalla.
 */
export default function AnimationCostSimulator({ costs }: Props) {
  const c = (id: string) => costs.find((x) => x.id === id)!.range;
  const [minutes, setMinutes] = useState(10);
  const [fps, setFps] = useState(12);
  const [aiShare, setAiShare] = useState(50);
  const [attempts, setAttempts] = useState(4);
  const [retouchShare, setRetouchShare] = useState(60);
  const [retouchMin, setRetouchMin] = useState(10);
  const [artistRate, setArtistRate] = useState(30);
  const [method, setMethod] = useState<Method>("gpu-propia");

  const r = useMemo(() => {
    const frames = minutes * 60 * fps;
    const aiFrames = frames * (aiShare / 100);
    const generated = aiFrames * attempts;
    let gen: { min: number; max: number };
    let formula: string;
    if (method === "api-imagen") {
      const p = c("api-imagen");
      gen = { min: generated * p.min, max: generated * p.max };
      formula = `${num(generated)} imágenes × ${moneyRange(p.min, p.max)} por imagen`;
    } else if (method === "gpu-propia") {
      const gpu = c("gpu-h100");
      const perHour = c("imagenes-por-hora-gpu");
      // Mejor caso: GPU barata y rápida; peor caso: GPU cara y lenta
      gen = { min: (generated / perHour.max) * gpu.min, max: (generated / perHour.min) * gpu.max };
      formula = `${num(generated)} imágenes ÷ ${num(perHour.min)}–${num(perHour.max)} imágenes/hora × ${moneyRange(gpu.min, gpu.max)}/hora de GPU`;
    } else {
      const p = c("api-video");
      const seconds = minutes * 60 * (aiShare / 100) * attempts;
      gen = { min: seconds * p.min, max: seconds * p.max };
      formula = `${num(seconds)} segundos generados × ${moneyRange(p.min, p.max)} por segundo`;
    }
    const retouchHours = (aiFrames * (retouchShare / 100) * retouchMin) / 60;
    const human = retouchHours * artistRate;
    return { frames, aiFrames, generated, gen, formula, retouchHours, human };
  }, [minutes, fps, aiShare, attempts, retouchShare, retouchMin, artistRate, method]);

  const maxBar = Math.max(r.gen.max, r.human, 1);

  return (
    <MotionConfig reducedMotion="user">
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="space-y-4">
          <fieldset>
            <legend className="text-xs font-semibold tracking-wider text-muted uppercase">
              Cómo se genera
            </legend>
            <div className="mt-1 grid gap-1.5">
              {METHODS.map((m) => (
                <label
                  key={m.id}
                  className={`flex cursor-pointer gap-2 rounded-lg border p-2 text-sm ${method === m.id ? "border-[var(--accent)] bg-[var(--accent-soft)]" : "border-line"}`}
                >
                  <input
                    type="radio"
                    name="metodo"
                    checked={method === m.id}
                    onChange={() => setMethod(m.id)}
                    className="mt-0.5 accent-[var(--accent)]"
                  />
                  <span>
                    <strong>{m.label}.</strong> {m.desc}
                  </span>
                </label>
              ))}
            </div>
          </fieldset>
          <Slider
            label="Minutos de animación final"
            value={minutes}
            min={1}
            max={90}
            onChange={setMinutes}
          />
          <div className="flex items-center gap-2 text-sm">
            <span className="w-44 font-medium">Fotogramas por segundo</span>
            {[12, 24].map((f) => (
              <button
                key={f}
                onClick={() => setFps(f)}
                aria-pressed={fps === f}
                className={`rounded-full border px-3 py-1 ${fps === f ? "border-[var(--accent)] bg-[var(--accent-soft)] font-medium" : "border-line"}`}
              >
                {f === 12 ? "12 (en doses)" : "24"}
              </button>
            ))}
          </div>
          <Slider
            label="Parte generada con IA"
            value={aiShare}
            min={0}
            max={100}
            unit="%"
            onChange={setAiShare}
          />
          <Slider
            label="Intentos por resultado útil"
            value={attempts}
            min={1}
            max={15}
            onChange={setAttempts}
            hint="Cuántas generaciones hacen falta de media para quedarse con una buena."
          />
          <Slider
            label="Fotogramas IA que hay que retocar"
            value={retouchShare}
            min={0}
            max={100}
            unit="%"
            onChange={setRetouchShare}
          />
          <Slider
            label="Minutos de artista por retoque"
            value={retouchMin}
            min={1}
            max={60}
            onChange={setRetouchMin}
          />
          <Slider
            label="Coste por hora de artista"
            value={artistRate}
            min={15}
            max={80}
            unit=" $"
            onChange={setArtistRate}
          />
        </div>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-2 text-center text-sm">
            <Box label="Fotogramas totales" value={num(r.frames)} />
            <Box label="Fotogramas con IA" value={num(r.aiFrames)} />
          </div>
          <Bar
            label="Generación con IA"
            value={moneyRange(r.gen.min, r.gen.max)}
            width={(r.gen.max / maxBar) * 100}
            minWidth={(r.gen.min / maxBar) * 100}
          />
          <Bar
            label={`Retoque humano (${num(r.retouchHours)} h)`}
            value={moneyRange(r.human, r.human)}
            width={(r.human / maxBar) * 100}
          />
          <div className="rounded-xl bg-bg-soft p-3 text-xs leading-relaxed text-muted">
            <p>
              <strong className="text-fg">Cálculo de generación:</strong> {r.formula}.
            </p>
            <p className="mt-1">
              <strong className="text-fg">Cálculo de retoque:</strong> {num(r.aiFrames)} fotogramas
              × {retouchShare} % × {retouchMin} min × {artistRate} $/h.
            </p>
            <p className="mt-1">
              No incluye: puesta en marcha (dataset, entrenamiento, desarrollo del flujo), animación
              tradicional del resto de fotogramas, licencias de software ni gestión. Precios de
              referencia en la sección de fuentes.
            </p>
          </div>
          {r.human > r.gen.max && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="rounded-xl border-l-4 border-[var(--accent)] bg-[var(--accent-soft)] p-3 text-sm"
            >
              <strong>Fíjate:</strong> el coste de cálculo es pequeño comparado con el tiempo de las
              personas. En la mayoría de proyectos, la clave económica es{" "}
              <strong>cuánto retoque necesita lo generado</strong>, no el precio de la GPU.
            </motion.p>
          )}
        </div>
      </div>
    </MotionConfig>
  );
}

function Slider({
  label,
  value,
  min,
  max,
  unit = "",
  hint,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  unit?: string;
  hint?: string;
  onChange: (n: number) => void;
}) {
  const id = `s-${label.replace(/\W+/g, "-")}`;
  return (
    <div>
      <label htmlFor={id} className="flex justify-between text-sm font-medium">
        {label}
        <span className="tabular-nums">
          {value}
          {unit}
        </span>
      </label>
      <input
        id={id}
        type="range"
        min={min}
        max={max}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full accent-[var(--accent)]"
      />
      {hint && <p className="text-xs text-muted">{hint}</p>}
    </div>
  );
}

function Box({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-bg-soft p-3">
      <p className="text-xs text-muted">{label}</p>
      <p className="font-display text-xl font-semibold tabular-nums">{value}</p>
    </div>
  );
}

function Bar({
  label,
  value,
  width,
  minWidth,
}: {
  label: string;
  value: string;
  width: number;
  minWidth?: number;
}) {
  return (
    <div>
      <p className="flex justify-between text-sm">
        <span className="font-medium">{label}</span>
        <span className="tabular-nums">{value}</span>
      </p>
      <div className="relative mt-1 h-6 overflow-hidden rounded-lg bg-bg-soft">
        <motion.div
          className="absolute inset-y-0 left-0 rounded-lg bg-[var(--accent)]/40"
          initial={false}
          animate={{ width: `${Math.max(1, width)}%` }}
        />
        {minWidth !== undefined && (
          <motion.div
            className="absolute inset-y-0 left-0 rounded-lg bg-[var(--accent)]"
            initial={false}
            animate={{ width: `${Math.max(1, minWidth)}%` }}
          />
        )}
      </div>
    </div>
  );
}
