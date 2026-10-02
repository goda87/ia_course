import { AnimatePresence, MotionConfig, motion } from "motion/react";
import { useEffect, useMemo, useRef, useState } from "react";
import type { TimelineItem } from "@/data/schemas";

const ERAS: { id: TimelineItem["era"]; label: string; range: string }[] = [
  { id: "origenes", label: "Orígenes", range: "1950–1973" },
  { id: "inviernos", label: "Inviernos y reglas", range: "1974–2008" },
  { id: "deep-learning", label: "Deep learning", range: "2009–2016" },
  { id: "transformer", label: "Transformer", range: "2017–2021" },
  { id: "generativa", label: "Explosión generativa", range: "2022–2024" },
  { id: "agentes", label: "Razonamiento y agentes", range: "2024–hoy" },
];

const MONTHS = ["ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "sep", "oct", "nov", "dic"];

/** Desde aquí empieza lo que la usuaria no vivió de cerca */
const MISSED_FROM = 2022;

interface Props {
  items: TimelineItem[];
}

export default function Timeline({ items }: Props) {
  const [era, setEra] = useState<TimelineItem["era"] | "todo">("todo");
  const [onlyKey, setOnlyKey] = useState(false);
  const visible = useMemo(
    () => items.filter((i) => (era === "todo" || i.era === era) && (!onlyKey || i.key)),
    [items, era, onlyKey],
  );
  const [selectedId, setSelectedId] = useState<string>(
    items.find((i) => i.id === "chatgpt-2022")?.id ?? items[0]!.id,
  );
  const selected = visible.find((i) => i.id === selectedId) ?? visible[0];
  const idx = selected ? visible.indexOf(selected) : -1;

  const activeRef = useRef<HTMLButtonElement>(null);
  const scrollerRef = useRef<HTMLDivElement>(null);
  const firstScroll = useRef(true);
  // Centra el hito activo desplazando solo la línea horizontal, nunca la página
  useEffect(() => {
    const btn = activeRef.current;
    const scroller = scrollerRef.current;
    if (!btn || !scroller) return;
    const li = btn.parentElement!;
    scroller.scrollTo({
      left: li.offsetLeft - scroller.clientWidth / 2 + li.clientWidth / 2,
      behavior: firstScroll.current ? "auto" : "smooth",
    });
    firstScroll.current = false;
  }, [selected?.id]);

  const go = (d: number) => {
    const next = visible[idx + d];
    if (next) setSelectedId(next.id);
  };

  return (
    <MotionConfig reducedMotion="user">
      <div className="space-y-5">
        {/* Filtros */}
        <div
          className="flex flex-wrap items-center gap-2"
          role="group"
          aria-label="Filtrar por etapa"
        >
          <FilterButton active={era === "todo"} onClick={() => setEra("todo")}>
            Todo
          </FilterButton>
          {ERAS.map((e) => (
            <FilterButton key={e.id} active={era === e.id} onClick={() => setEra(e.id)}>
              {e.label} <span className="opacity-60">{e.range}</span>
            </FilterButton>
          ))}
          <label className="ml-auto flex cursor-pointer items-center gap-2 text-sm text-muted">
            <input
              type="checkbox"
              checked={onlyKey}
              onChange={(e) => setOnlyKey(e.target.checked)}
              className="size-4 accent-[var(--accent)]"
            />
            Solo hitos clave
          </label>
        </div>

        {/* Línea con puntos */}
        <div className="relative">
          <div
            ref={scrollerRef}
            className="overflow-x-auto pb-3"
            role="listbox"
            aria-label="Hitos de la historia de la IA"
          >
            <div className="relative min-w-max">
              <div
                className="absolute right-0 bottom-[19px] left-0 h-0.5 bg-line"
                aria-hidden="true"
              />
              <ol className="relative flex items-end gap-1 px-2 pt-8">
                {visible.map((item, i) => {
                  const active = item.id === selected?.id;
                  const missed = item.year >= MISSED_FROM;
                  const showYear = i === 0 || visible[i - 1]!.year !== item.year;
                  return (
                    <li key={item.id} className="relative flex w-14 flex-col items-center">
                      <span
                        className={`mb-2 h-4 text-xs tabular-nums ${showYear ? "" : "invisible"} ${
                          active ? "font-semibold text-fg" : "text-muted"
                        }`}
                      >
                        {item.year}
                      </span>
                      <button
                        ref={active ? activeRef : undefined}
                        role="option"
                        aria-selected={active}
                        aria-label={`${item.year}: ${item.title}`}
                        onClick={() => setSelectedId(item.id)}
                        className="relative z-10 grid size-10 place-items-center rounded-full"
                      >
                        <motion.span
                          layout
                          className={`block rounded-full border-2 ${
                            missed ? "border-[var(--accent)]" : "border-muted"
                          } ${active ? "bg-[var(--accent)]" : item.key ? "bg-card" : "bg-bg-soft"}`}
                          animate={{
                            width: active ? 26 : item.key ? 16 : 11,
                            height: active ? 26 : item.key ? 16 : 11,
                          }}
                          transition={{ type: "spring", stiffness: 400, damping: 25 }}
                        />
                      </button>
                    </li>
                  );
                })}
              </ol>
            </div>
          </div>
          <p className="mt-1 flex items-center gap-4 text-xs text-muted">
            <span className="flex items-center gap-1.5">
              <span className="size-2.5 rounded-full border-2 border-[var(--accent)]" /> Desde 2022:
              lo que no viviste de cerca
            </span>
            <span className="flex items-center gap-1.5">
              <span className="size-3 rounded-full border-2 border-muted bg-card" /> Hito clave
            </span>
          </p>
        </div>

        {/* Tarjeta del hito */}
        <div className="relative min-h-[18rem]">
          <AnimatePresence mode="wait" initial={false}>
            {selected && (
              <motion.article
                key={selected.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.25 }}
                className="rounded-2xl border border-line bg-bg-soft p-5 sm:p-6"
                aria-live="polite"
              >
                <p className="text-sm text-muted">
                  {selected.month ? `${MONTHS[selected.month - 1]} ` : ""}
                  {selected.year} · {ERAS.find((e) => e.id === selected.era)?.label}
                  {selected.year >= MISSED_FROM && (
                    <span className="ml-2 rounded-full bg-[var(--accent-soft)] px-2 py-0.5 text-xs font-medium text-[var(--accent)]">
                      Te lo perdiste
                    </span>
                  )}
                </p>
                <h3 className="mt-1 font-display text-2xl leading-tight font-semibold">
                  {selected.title}
                </h3>
                <dl className="mt-4 grid gap-4 sm:grid-cols-2">
                  <div>
                    <dt className="text-xs font-semibold tracking-wider text-muted uppercase">
                      Qué pasó
                    </dt>
                    <dd className="mt-1">{selected.what}</dd>
                  </div>
                  <div>
                    <dt className="text-xs font-semibold tracking-wider text-muted uppercase">
                      Por qué importa
                    </dt>
                    <dd className="mt-1">{selected.why}</dd>
                  </div>
                  {selected.business && (
                    <div className="rounded-xl border border-line bg-card p-4 sm:col-span-2">
                      <dt className="text-xs font-semibold tracking-wider text-[var(--accent)] uppercase">
                        Lectura para el negocio
                      </dt>
                      <dd className="mt-1">{selected.business}</dd>
                    </div>
                  )}
                </dl>
                <p className="mt-4 text-xs text-muted">
                  Fuente:{" "}
                  {selected.sources.map((s, i) => (
                    <a key={s} href={s} target="_blank" rel="noreferrer" className="underline">
                      {i > 0 ? ", " : ""}
                      {new URL(s).hostname.replace("www.", "")}
                    </a>
                  ))}
                </p>
              </motion.article>
            )}
          </AnimatePresence>
        </div>

        <div className="flex items-center justify-between">
          <button
            onClick={() => go(-1)}
            disabled={idx <= 0}
            className="rounded-full border border-line px-4 py-2 text-sm hover:bg-bg-soft disabled:opacity-40"
          >
            ← Anterior
          </button>
          <span className="text-sm text-muted tabular-nums">
            {idx + 1} / {visible.length}
          </span>
          <button
            onClick={() => go(1)}
            disabled={idx >= visible.length - 1}
            className="rounded-full border border-line px-4 py-2 text-sm hover:bg-bg-soft disabled:opacity-40"
          >
            Siguiente →
          </button>
        </div>
      </div>
    </MotionConfig>
  );
}

function FilterButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      aria-pressed={active}
      className={`rounded-full border px-3 py-1 text-sm transition ${
        active
          ? "border-[var(--accent)] bg-[var(--accent-soft)] font-medium"
          : "border-line hover:bg-bg-soft"
      }`}
    >
      {children}
    </button>
  );
}
