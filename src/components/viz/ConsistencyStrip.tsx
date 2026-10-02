import { MotionConfig, motion } from "motion/react";
import { useReducedMotionSafe } from "@/lib/motion";
import { useEffect, useState } from "react";
import Character, { type CharacterProps } from "./Character";

const ARMS = [10, 40, 70, 100, 130, 150];

// Sin control, cada fotograma se genera «a su aire»: el personaje cambia de color, orejas o accesorios
const DRIFT: CharacterProps[] = [
  { color: "#f97316" },
  { color: "#fb923c", ears: "round" },
  { color: "#ea580c", hat: "#16a34a" },
  { color: "#f59e0b" },
  { color: "#dc2626", eyes: "happy" },
  { color: "#f97316", ears: "round", hat: "#2563eb" },
];

export default function ConsistencyStrip() {
  const reduce = useReducedMotionSafe();
  const [controlled, setControlled] = useState(false);
  const [frame, setFrame] = useState(0);

  useEffect(() => {
    if (reduce) return;
    const id = setInterval(() => setFrame((f) => (f + 1) % ARMS.length), 260);
    return () => clearInterval(id);
  }, [reduce]);

  const props = (k: number): CharacterProps => ({
    arm: ARMS[k],
    ...(controlled ? { color: "#f97316" } : DRIFT[k]),
  });

  return (
    <MotionConfig reducedMotion="user">
      <div
        className="flex rounded-full border border-line p-1 text-sm"
        role="group"
        aria-label="Con o sin control de consistencia"
      >
        {[false, true].map((c) => (
          <button
            key={String(c)}
            onClick={() => setControlled(c)}
            aria-pressed={controlled === c}
            className={`flex-1 rounded-full px-3 py-1.5 font-medium ${controlled === c ? "bg-fg text-bg" : "text-muted"}`}
          >
            {c ? "Con LoRA + referencia + ControlNet" : "Cada fotograma por separado"}
          </button>
        ))}
      </div>

      <div className="mt-5 grid gap-4 sm:grid-cols-[1fr_9rem] sm:items-center">
        <ol
          className="grid grid-cols-6 gap-1 rounded-xl bg-neutral-900 p-2"
          aria-label="Tira de fotogramas"
        >
          {ARMS.map((_, k) => (
            <li
              key={k}
              className={`rounded-md bg-amber-50 p-1 ring-2 transition ${!reduce && frame === k ? "ring-[var(--accent)]" : "ring-transparent"}`}
            >
              <Character {...props(k)} className="w-full" />
              <span className="block text-center text-[10px] text-neutral-500">{k + 1}</span>
            </li>
          ))}
        </ol>
        <div className="text-center">
          <div className="mx-auto w-28 rounded-xl bg-amber-50 p-2">
            <motion.div key={`${controlled}-${frame}`} initial={false}>
              <Character {...props(reduce ? 0 : frame)} className="w-full" />
            </motion.div>
          </div>
          <p className="mt-1 text-xs text-muted">Reproducción</p>
        </div>
      </div>
      <p className="mt-4 text-sm">
        {controlled
          ? "Con un LoRA del personaje, imágenes de referencia y control de pose, el personaje se mantiene idéntico y solo cambia lo que debe cambiar: el brazo."
          : "Si cada fotograma se genera de forma independiente, el personaje «parpadea»: cambia de tono, de orejas, aparecen y desaparecen accesorios. Es el gran problema de la IA en animación."}
      </p>
    </MotionConfig>
  );
}
