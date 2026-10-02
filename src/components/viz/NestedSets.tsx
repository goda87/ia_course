import { AnimatePresence, MotionConfig, motion } from "motion/react";
import { useState } from "react";

const LEVELS = [
  {
    id: "ia",
    name: "Inteligencia artificial",
    since: "desde 1956",
    text: "Todo sistema que hace tareas que asociamos a la inteligencia. Incluye desde reglas escritas a mano hasta ChatGPT.",
    examples: ["Filtro antispam de reglas", "Programa de ajedrez", "Sistemas expertos"],
  },
  {
    id: "ml",
    name: "Machine learning",
    since: "auge en los 90–2000",
    text: "IA que aprende de ejemplos en lugar de seguir reglas programadas. Es la IA «predictiva» que muchas empresas ya usaban antes de ChatGPT.",
    examples: [
      "Predicción de abandono de clientes",
      "Recomendaciones de Netflix",
      "Scoring de crédito",
    ],
  },
  {
    id: "dl",
    name: "Deep learning",
    since: "desde 2012",
    text: "Machine learning con redes neuronales de muchas capas, entrenadas con GPU y montañas de datos. Reconoce imágenes, voz y lenguaje.",
    examples: ["Reconocimiento facial", "Traductor de Google", "Dictado por voz"],
  },
  {
    id: "gen",
    name: "IA generativa",
    since: "explosión en 2022",
    text: "Deep learning que crea contenido nuevo: texto, imágenes, vídeo, audio, código. Aquí viven los LLM y los modelos de difusión.",
    examples: ["ChatGPT, Claude, Gemini", "Midjourney, FLUX", "Veo, Sora, Kling"],
  },
] as const;

export default function NestedSets() {
  const [active, setActive] = useState(3);
  const level = LEVELS[active]!;

  return (
    <MotionConfig reducedMotion="user">
      <div className="grid items-center gap-6 md:grid-cols-[1.1fr_1fr]">
        <div className="relative aspect-square w-full max-w-md justify-self-center">
          {LEVELS.map((l, i) => {
            const inset = i * 10.5;
            const isActive = i === active;
            return (
              <motion.button
                key={l.id}
                onClick={() => setActive(i)}
                aria-pressed={isActive}
                className={`absolute flex items-start justify-center rounded-[2rem] border-2 pt-3 text-xs font-semibold transition-colors duration-300 sm:text-sm ${
                  isActive
                    ? "border-[var(--accent)] bg-[var(--accent-soft)]"
                    : "border-line bg-card"
                }`}
                style={{ inset: `${inset}%` }}
                initial={false}
                animate={{ scale: isActive ? 1.015 : 1 }}
                whileHover={{ scale: 1.01 }}
                transition={{ duration: 0.3 }}
              >
                <span className={isActive ? "text-[var(--accent)]" : "text-muted"}>{l.name}</span>
              </motion.button>
            );
          })}
        </div>

        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={level.id}
            initial={{ opacity: 0, x: 16 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -16 }}
            transition={{ duration: 0.25 }}
            aria-live="polite"
          >
            <p className="text-sm text-muted">{level.since}</p>
            <h3 className="font-display text-2xl font-semibold">{level.name}</h3>
            <p className="mt-2">{level.text}</p>
            <p className="mt-4 text-xs font-semibold tracking-wider text-muted uppercase">
              Ejemplos
            </p>
            <ul className="mt-1 flex flex-wrap gap-2">
              {level.examples.map((e) => (
                <li
                  key={e}
                  className="rounded-full border border-line bg-bg-soft px-3 py-1 text-sm"
                >
                  {e}
                </li>
              ))}
            </ul>
            <div className="mt-5 flex gap-2">
              {LEVELS.map((l, i) => (
                <button
                  key={l.id}
                  onClick={() => setActive(i)}
                  aria-label={`Ver ${l.name}`}
                  className={`h-1.5 flex-1 rounded-full ${i <= active ? "bg-[var(--accent)]" : "bg-line"}`}
                />
              ))}
            </div>
            <p className="mt-2 text-xs text-muted">
              Pulsa los recuadros para entrar o salir de cada nivel.
            </p>
          </motion.div>
        </AnimatePresence>
      </div>
    </MotionConfig>
  );
}
