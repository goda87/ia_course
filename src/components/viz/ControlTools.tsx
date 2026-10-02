import { AnimatePresence, MotionConfig, motion } from "motion/react";
import { useState, type ReactNode } from "react";
import Character from "./Character";

interface Tool {
  id: string;
  name: string;
  what: string;
  use: string;
  input: ReactNode;
  inputLabel: string;
  output: ReactNode;
  outputLabel: string;
}

const Stick = () => (
  <svg viewBox="0 0 100 120" className="h-full w-full" aria-hidden="true">
    <g stroke="currentColor" strokeWidth="4" strokeLinecap="round" fill="none">
      <circle cx="50" cy="38" r="16" />
      <path d="M50 54 V95 M50 64 L30 50 M50 64 L74 44 M50 95 L38 116 M50 95 L62 116" />
    </g>
    {[
      [50, 38],
      [50, 64],
      [30, 50],
      [74, 44],
      [50, 95],
      [38, 116],
      [62, 116],
    ].map(([x, y]) => (
      <circle key={`${x}-${y}`} cx={x} cy={y} r="4" fill="#ef4444" />
    ))}
  </svg>
);

const TOOLS: Tool[] = [
  {
    id: "lora",
    name: "LoRA",
    what: "Un pequeño «adaptador» entrenado con unas decenas o cientos de imágenes que enseña al modelo un estilo, un personaje o un producto concreto, sin reentrenarlo entero.",
    use: "En animación: que el modelo dibuje a tus personajes con el estilo de línea y color de tu estudio.",
    input: <Character color="#9ca3af" line="clean" />,
    inputLabel: "Modelo genérico",
    output: <Character color="#f97316" line="bold" flat />,
    outputLabel: "Con LoRA del estudio",
  },
  {
    id: "controlnet",
    name: "ControlNet",
    what: "Un módulo que obliga a la imagen a respetar una guía: un esqueleto de pose, un boceto, los contornos o la profundidad de otra imagen.",
    use: "En animación: generar el personaje exactamente en la pose del animador o del layout.",
    input: <Stick />,
    inputLabel: "Pose de referencia",
    output: <Character arm={130} armLeft={-55} />,
    outputLabel: "Personaje en esa pose",
  },
  {
    id: "img2img",
    name: "Imagen a imagen",
    what: "Se parte de una imagen existente (un boceto, una foto) en vez de ruido puro, y el modelo la «redibuja» siguiendo el prompt. Un control deslizante decide cuánto puede cambiar.",
    use: "En animación: convertir bocetos rápidos en fotogramas acabados manteniendo la composición.",
    input: <Character line="sketch" />,
    inputLabel: "Boceto",
    output: <Character />,
    outputLabel: "Acabado",
  },
  {
    id: "inpainting",
    name: "Inpainting",
    what: "Se marca una zona de la imagen y el modelo regenera solo esa parte, respetando el resto.",
    use: "En animación: corregir una mano, cambiar un accesorio o arreglar un fotograma sin rehacerlo entero.",
    input: (
      <div className="relative h-full w-full">
        <Character />
        <div className="absolute top-0 left-1/2 h-[28%] w-[50%] -translate-x-1/2 rounded-md border-2 border-dashed border-red-500 bg-red-500/20" />
      </div>
    ),
    inputLabel: "Zona marcada",
    output: <Character hat="#7c3aed" />,
    outputLabel: "«Con sombrero morado»",
  },
  {
    id: "video",
    name: "Imagen a vídeo",
    what: "Un modelo de vídeo toma una o varias imágenes (por ejemplo, primer y último fotograma) y genera el movimiento intermedio.",
    use: "En animación: generar intercalados (in-betweens) o animatics a partir de los fotogramas clave.",
    input: (
      <div className="flex h-full items-center gap-1">
        <Character arm={10} className="h-full" />
        <span className="text-muted">…</span>
        <Character arm={150} className="h-full" />
      </div>
    ),
    inputLabel: "Fotogramas clave",
    output: (
      <div className="flex h-full items-center">
        {[10, 45, 80, 115, 150].map((a) => (
          <Character key={a} arm={a} className="-mx-2 h-full" />
        ))}
      </div>
    ),
    outputLabel: "Intercalados generados",
  },
];

export default function ControlTools() {
  const [id, setId] = useState(TOOLS[0]!.id);
  const tool = TOOLS.find((t) => t.id === id)!;
  return (
    <MotionConfig reducedMotion="user">
      <div className="flex flex-wrap gap-2" role="tablist" aria-label="Herramientas de control">
        {TOOLS.map((t) => (
          <button
            key={t.id}
            role="tab"
            aria-selected={t.id === id}
            onClick={() => setId(t.id)}
            className={`rounded-full border px-3 py-1 text-sm ${t.id === id ? "border-[var(--accent)] bg-[var(--accent-soft)] font-medium" : "border-line hover:bg-bg-soft"}`}
          >
            {t.name}
          </button>
        ))}
      </div>
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={id}
          role="tabpanel"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="mt-5"
        >
          <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3 rounded-xl bg-bg-soft p-4">
            <figure className="text-center">
              <div className="mx-auto grid h-32 place-items-center text-fg">{tool.input}</div>
              <figcaption className="mt-1 text-xs text-muted">{tool.inputLabel}</figcaption>
            </figure>
            <motion.span
              initial={{ x: -6 }}
              animate={{ x: 6 }}
              transition={{ repeat: Infinity, repeatType: "reverse", duration: 0.8 }}
              className="text-2xl text-[var(--accent)]"
              aria-hidden="true"
            >
              →
            </motion.span>
            <figure className="text-center">
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.25 }}
                className="mx-auto grid h-32 place-items-center"
              >
                {tool.output}
              </motion.div>
              <figcaption className="mt-1 text-xs text-muted">{tool.outputLabel}</figcaption>
            </figure>
          </div>
          <p className="mt-4">{tool.what}</p>
          <p className="mt-2 text-sm">
            <strong className="text-[var(--accent)]">Uso típico. </strong>
            {tool.use}
          </p>
        </motion.div>
      </AnimatePresence>
    </MotionConfig>
  );
}
