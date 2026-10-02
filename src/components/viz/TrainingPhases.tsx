import { AnimatePresence, MotionConfig, motion } from "motion/react";
import { useState } from "react";

const PHASES = [
  {
    n: 1,
    title: "Preentrenamiento",
    analogy: "El estudiante que lee una biblioteca entera",
    text: "El modelo lee billones de palabras (webs, libros, código, artículos) y aprende a predecir la siguiente. Así aprende idiomas, datos del mundo y formas de razonar. Es la fase más cara: meses de miles de GPU y cientos de millones de dólares en los modelos punteros.",
    result:
      "Un modelo que sabe muchísimo pero no sabe conversar: si le preguntas algo, puede continuar con otra pregunta.",
    cost: "$$$$$",
  },
  {
    n: 2,
    title: "Ajuste con instrucciones",
    analogy: "El becario que aprende a atender peticiones",
    text: "Se le muestran decenas o cientos de miles de ejemplos de conversaciones bien resueltas: pregunta → buena respuesta. Aprende el formato de asistente: contestar, seguir instrucciones, usar herramientas.",
    result:
      "Un asistente útil, aunque todavía puede ser poco preciso, demasiado complaciente o inseguro.",
    cost: "$$",
  },
  {
    n: 3,
    title: "Refuerzo con feedback",
    analogy: "El empleado formado en la cultura de la empresa",
    text: "Personas (y cada vez más, otros modelos y pruebas automáticas) comparan respuestas y marcan cuál es mejor. El modelo se ajusta para preferir respuestas útiles, honestas y seguras. Aquí también se entrena el «razonamiento» con problemas verificables.",
    result: "El producto final: ChatGPT, Claude, Gemini… con su «personalidad» y sus límites.",
    cost: "$$$",
  },
];

export default function TrainingPhases() {
  const [i, setI] = useState(0);
  const p = PHASES[i]!;
  return (
    <MotionConfig reducedMotion="user">
      <ol className="mb-5 grid grid-cols-3 gap-2" aria-label="Fases del entrenamiento">
        {PHASES.map((ph, k) => (
          <li key={ph.n}>
            <button
              onClick={() => setI(k)}
              aria-current={i === k ? "step" : undefined}
              className={`w-full rounded-xl border p-3 text-left transition ${i === k ? "border-[var(--accent)] bg-[var(--accent-soft)]" : "border-line hover:bg-bg-soft"}`}
            >
              <span className="text-xs text-muted">Fase {ph.n}</span>
              <span className="block text-sm leading-tight font-semibold">{ph.title}</span>
            </button>
          </li>
        ))}
      </ol>

      <div className="grid items-center gap-6 md:grid-cols-[13rem_1fr]">
        <PhaseArt phase={i} />
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.25 }}
          >
            <p className="text-sm font-medium text-[var(--accent)]">{p.analogy}</p>
            <p className="mt-2">{p.text}</p>
            <p className="mt-3 rounded-lg bg-bg-soft p-3 text-sm">
              <strong>Resultado:</strong> {p.result}
            </p>
            <p className="mt-2 text-xs text-muted">
              Coste relativo: <span className="font-mono tracking-widest text-fg">{p.cost}</span>
            </p>
          </motion.div>
        </AnimatePresence>
      </div>
      <div className="mt-5 flex justify-end gap-2">
        <button
          onClick={() => setI((v) => Math.max(0, v - 1))}
          disabled={i === 0}
          className="rounded-full border border-line px-4 py-1.5 text-sm disabled:opacity-40"
        >
          ←
        </button>
        <button
          onClick={() => setI((v) => Math.min(PHASES.length - 1, v + 1))}
          disabled={i === PHASES.length - 1}
          className="rounded-full bg-fg px-4 py-1.5 text-sm text-bg disabled:opacity-40"
        >
          Siguiente fase →
        </button>
      </div>
    </MotionConfig>
  );
}

/** Pequeña ilustración animada de cada fase. */
function PhaseArt({ phase }: { phase: number }) {
  return (
    <div
      className="relative mx-auto grid aspect-square w-48 place-items-center overflow-hidden rounded-2xl bg-bg-soft"
      aria-hidden="true"
    >
      {/* «cerebro» del modelo */}
      <motion.div
        className="z-10 grid size-20 place-items-center rounded-2xl bg-fg font-display text-xl font-bold text-bg"
        animate={{ scale: [1, 1.06, 1] }}
        transition={{ repeat: Infinity, duration: 2 }}
      >
        LLM
      </motion.div>
      <AnimatePresence>
        {phase === 0 &&
          Array.from({ length: 10 }).map((_, k) => (
            <motion.span
              key={`doc${k}`}
              className="absolute h-4 w-3 rounded-sm bg-[var(--accent)]"
              initial={{ x: -110, y: (k % 5) * 30 - 60, opacity: 0 }}
              animate={{ x: 0, y: 0, opacity: [0, 1, 0] }}
              exit={{ opacity: 0 }}
              transition={{ repeat: Infinity, duration: 1.8, delay: k * 0.18, ease: "easeIn" }}
            />
          ))}
        {phase === 1 &&
          ["¿?", "→", "✓"].map((t, k) => (
            <motion.span
              key={`qa${k}`}
              className="absolute rounded-md bg-card px-2 py-0.5 text-sm font-semibold shadow"
              style={{ top: 12 + k * 18, left: 10 + k * 8 }}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: [0, 1, 1, 0], x: [-20, 0, 30, 60] }}
              exit={{ opacity: 0 }}
              transition={{ repeat: Infinity, duration: 2.4, delay: k * 0.5 }}
            >
              {t}
            </motion.span>
          ))}
        {phase === 2 && (
          <>
            <motion.span
              key="up"
              className="absolute top-4 right-5 text-3xl"
              initial={{ scale: 0 }}
              animate={{ scale: [0, 1.2, 1] }}
              exit={{ scale: 0 }}
              transition={{ repeat: Infinity, repeatDelay: 1.2, duration: 0.6 }}
            >
              👍
            </motion.span>
            <motion.span
              key="down"
              className="absolute bottom-4 left-5 text-3xl opacity-60"
              initial={{ scale: 0 }}
              animate={{ scale: [0, 1, 0.9] }}
              exit={{ scale: 0 }}
              transition={{ repeat: Infinity, repeatDelay: 1.2, duration: 0.6, delay: 0.6 }}
            >
              👎
            </motion.span>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
