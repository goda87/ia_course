import { AnimatePresence, MotionConfig, motion } from "motion/react";
import { useState } from "react";

const LEVELS = [
  {
    name: "Chatbot",
    who: "Tú haces todo; la IA responde.",
    example: "Preguntar a ChatGPT cómo estructurar una presentación.",
    risk: "Bajo: tú decides qué usar de la respuesta.",
  },
  {
    name: "Asistente con documentos",
    who: "La IA consulta tus documentos (RAG) y responde basándose en ellos.",
    example: "Un buscador interno que responde preguntas sobre los manuales de la empresa.",
    risk: "Medio: puede citar mal o mezclar documentos. Hay que poder ver las fuentes.",
  },
  {
    name: "Copiloto",
    who: "La IA propone dentro de tu herramienta y tú aceptas cada cambio.",
    example: "Sugerencias de texto en un procesador o de código en un editor.",
    risk: "Medio: el riesgo es aceptar sin revisar por comodidad.",
  },
  {
    name: "Agente",
    who: "Le das un objetivo; la IA planifica, usa herramientas y te consulta en puntos clave.",
    example: "Preparar un informe de competencia buscando en la web y rellenando una plantilla.",
    risk: "Alto: puede encadenar errores, gastar mucho o actuar sobre datos incorrectos.",
  },
  {
    name: "Sistema multiagente",
    who: "Un agente coordinador reparte el trabajo entre agentes especializados.",
    example: "Un agente de producción que delega guion, desglose y presupuesto en subagentes.",
    risk: "Muy alto si no hay supervisión: más piezas, más puntos de fallo y más coste.",
  },
];

export default function AutonomyScale() {
  const [i, setI] = useState(3);
  const l = LEVELS[i]!;
  return (
    <MotionConfig reducedMotion="user">
      <div className="relative">
        <div className="mb-1 flex justify-between text-xs text-muted">
          <span>Menos autonomía</span>
          <span>Más autonomía</span>
        </div>
        <div className="h-2 rounded-full bg-gradient-to-r from-sky-300 via-amber-300 to-rose-400 dark:from-sky-800 dark:via-amber-700 dark:to-rose-700" />
        <ol className="mt-3 grid grid-cols-5 gap-1">
          {LEVELS.map((x, k) => (
            <li key={x.name}>
              <button
                onClick={() => setI(k)}
                aria-pressed={k === i}
                className={`w-full rounded-lg border px-1 py-2 text-[11px] leading-tight font-semibold sm:text-xs ${k === i ? "border-[var(--accent)] bg-[var(--accent-soft)]" : "border-line hover:bg-bg-soft"}`}
              >
                {x.name}
              </button>
            </li>
          ))}
        </ol>
      </div>
      <AnimatePresence mode="wait" initial={false}>
        <motion.dl
          key={i}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="mt-4 grid gap-3 sm:grid-cols-3"
        >
          <div className="rounded-xl bg-bg-soft p-3">
            <dt className="text-xs font-semibold tracking-wider text-muted uppercase">
              Quién hace qué
            </dt>
            <dd className="mt-1 text-sm">{l.who}</dd>
          </div>
          <div className="rounded-xl bg-bg-soft p-3">
            <dt className="text-xs font-semibold tracking-wider text-muted uppercase">Ejemplo</dt>
            <dd className="mt-1 text-sm">{l.example}</dd>
          </div>
          <div className="rounded-xl bg-bg-soft p-3">
            <dt className="text-xs font-semibold tracking-wider text-muted uppercase">Riesgo</dt>
            <dd className="mt-1 text-sm">{l.risk}</dd>
          </div>
        </motion.dl>
      </AnimatePresence>
    </MotionConfig>
  );
}
