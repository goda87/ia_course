import { useMemo, useState } from "react";
import type { GlossaryItem } from "@/data/schemas";

interface Props {
  items: GlossaryItem[];
  /** Título de cada módulo por slug, para enlazar «Se explica en…» */
  modules: Record<string, string>;
  base: string;
}

const norm = (s: string) =>
  s
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "");

/** Glosario con buscador. Se renderiza completo en el servidor para que los enlaces #término funcionen sin JS. */
export default function GlossarySearch({ items, modules, base }: Props) {
  const [q, setQ] = useState("");
  const list = useMemo(() => {
    const n = norm(q.trim());
    if (!n) return items;
    return items.filter((g) =>
      norm([g.term, ...g.aliases, g.short, g.long ?? ""].join(" ")).includes(n),
    );
  }, [q, items]);

  const letters = [...new Set(items.map((g) => norm(g.term[0]!).toUpperCase()))];

  return (
    <div>
      <div className="sticky top-16 z-10 -mx-1 bg-bg/95 px-1 py-2 backdrop-blur">
        <input
          type="search"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Busca un término: token, agente, LoRA…"
          aria-label="Buscar en el glosario"
          className="w-full rounded-xl border border-line bg-card px-4 py-3 text-lg"
        />
        {!q && (
          <nav className="mt-2 flex flex-wrap gap-1 text-sm" aria-label="Índice alfabético">
            {letters.map((l) => (
              <a key={l} href={`#letra-${l}`} className="rounded px-1.5 py-0.5 hover:bg-bg-soft">
                {l}
              </a>
            ))}
          </nav>
        )}
        <p className="mt-1 text-xs text-muted" aria-live="polite">
          {list.length} términos
        </p>
      </div>
      <dl className="mt-4 space-y-3">
        {list.map((g, i) => {
          const letter = norm(g.term[0]!).toUpperCase();
          const first = !q && (i === 0 || norm(list[i - 1]!.term[0]!).toUpperCase() !== letter);
          return (
            <div key={g.id}>
              {first && (
                <p
                  id={`letra-${letter}`}
                  className="mt-6 mb-2 scroll-mt-40 font-display text-2xl font-semibold text-[var(--accent)]"
                >
                  {letter}
                </p>
              )}
              <div
                id={g.id}
                className="scroll-mt-40 rounded-xl border border-line bg-card p-4 target:border-[var(--accent)] target:bg-[var(--accent-soft)]"
              >
                <dt className="font-semibold">
                  {g.term}
                  {g.aliases.length > 0 && (
                    <span className="ml-2 text-sm font-normal text-muted">
                      ({g.aliases.join(", ")})
                    </span>
                  )}
                </dt>
                <dd className="mt-1">{g.short}</dd>
                {g.long && <dd className="mt-1 text-sm">{g.long}</dd>}
                {g.analogy && (
                  <dd className="mt-2 text-sm">
                    <span className="font-medium text-[var(--accent)]">Analogía: </span>
                    {g.analogy}
                  </dd>
                )}
                {g.module && modules[g.module] && (
                  <dd className="mt-2 text-xs">
                    <a href={`${base}/modulos/${g.module}/`} className="text-muted underline">
                      Se explica en: {modules[g.module]}
                    </a>
                  </dd>
                )}
              </div>
            </div>
          );
        })}
      </dl>
      {list.length === 0 && (
        <p className="mt-6 text-muted">No hay resultados. Prueba con otra palabra.</p>
      )}
    </div>
  );
}
