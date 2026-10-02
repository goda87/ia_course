// @ts-check
import { defineConfig } from "astro/config";
import mdx from "@astrojs/mdx";
import react from "@astrojs/react";
import tailwindcss from "@tailwindcss/vite";

// Publicado en GitHub Pages: https://goda87.github.io/ia_course/
export default defineConfig({
  site: "https://goda87.github.io",
  base: "/ia_course",
  integrations: [react(), mdx()],
  vite: { plugins: [tailwindcss()] },
});
