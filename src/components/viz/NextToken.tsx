import { AnimatePresence, MotionConfig, motion } from "motion/react";
import { useMemo, useState } from "react";

interface Scenario {
  id: string;
  label: string;
  prompt: string;
  candidates: [string, number][];
  note: string;
}

const SCENARIOS: Scenario[] = [
  {
    id: "campana",
    label: "Frase de marketing",
    prompt: "Nuestra nueva campaña de verano ha sido todo un",
    candidates: [
      ["éxito", 0.58],
      ["acierto", 0.13],
      ["fracaso", 0.08],
      ["reto", 0.07],
      ["desastre", 0.05],
      ["bombazo", 0.04],
      ["descubrimiento", 0.03],
      ["poema", 0.02],
    ],
    note: "Con temperatura baja casi siempre elige «éxito». Súbela y empezarán a aparecer opciones menos habituales (y algunas absurdas).",
  },
  {
    id: "australia",
    label: "Un dato",
    prompt: "La capital de Australia es",
    candidates: [
      ["Canberra", 0.72],
      ["Sídney", 0.19],
      ["Melbourne", 0.06],
      ["una", 0.03],
    ],
    note: "La respuesta correcta es la más probable, pero la incorrecta («Sídney», muy citada en internet) también tiene opciones. Así se cuelan errores.",
  },
  {
    id: "nobel",
    label: "Algo que no existe",
    prompt: "El Premio Nobel de Marketing de 2019 lo ganó",
    candidates: [
      ["Philip", 0.31],
      ["el", 0.22],
      ["Seth", 0.16],
      ["la", 0.12],
      ["Byron", 0.1],
      ["nadie", 0.09],
    ],
    note: "No existe ningún Nobel de Marketing. El modelo no «sabe que no sabe»: continúa la frase de forma plausible y puede inventar un ganador con total seguridad. Eso es una alucinación.",
  },
];

/** Reescala probabilidades con la temperatura: p^(1/T) normalizado. */
function applyTemperature(cands: [string, number][], t: number): [string, number][] {
  if (t <= 0.05) {
    const max = Math.max(...cands.map((c) => c[1]));
    return cands.map(([w, p]) => [w, p === max ? 1 : 0]);
  }
  const scaled = cands.map(([w, p]) => [w, Math.pow(p, 1 / t)] as [string, number]);
  const sum = scaled.reduce((s, c) => s + c[1], 0);
  return scaled.map(([w, p]) => [w, p / sum]);
}

function sample(dist: [string, number][]): string {
  let r = Math.random();
  for (const [w, p] of dist) {
    r -= p;
    if (r <= 0) return w;
  }
  return dist[dist.length - 1]![0];
}

export default function NextToken() {
  const [sid, setSid] = useState(SCENARIOS[0]!.id);
  const [temp, setTemp] = useState(0.7);
  const [picks, setPicks] = useState<string[]>([]);
  const scenario = SCENARIOS.find((s) => s.id === sid)!;
  const dist = useMemo(() => applyTemperature(scenario.candidates, temp), [scenario, temp]);
  const last = picks[picks.length - 1];

  const choose = (id: string) => {
    setSid(id);
    setPicks([]);
  };

  return (
    <MotionConfig reducedMotion="user">
      <div className="flex flex-wrap gap-2" role="group" aria-label="Elige un ejemplo">
        {SCENARIOS.map((s) => (
          <button
            key={s.id}
            onClick={() => choose(s.id)}
            aria-pressed={s.id === sid}
            className={`rounded-full border px-3 py-1 text-sm ${
              s.id === sid
                ? "border-[var(--accent)] bg-[var(--accent-soft)] font-medium"
                : "border-line"
            }`}
          >
            {s.label}
          </button>
        ))}
      </div>

      <p className="mt-5 rounded-xl bg-bg-soft p-4 text-lg sm:text-xl">
        {scenario.prompt}{" "}
        <AnimatePresence mode="wait" initial={false}>
          <motion.span
            key={`${picks.length}-${last}`}
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded bg-[var(--accent-soft)] px-1 font-semibold text-[var(--accent)]"
          >
            {last ?? "___"}
          </motion.span>
        </AnimatePresence>
      </p>

      <div className="mt-5 grid gap-6 md:grid-cols-[1fr_14rem]">
        <ul className="space-y-1.5" aria-label="Probabilidad de cada palabra siguiente">
          {dist.map(([w, p]) => (
            <li key={w} className="grid grid-cols-[7.5rem_1fr_3rem] items-center gap-2 text-sm">
              <span className={`truncate ${w === last ? "font-semibold" : ""}`}>{w}</span>
              <span className="h-5 overflow-hidden rounded bg-bg-soft">
                <motion.span
                  className="block h-full rounded bg-[var(--accent)]"
                  initial={false}
                  animate={{ width: `${p * 100}%` }}
                  transition={{ type: "spring", stiffness: 200, damping: 25 }}
                />
              </span>
              <span className="text-right text-muted tabular-nums">{Math.round(p * 100)} %</span>
            </li>
          ))}
        </ul>

        <div className="space-y-4">
          <div>
            <label htmlFor="temp" className="flex justify-between text-sm font-medium">
              Temperatura <span className="tabular-nums">{temp.toFixed(1)}</span>
            </label>
            <input
              id="temp"
              type="range"
              min={0}
              max={2}
              step={0.1}
              value={temp}
              onChange={(e) => setTemp(Number(e.target.value))}
              className="mt-1 w-full accent-[var(--accent)]"
            />
            <p className="flex justify-between text-xs text-muted">
              <span>Previsible</span>
              <span>Creativa</span>
            </p>
          </div>
          <button
            onClick={() => setPicks((p) => [...p, sample(dist)].slice(-12))}
            className="w-full rounded-full bg-fg px-4 py-2.5 font-medium text-bg hover:opacity-90"
          >
            Generar palabra
          </button>
          {picks.length > 0 && (
            <p className="text-xs text-muted">
              Últimas elecciones: <span className="text-fg">{picks.join(", ")}</span>
            </p>
          )}
        </div>
      </div>

      <p className="mt-5 border-t border-line pt-4 text-sm">{scenario.note}</p>
    </MotionConfig>
  );
}
