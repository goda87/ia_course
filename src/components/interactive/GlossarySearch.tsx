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

  const letterOf = (g: GlossaryItem) => norm(g.term[0]!).toUpperCase();
  const letters = [...new Set(items.map(letterOf))];
  const groups = useMemo(() => {
    const m = new Map<string, GlossaryItem[]>();
    for (const g of list) m.set(letterOf(g), [...(m.get(letterOf(g)) ?? []), g]);
    return [...m.entries()];
  }, [list]);

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
      {groups.map(([letter, entries]) => (
        <section key={letter} aria-labelledby={q ? undefined : `letra-${letter}`}>
          {!q && (
            <h3
              id={`letra-${letter}`}
              className="mt-6 mb-2 scroll-mt-40 font-display text-2xl font-semibold text-[var(--accent)]"
            >
              {letter}
            </h3>
          )}
          <dl className="mt-3 space-y-3">
            {entries.map((g) => (
              <div
                key={g.id}
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
            ))}
          </dl>
        </section>
      ))}
      {list.length === 0 && (
        <p className="mt-6 text-muted">No hay resultados. Prueba con otra palabra.</p>
      )}
    </div>
  );
}
