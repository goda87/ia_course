import { useEffect, useMemo, useRef, useState } from "react";
import { useReducedMotion } from "motion/react";

const SIZE = 192;
const STEPS = 30;

const PROMPTS = [
  {
    id: "zorro",
    label: "un zorro naranja saludando, dibujo animado, fondo de montañas",
    face: "#f97316",
    sky: ["#bae6fd", "#fef3c7"],
    hill: "#4ade80",
    ears: "pointy" as const,
  },
  {
    id: "oso",
    label: "un oso azul saludando, dibujo animado, atardecer",
    face: "#3b82f6",
    sky: ["#fda4af", "#fde68a"],
    hill: "#a16207",
    ears: "round" as const,
  },
];

/** Dibuja la imagen «limpia» que el modelo acabaría generando para un prompt. */
function drawScene(ctx: CanvasRenderingContext2D, p: (typeof PROMPTS)[number], seed: number) {
  // La semilla cambia la composición, como en un modelo real: mismo prompt, otra imagen
  const v = seed % 3;
  const g = ctx.createLinearGradient(0, 0, 0, SIZE);
  g.addColorStop(0, p.sky[0]!);
  g.addColorStop(1, p.sky[1]!);
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, SIZE, SIZE);
  ctx.fillStyle = "#fde047";
  ctx.beginPath();
  ctx.arc(40 + v * 55, 34 + v * 6, 18, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = p.hill;
  ctx.beginPath();
  ctx.moveTo(0, 150);
  ctx.quadraticCurveTo(50 + v * 30, 105, 100, 140);
  ctx.quadraticCurveTo(150, 170, 192, 125);
  ctx.lineTo(192, 192);
  ctx.lineTo(0, 192);
  ctx.fill();
  // personaje
  const cx = 76 + v * 16,
    cy = 100;
  ctx.lineWidth = 3;
  ctx.strokeStyle = "#1c1b19";
  ctx.fillStyle = p.face;
  // cuerpo
  ctx.beginPath();
  ctx.ellipse(cx, cy + 48, 24, 30, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
  // brazo saludando
  ctx.save();
  ctx.translate(cx + 20, cy + 32);
  ctx.rotate(-2.3);
  ctx.beginPath();
  ctx.roundRect(-6, 0, 12, 34, 6);
  ctx.fill();
  ctx.stroke();
  ctx.restore();
  // orejas
  ctx.beginPath();
  if (p.ears === "pointy") {
    ctx.moveTo(cx - 26, cy - 14);
    ctx.lineTo(cx - 30, cy - 46);
    ctx.lineTo(cx - 6, cy - 26);
    ctx.closePath();
    ctx.moveTo(cx + 26, cy - 14);
    ctx.lineTo(cx + 30, cy - 46);
    ctx.lineTo(cx + 6, cy - 26);
    ctx.closePath();
  } else {
    ctx.arc(cx - 24, cy - 26, 12, 0, Math.PI * 2);
    ctx.moveTo(cx + 36, cy - 26);
    ctx.arc(cx + 24, cy - 26, 12, 0, Math.PI * 2);
  }
  ctx.fill();
  ctx.stroke();
  // cabeza
  ctx.beginPath();
  ctx.arc(cx, cy, 32, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = "#fff7ed";
  ctx.beginPath();
  ctx.ellipse(cx, cy + 13, 16, 12, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#1c1b19";
  for (const dx of [-12, 12]) {
    ctx.beginPath();
    ctx.arc(cx + dx, cy - 3, 4, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.beginPath();
  ctx.arc(cx, cy + 8, 3.5, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.lineWidth = 2;
  ctx.arc(cx, cy + 12, 7, 0.2, Math.PI - 0.2);
  ctx.stroke();
}

/** Ruido gaussiano determinista (misma semilla = mismo ruido). */
function makeNoise(seed: number) {
  let s = seed;
  const rnd = () => (s = (s * 1664525 + 1013904223) % 4294967296) / 4294967296;
  const n = new Float32Array(SIZE * SIZE * 3);
  for (let i = 0; i < n.length; i++) {
    const u = Math.max(rnd(), 1e-9);
    const v = rnd();
    n[i] = Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
  }
  return n;
}

export default function DiffusionCanvas() {
  const reduce = useReducedMotion();
  const canvas = useRef<HTMLCanvasElement>(null);
  const [mode, setMode] = useState<"generar" | "entrenar">("generar");
  const [promptId, setPromptId] = useState(PROMPTS[0]!.id);
  const [seed, setSeed] = useState(42);
  const [step, setStep] = useState(0);
  const [playing, setPlaying] = useState(false);
  const prompt = PROMPTS.find((p) => p.id === promptId)!;
  const noise = useMemo(() => makeNoise(seed), [seed]);

  // Imágenes limpias con distintos niveles de desenfoque: se ve primero la forma general y luego el detalle
  const blurred = useRef<Map<string, ImageData>>(new Map());

  const clean = (blur: number) => {
    const key = `${promptId}-${seed}-${blur}`;
    const cached = blurred.current.get(key);
    if (cached) return cached;
    const base = document.createElement("canvas");
    base.width = base.height = SIZE;
    drawScene(base.getContext("2d")!, prompt, seed);
    const out = document.createElement("canvas");
    out.width = out.height = SIZE;
    const octx = out.getContext("2d")!;
    octx.filter = blur ? `blur(${blur}px)` : "none";
    octx.drawImage(base, 0, 0);
    const data = octx.getImageData(0, 0, SIZE, SIZE);
    blurred.current.set(key, data);
    return data;
  };

  // t: 0 = puro ruido, 1 = imagen limpia
  const t = mode === "generar" ? step / STEPS : 1 - step / STEPS;

  useEffect(() => {
    const ctx = canvas.current?.getContext("2d");
    if (!ctx) return;
    const blur = Math.round((1 - t) * 10);
    const img = clean(blur);
    const out = ctx.createImageData(SIZE, SIZE);
    const signal = Math.pow(t, 0.9);
    const noiseAmt = (1 - signal) * 85;
    for (let i = 0, j = 0; i < out.data.length; i += 4, j += 3) {
      out.data[i] = img.data[i]! * signal + 128 * (1 - signal) + noise[j]! * noiseAmt;
      out.data[i + 1] = img.data[i + 1]! * signal + 128 * (1 - signal) + noise[j + 1]! * noiseAmt;
      out.data[i + 2] = img.data[i + 2]! * signal + 128 * (1 - signal) + noise[j + 2]! * noiseAmt;
      out.data[i + 3] = 255;
    }
    ctx.putImageData(out, 0, 0);
  }, [t, noise, promptId]);

  useEffect(() => {
    if (!playing) return;
    if (step >= STEPS) {
      setPlaying(false);
      return;
    }
    const id = setTimeout(() => setStep((s) => s + 1), 90);
    return () => clearTimeout(id);
  }, [playing, step]);

  const play = () => {
    if (reduce) {
      setStep(STEPS);
      return;
    }
    setStep(0);
    setPlaying(true);
  };

  return (
    <div className="grid gap-6 md:grid-cols-[auto_1fr]">
      <div className="mx-auto">
        <canvas
          ref={canvas}
          width={SIZE}
          height={SIZE}
          className="size-64 rounded-xl border border-line [image-rendering:pixelated] sm:size-72"
          role="img"
          aria-label={`Imagen en el paso ${step} de ${STEPS}: ${mode === "generar" ? "del ruido a la imagen" : "de la imagen al ruido"}`}
        />
        <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-line">
          <div
            className="h-full bg-[var(--accent)] transition-[width]"
            style={{ width: `${(step / STEPS) * 100}%` }}
          />
        </div>
        <p className="mt-1 text-center text-xs text-muted tabular-nums">
          Paso {step} de {STEPS}
        </p>
      </div>

      <div className="space-y-4 text-sm">
        <div className="flex rounded-full border border-line p-1" role="group" aria-label="Modo">
          {(["generar", "entrenar"] as const).map((m) => (
            <button
              key={m}
              onClick={() => {
                setMode(m);
                setStep(0);
                setPlaying(false);
              }}
              aria-pressed={mode === m}
              className={`flex-1 rounded-full px-3 py-1.5 font-medium ${mode === m ? "bg-fg text-bg" : "text-muted"}`}
            >
              {m === "generar" ? "Generar: quitar ruido" : "Entrenar: añadir ruido"}
            </button>
          ))}
        </div>
        <p>
          {mode === "generar"
            ? "El modelo parte de ruido aleatorio y, en cada paso, predice qué ruido sobra y lo quita, guiado por el texto. Primero aparecen las formas y colores generales; al final, los detalles."
            : "Para aprender, se toman millones de imágenes con su descripción y se les añade ruido poco a poco. El modelo practica la tarea inversa: adivinar qué ruido se ha añadido."}
        </p>

        {mode === "generar" && (
          <div>
            <p className="text-xs font-semibold tracking-wider text-muted uppercase">Prompt</p>
            <div className="mt-1 flex flex-col gap-1.5">
              {PROMPTS.map((p) => (
                <button
                  key={p.id}
                  onClick={() => {
                    setPromptId(p.id);
                    setStep(0);
                    setPlaying(false);
                  }}
                  aria-pressed={promptId === p.id}
                  className={`rounded-lg border px-3 py-2 text-left ${promptId === p.id ? "border-[var(--accent)] bg-[var(--accent-soft)]" : "border-line hover:bg-bg-soft"}`}
                >
                  «{p.label}»
                </button>
              ))}
            </div>
          </div>
        )}

        <div>
          <label
            htmlFor="diff-step"
            className="text-xs font-semibold tracking-wider text-muted uppercase"
          >
            Mueve los pasos
          </label>
          <input
            id="diff-step"
            type="range"
            min={0}
            max={STEPS}
            value={step}
            onChange={(e) => {
              setPlaying(false);
              setStep(Number(e.target.value));
            }}
            className="w-full accent-[var(--accent)]"
          />
        </div>
        <div className="flex flex-wrap gap-2">
          <button onClick={play} className="rounded-full bg-fg px-4 py-2 font-medium text-bg">
            ▶ Reproducir
          </button>
          <button
            onClick={() => {
              setSeed((s) => s + 1);
              setStep(0);
              setPlaying(false);
            }}
            className="rounded-full border border-line px-4 py-2"
          >
            Cambiar semilla ({seed})
          </button>
        </div>
      </div>
    </div>
  );
}
