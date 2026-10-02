# IA para quien decide

Curso web interactivo para ponerse al día en inteligencia artificial sin perfil técnico: historia, cómo funcionan los LLM, los modelos de difusión y los agentes, el estado del arte en EE. UU., China y Europa, y herramientas para valorar proyectos de IA (incluidos dos casos concretos: generación de imágenes para animación y un agente para producción cinematográfica).

Toda la documentación para desarrollar y mantener el proyecto está en [`AGENTS.md`](AGENTS.md).

## Uso rápido

```bash
pnpm install
pnpm dev        # http://localhost:4321
pnpm build      # genera dist/ (sitio estático)
pnpm preview
pnpm lint && pnpm test
```

## Publicación

`dist/` es un sitio estático: se puede servir desde GitHub Pages, Netlify, Vercel o cualquier servidor web. Si se publica en un subdirectorio (por ejemplo GitHub Pages de un repositorio), configura `site` y `base` en `astro.config.mjs`.

## Actualizar los datos

Los hechos (modelos, empresas, precios, hitos, glosario) están en `src/data/*.json`, con sus fuentes y fecha de verificación. Edita el JSON, ejecuta `pnpm test` y `pnpm build`.
