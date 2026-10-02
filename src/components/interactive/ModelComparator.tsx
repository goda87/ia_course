import { AnimatePresence, MotionConfig, motion } from "motion/react";
import { useMemo, useState } from "react";
import type { Company, Model } from "@/data/schemas";

const COUNTRY: Record<Model["country"], { label: string; flag: string }> = {
  US: { label: "EE. UU.", flag: "🇺🇸" },
  CN: { label: "China", flag: "🇨🇳" },
  EU: { label: "Europa", flag: "🇪🇺" },
  other: { label: "Otros", flag: "🌐" },
};

const TYPE_LABEL: Record<Model["type"][number], string> = {
  llm: "Texto",
  razonamiento: "Razonamiento",
  imagen: "Imagen",
  video: "Vídeo",
  audio: "Audio",
  multimodal: "Multimodal",
};

type TypeFilter = "todos" | "texto" | "imagen" | "video";

interface Props {
  models: Model[];
  companies: Company[];
}

const MONTHS = ["ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "sep", "oct", "nov", "dic"];
const fmtMonth = (m: string) => {
  const [y, mo] = m.split("-");
  return `${MONTHS[Number(mo) - 1]} ${y}`;
};
const fmtUsd = (n: number) =>
  n.toLocaleString("es-ES", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: n < 1 ? 3 : 2,
  });

export default function ModelComparator({ models, companies }: Props) {
  const [country, setCountry] = useState<Model["country"] | "todos">("todos");
  const [type, setType] = useState<TypeFilter>("todos");
  const [onlyOpen, setOnlyOpen] = useState(false);
  const [open, setOpen] = useState<string | null>(null);

  const companyName = (id: string) => companies.find((c) => c.id === id)?.name ?? id;

  const list = useMemo(
    () =>
      models.filter((m) => {
        if (country !== "todos" && m.country !== country) return false;
        if (onlyOpen && !m.openWeights) return false;
        if (type === "texto") return m.type.includes("llm");
        if (type === "imagen") return m.type.includes("imagen");
        if (type === "video") return m.type.includes("video");
        return true;
      }),
    [models, country, type, onlyOpen],
  );

  return (
    <MotionConfig reducedMotion="user">
      <div className="flex flex-col gap-3">
        <Seg
          label="País"
          value={country}
          onChange={setCountry}
          options={[
            ["todos", "Todos"],
            ["US", "🇺🇸 EE. UU."],
            ["CN", "🇨🇳 China"],
            ["EU", "🇪🇺 Europa"],
          ]}
        />
        <Seg
          label="Tipo"
          value={type}
          onChange={setType}
          options={[
            ["todos", "Todos"],
            ["texto", "Texto"],
            ["imagen", "Imagen"],
            ["video", "Vídeo"],
          ]}
        />
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={onlyOpen}
            onChange={(e) => setOnlyOpen(e.target.checked)}
            className="size-4 accent-[var(--accent)]"
          />
          Solo modelos de pesos abiertos (descargables)
        </label>
      </div>

      <p className="mt-4 text-sm text-muted" aria-live="polite">
        {list.length} modelos
      </p>
      <ul className="mt-2 grid items-start gap-3 sm:grid-cols-2">
        <AnimatePresence initial={false} mode="popLayout">
          {list.map((m) => {
            const isOpen = open === m.id;
            return (
              <motion.li
                key={m.id}
                layout
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.96 }}
                transition={{ duration: 0.2 }}
                className="rounded-xl border border-line bg-card"
              >
                <button
                  onClick={() => setOpen(isOpen ? null : m.id)}
                  aria-expanded={isOpen}
                  className="w-full p-4 text-left"
                >
                  <span className="flex items-start justify-between gap-2">
                    <span>
                      <span className="block font-semibold">{m.name}</span>
                      <span className="text-sm text-muted">
                        {COUNTRY[m.country].flag} {companyName(m.company)} · {fmtMonth(m.released)}
                      </span>
                    </span>
                    <span
                      className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-medium ${
                        m.openWeights
                          ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/50 dark:text-emerald-200"
                          : "bg-bg-soft text-muted"
                      }`}
                    >
                      {m.openWeights ? "Abierto" : "Cerrado"}
                    </span>
                  </span>
                  <span className="mt-2 flex flex-wrap gap-1">
                    {m.type.map((t) => (
                      <span
                        key={t}
                        className="rounded bg-[var(--accent-soft)] px-1.5 py-0.5 text-xs"
                      >
                        {TYPE_LABEL[t]}
                      </span>
                    ))}
                  </span>
                  {m.pricing && (
                    <span className="mt-2 block text-sm">
                      {m.pricing.input !== null && <>Entrada {fmtUsd(m.pricing.input)} · </>}
                      {m.pricing.input !== null ? "Salida " : ""}
                      {m.pricing.output !== null && fmtUsd(m.pricing.output)}{" "}
                      <span className="text-muted">/ {m.pricing.unit}</span>
                    </span>
                  )}
                </button>
                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="border-t border-line p-4 text-sm">
                        <p className="font-medium">Puntos fuertes</p>
                        <ul className="mt-1 list-disc pl-5">
                          {m.strengths.map((s) => (
                            <li key={s}>{s}</li>
                          ))}
                        </ul>
                        {m.limitations.length > 0 && (
                          <>
                            <p className="mt-3 font-medium">A tener en cuenta</p>
                            <ul className="mt-1 list-disc pl-5">
                              {m.limitations.map((s) => (
                                <li key={s}>{s}</li>
                              ))}
                            </ul>
                          </>
                        )}
                        <p className="mt-3">
                          <span className="font-medium">Licencia:</span> {m.license}
                        </p>
                        {m.context && (
                          <p>
                            <span className="font-medium">Contexto:</span>{" "}
                            {m.context.toLocaleString("es-ES")} tokens
                          </p>
                        )}
                        {m.pricing?.note && <p className="text-muted">{m.pricing.note}</p>}
                        <p className="mt-3 text-xs text-muted">
                          Fuentes:{" "}
                          {m.sources.map((s, i) => (
                            <a
                              key={s}
                              href={s}
                              target="_blank"
                              rel="noreferrer"
                              className="underline"
                            >
                              {i > 0 ? ", " : ""}
                              {new URL(s).hostname.replace("www.", "")}
                            </a>
                          ))}{" "}
                          · verificado {m.verifiedAt}
                        </p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.li>
            );
          })}
        </AnimatePresence>
      </ul>
    </MotionConfig>
  );
}

function Seg<T extends string>({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: T;
  onChange: (v: T) => void;
  options: [T, string][];
}) {
  return (
    <div className="flex flex-wrap items-center gap-2" role="group" aria-label={label}>
      <span className="w-12 text-xs font-semibold tracking-wider text-muted uppercase">
        {label}
      </span>
      {options.map(([v, l]) => (
        <button
          key={v}
          onClick={() => onChange(v)}
          aria-pressed={value === v}
          className={`rounded-full border px-3 py-1 text-sm ${
            value === v
              ? "border-[var(--accent)] bg-[var(--accent-soft)] font-medium"
              : "border-line hover:bg-bg-soft"
          }`}
        >
          {l}
        </button>
      ))}
    </div>
  );
}
