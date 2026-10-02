import { AnimatePresence, MotionConfig, motion } from "motion/react";
import { useMemo, useState } from "react";

const COLORS = [
  "bg-sky-200 dark:bg-sky-900",
  "bg-amber-200 dark:bg-amber-900",
  "bg-emerald-200 dark:bg-emerald-900",
  "bg-rose-200 dark:bg-rose-900",
  "bg-violet-200 dark:bg-violet-900",
];

// Palabras muy frecuentes que un tokenizador real guarda enteras
const COMMON = new Set(
  "el la los las un una de del en y a que es se no por con para su al lo como más pero sus le ya o este si porque esta entre cuando muy sin sobre también me hasta hay donde quien desde todo nos durante todos uno les ni contra otros ese eso ante ellos e esto mí antes algunos qué unos yo otro otras otra él tanto esa estos mucho quienes nada muchos cual poco ella estar estas algunas algo nosotros campaña cliente clientes marca producto venta ventas empresa equipo proyecto nuevo nueva año años hoy".split(
    " ",
  ),
);

/**
 * Simulación didáctica de un tokenizador: palabras frecuentes = 1 token,
 * palabras largas o raras = varios trozos. Los tokenizadores reales (BPE)
 * aprenden estos trozos de los datos; el resultado es parecido, no idéntico.
 */
export function tokenize(text: string): string[] {
  const parts = text.match(/\s*[\p{L}\p{N}]+|\s*[^\s\p{L}\p{N}]|\s+$/gu) ?? [];
  const out: string[] = [];
  for (const part of parts) {
    const lead = part.match(/^\s*/)![0];
    const word = part.slice(lead.length);
    if (!/[\p{L}\p{N}]/u.test(word) || word.length <= 4 || COMMON.has(word.toLowerCase())) {
      out.push(part);
      continue;
    }
    // Trocea palabras largas en piezas de 3-5 letras
    const pieces: string[] = [];
    let rest = word;
    const first = Math.min(rest.length, rest.length > 8 ? 5 : 4);
    pieces.push(rest.slice(0, first));
    rest = rest.slice(first);
    while (rest.length > 0) {
      const n = rest.length <= 5 ? rest.length : 3 + (rest.charCodeAt(0) % 2);
      pieces.push(rest.slice(0, n));
      rest = rest.slice(n);
    }
    pieces[0] = lead + pieces[0];
    out.push(...pieces);
  }
  return out;
}

const EXAMPLES = [
  "Nuestra campaña de verano superó las expectativas de ventas.",
  "Supercalifragilisticoespialidoso",
  "Our summer campaign beat sales expectations.",
  "🎬🍿✨ ¡Estreno mañana!",
];

export default function Tokenizer() {
  const [text, setText] = useState(EXAMPLES[0]!);
  const tokens = useMemo(() => tokenize(text), [text]);
  const words = text.trim() ? text.trim().split(/\s+/).length : 0;

  return (
    <MotionConfig reducedMotion="user">
      <label className="block text-sm font-medium" htmlFor="tok-input">
        Escribe una frase
      </label>
      <textarea
        id="tok-input"
        value={text}
        onChange={(e) => setText(e.target.value)}
        rows={2}
        className="mt-1 w-full resize-y rounded-xl border border-line bg-bg-soft p-3 text-lg"
      />
      <div className="mt-2 flex flex-wrap gap-2">
        {EXAMPLES.map((ex) => (
          <button
            key={ex}
            onClick={() => setText(ex)}
            className="max-w-[16rem] truncate rounded-full border border-line px-3 py-1 text-xs hover:bg-bg-soft"
          >
            {ex}
          </button>
        ))}
      </div>

      <div
        className="mt-5 flex min-h-16 flex-wrap gap-y-2 rounded-xl border border-dashed border-line p-3 font-mono text-base"
        aria-label="Texto troceado en tokens"
      >
        <AnimatePresence initial={false}>
          {tokens.map((t, i) => (
            <motion.span
              key={`${i}-${t}`}
              layout
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              className={`rounded px-0.5 whitespace-pre ${COLORS[i % COLORS.length]}`}
            >
              {t.replace(/ /g, "·")}
            </motion.span>
          ))}
        </AnimatePresence>
      </div>

      <dl className="mt-4 grid grid-cols-3 gap-3 text-center">
        <Stat label="Palabras" value={words} />
        <Stat label="Tokens" value={tokens.length} accent />
        <Stat label="Tokens por palabra" value={words ? (tokens.length / words).toFixed(1) : "–"} />
      </dl>
      <p className="mt-3 text-xs text-muted">
        Simulación simplificada. «·» marca un espacio, que suele ir pegado a la palabra siguiente.
        Las palabras frecuentes ocupan un token; las largas, raras, los emojis y los idiomas con
        menos presencia en los datos ocupan más.
      </p>
    </MotionConfig>
  );
}

function Stat({
  label,
  value,
  accent,
}: {
  label: string;
  value: string | number;
  accent?: boolean;
}) {
  return (
    <div className={`rounded-xl p-3 ${accent ? "bg-[var(--accent-soft)]" : "bg-bg-soft"}`}>
      <dt className="text-xs text-muted">{label}</dt>
      <dd className="font-display text-2xl font-semibold tabular-nums">{value}</dd>
    </div>
  );
}
