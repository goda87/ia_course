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

Se despliega automáticamente en **GitHub Pages** (https://goda87.github.io/ia_course/) con cada push a `main`, mediante el workflow `.github/workflows/deploy.yml` (tests + build + despliegue). También se puede lanzar a mano desde la pestaña _Actions_.

Requisito, una sola vez: en GitHub, _Settings → Pages → Build and deployment → Source_, elegir **GitHub Actions**.

La ruta base (`/ia_course`) está en `astro.config.mjs` (`site` y `base`). En local, `pnpm dev` y `pnpm preview` sirven también bajo `/ia_course/`.

## Actualizar los datos

Los hechos (modelos, empresas, precios, hitos, glosario) están en `src/data/*.json`, con sus fuentes y fecha de verificación. Edita el JSON, ejecuta `pnpm test` y `pnpm build`.
