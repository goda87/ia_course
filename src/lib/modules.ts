import { getCollection, type CollectionEntry } from "astro:content";

export type Modulo = CollectionEntry<"modulos">;

export async function getModules(): Promise<Modulo[]> {
  const all = await getCollection("modulos");
  return all.sort((a, b) => a.data.order - b.data.order);
}

export function moduleHref(m: Modulo): string {
  return `${import.meta.env.BASE_URL.replace(/\/$/, "")}/modulos/${m.id}/`;
}

export function pad(n: number): string {
  return String(n).padStart(2, "0");
}
