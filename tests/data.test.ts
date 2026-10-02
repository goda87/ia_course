import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import * as s from "../src/data/schemas";

const dataDir = join(import.meta.dirname, "../src/data");
const load = (f: string) => JSON.parse(readFileSync(join(dataDir, f), "utf8"));
const exists = (f: string) => readdirSync(dataDir).includes(f);

const files: [string, { parse: (x: unknown) => unknown }][] = [
  ["timeline.json", s.timeline],
  ["glossary.json", s.glossary],
  ["companies.json", s.companies],
  ["models.json", s.models],
  ["costs.json", s.costs],
];

describe("datos de src/data", () => {
  for (const [file, schema] of files) {
    it.runIf(exists(file))(`${file} cumple su esquema`, () => {
      expect(() => schema.parse(load(file))).not.toThrow();
    });
    it.runIf(exists(file))(`${file} no tiene ids duplicados`, () => {
      const ids = (load(file) as { id: string }[]).map((x) => x.id);
      expect(new Set(ids).size).toBe(ids.length);
    });
  }

  it("ningún dato publicado contiene TODO-VERIFICAR", () => {
    for (const [file] of files) {
      if (exists(file))
        expect(readFileSync(join(dataDir, file), "utf8")).not.toContain("TODO-VERIFICAR");
    }
  });

  it.runIf(exists("models.json") && exists("companies.json"))(
    "cada modelo apunta a una empresa existente",
    () => {
      const ids = new Set((load("companies.json") as { id: string }[]).map((c) => c.id));
      for (const m of load("models.json") as { id: string; company: string }[]) {
        expect(ids.has(m.company), `${m.id} → ${m.company}`).toBe(true);
      }
    },
  );
});

describe("coherencia entre datos y contenido", () => {
  const modDir = join(import.meta.dirname, "../src/content/modulos");
  const slugs = new Set(readdirSync(modDir).map((f) => f.replace(/\.mdx$/, "")));

  it("cada término del glosario apunta a un módulo existente", () => {
    for (const g of load("glossary.json") as { id: string; module?: string }[]) {
      if (g.module) expect(slugs.has(g.module), `${g.id} → ${g.module}`).toBe(true);
    }
  });

  it("cada <Term id> usado en los módulos existe en el glosario", () => {
    const ids = new Set((load("glossary.json") as { id: string }[]).map((g) => g.id));
    for (const f of readdirSync(modDir)) {
      const src = readFileSync(join(modDir, f), "utf8");
      for (const m of src.matchAll(/<Term id="([^"]+)"/g)) {
        expect(ids.has(m[1]!), `${f}: ${m[1]}`).toBe(true);
      }
    }
  });
});
