import { MotionConfig, motion } from "motion/react";
import { useEffect, useMemo, useState } from "react";

export interface ChecklistSection {
  title: string;
  items: { id: string; text: string; hint?: string }[];
}

type Status = "pendiente" | "ok" | "duda" | "mal";

const STATUS: Record<Status, { label: string; icon: string; cls: string }> = {
  pendiente: { label: "Sin revisar", icon: "○", cls: "border-line text-muted" },
  ok: {
    label: "Bien resuelto",
    icon: "✓",
    cls: "border-emerald-500 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
  },
  duda: {
    label: "Con dudas",
    icon: "?",
    cls: "border-amber-500 bg-amber-500/10 text-amber-700 dark:text-amber-300",
  },
  mal: {
    label: "Señal de alarma",
    icon: "!",
    cls: "border-red-500 bg-red-500/10 text-red-700 dark:text-red-300",
  },
};
const ORDER: Status[] = ["pendiente", "ok", "duda", "mal"];
const KEY = "ia-curso:checklist";

interface Saved {
  project: string;
  status: Record<string, Status>;
  notes: Record<string, string>;
}

function load(): Saved | null {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as Saved) : null;
  } catch {
    return null;
  }
}

/** Lista de comprobación para valorar un proyecto de IA. Se guarda solo en este navegador y se puede imprimir. */
export default function Checklist({ sections }: { sections: ChecklistSection[] }) {
  const [project, setProject] = useState("");
  const [status, setStatus] = useState<Record<string, Status>>({});
  const [notes, setNotes] = useState<Record<string, string>>({});
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const s = load();
    if (s) {
      setProject(s.project);
      setStatus(s.status);
      setNotes(s.notes);
    }
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (!loaded) return;
    try {
      localStorage.setItem(KEY, JSON.stringify({ project, status, notes }));
    } catch {
      /* sin almacenamiento: la lista funciona pero no se recuerda */
    }
  }, [project, status, notes, loaded]);

  const all = sections.flatMap((s) => s.items);
  const counts = useMemo(() => {
    const c: Record<Status, number> = { pendiente: 0, ok: 0, duda: 0, mal: 0 };
    for (const it of all) c[status[it.id] ?? "pendiente"]++;
    return c;
  }, [status, all]);
  const reviewed = all.length - counts.pendiente;

  const cycle = (id: string) =>
    setStatus((s) => {
      const cur = s[id] ?? "pendiente";
      return { ...s, [id]: ORDER[(ORDER.indexOf(cur) + 1) % ORDER.length]! };
    });

  const reset = () => {
    if (!window.confirm("¿Borrar todas las respuestas y notas de esta lista?")) return;
    setProject("");
    setStatus({});
    setNotes({});
  };

  const verdict =
    counts.mal >= 3
      ? "Varias señales de alarma: pide aclaraciones por escrito antes de avanzar."
      : counts.mal > 0
        ? "Hay alguna señal de alarma: conviene resolverla antes de decidir."
        : counts.duda > 2
          ? "Sin alarmas, pero con dudas abiertas: pide más detalle."
          : reviewed === all.length
            ? "Todo revisado y sin alarmas: buena base para decidir."
            : "Sigue revisando los puntos pendientes.";

  return (
    <MotionConfig reducedMotion="user">
      <div className="space-y-5">
        <div className="flex flex-wrap items-end gap-3">
          <label className="min-w-56 flex-1 text-sm font-medium">
            Proyecto que estás valorando
            <input
              value={project}
              onChange={(e) => setProject(e.target.value)}
              placeholder="p. ej. Generador de fondos para la serie X"
              className="mt-1 w-full rounded-lg border border-line bg-card p-2 font-normal"
            />
          </label>
          <div className="no-print flex gap-2">
            <button
              onClick={() => window.print()}
              className="rounded-full bg-fg px-4 py-2 text-sm font-medium text-bg"
            >
              Imprimir o guardar PDF
            </button>
            <button onClick={reset} className="rounded-full border border-line px-4 py-2 text-sm">
              Reiniciar
            </button>
          </div>
        </div>

        <div
          className="sticky top-16 z-10 rounded-xl border border-line bg-card/95 p-3 backdrop-blur"
          aria-live="polite"
        >
          <div className="flex h-2.5 overflow-hidden rounded-full bg-bg-soft">
            {(["ok", "duda", "mal"] as Status[]).map((s) => (
              <motion.div
                key={s}
                className={
                  s === "ok" ? "bg-emerald-500" : s === "duda" ? "bg-amber-500" : "bg-red-500"
                }
                initial={false}
                animate={{ width: `${(counts[s] / all.length) * 100}%` }}
              />
            ))}
          </div>
          <p className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs">
            <span>
              {reviewed}/{all.length} revisados
            </span>
            <span className="text-emerald-700 dark:text-emerald-300">✓ {counts.ok}</span>
            <span className="text-amber-700 dark:text-amber-300">? {counts.duda}</span>
            <span className="text-red-700 dark:text-red-300">! {counts.mal}</span>
            <span className="font-medium">{verdict}</span>
          </p>
        </div>

        <p className="no-print text-xs text-muted">
          Pulsa el círculo de cada punto para cambiar su estado: sin revisar → bien resuelto → con
          dudas → señal de alarma. Se guarda solo en este navegador.
        </p>

        {sections.map((sec, si) => (
          <section key={sec.title} className="break-inside-avoid">
            <h3 className="font-display text-lg font-semibold">
              {si + 1}. {sec.title}
            </h3>
            <ul className="mt-2 space-y-2">
              {sec.items.map((it) => {
                const st = status[it.id] ?? "pendiente";
                return (
                  <li key={it.id} className="rounded-xl border border-line bg-card p-3">
                    <div className="flex items-start gap-3">
                      <button
                        onClick={() => cycle(it.id)}
                        aria-label={`${it.text}. Estado: ${STATUS[st].label}. Pulsa para cambiar.`}
                        className={`grid size-8 shrink-0 place-items-center rounded-full border-2 font-bold ${STATUS[st].cls}`}
                      >
                        {STATUS[st].icon}
                      </button>
                      <div className="min-w-0 flex-1">
                        <p className="font-medium">{it.text}</p>
                        {it.hint && <p className="mt-0.5 text-sm text-muted">{it.hint}</p>}
                        <input
                          value={notes[it.id] ?? ""}
                          onChange={(e) => setNotes((n) => ({ ...n, [it.id]: e.target.value }))}
                          placeholder="Notas…"
                          aria-label={`Notas sobre: ${it.text}`}
                          className="mt-2 w-full rounded-md border border-transparent bg-bg-soft px-2 py-1 text-sm focus:border-line"
                        />
                      </div>
                      <span className="hidden text-xs text-muted sm:block">{STATUS[st].label}</span>
                    </div>
                  </li>
                );
              })}
            </ul>
          </section>
        ))}
      </div>
    </MotionConfig>
  );
}
