// Punto único de acceso a los datos. Se validan al importarse: un dato mal formado rompe el build.
import * as s from "./schemas";
import timelineRaw from "./timeline.json";
import glossaryRaw from "./glossary.json";

export const timeline = s.timeline
  .parse(timelineRaw)
  .sort((a, b) => a.year - b.year || (a.month ?? 0) - (b.month ?? 0));
export const glossary = s.glossary
  .parse(glossaryRaw)
  .sort((a, b) => a.term.localeCompare(b.term, "es"));

export function glossaryEntry(id: string) {
  const entry = glossary.find((g) => g.id === id);
  if (!entry) throw new Error(`Término de glosario desconocido: "${id}"`);
  return entry;
}

export type { TimelineItem, GlossaryItem, Company, Model, CostItem } from "./schemas";
