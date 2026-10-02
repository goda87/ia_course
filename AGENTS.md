# AGENTS.md — Curso interactivo «IA para quien decide»

Guía base para cualquier agente de código (Claude Code, Codex, Cursor…) o persona que trabaje en este repositorio. Léela entera antes de tocar nada.

---

## 1. Qué es este proyecto

Una **web interactiva y animada** para poner al día en Inteligencia Artificial a una persona que:

- Vuelve al trabajo tras **4 años de desconexión** (se perdió en directo ChatGPT, la explosión de la IA generativa, los agentes…).
- Es **responsable en un departamento de innovación**: debe **supervisar y valorar proyectos** que usan IA de forma intensiva o están basados en ella.
- Tiene **perfil de marketing, no técnico**.

El objetivo no es formar a una ingeniera, sino darle **criterio**: entender qué hay detrás de cada proyecto, qué preguntas hacer, qué es realista, qué cuesta y dónde están los riesgos.

### Criterio de éxito

Tras recorrer la web, la usuaria debe poder:

1. Explicar con sus palabras qué es un LLM, un modelo de difusión, un chatbot y un agente.
2. Situar a los principales actores (EE. UU. y China) y sus modelos.
3. Hacer las preguntas correctas a un equipo que presenta un proyecto de IA.
4. Estimar órdenes de magnitud de coste y detectar promesas poco realistas.
5. Valorar con fundamento los dos proyectos concretos que tiene sobre la mesa (secciones 7 y 8).

---

## 2. Audiencia y tono (reglas obligatorias)

- **Idioma:** español de España. Términos técnicos en inglés solo cuando son de uso común (prompt, token, fine-tuning), siempre definidos la primera vez y enlazados al glosario.
- **Cero jerga sin explicar.** Si aparece un término técnico, va acompañado de una analogía o un tooltip.
- **Analogías del mundo del marketing y la empresa** antes que matemáticas (p. ej. LLM = «autocompletar entrenado con casi todo internet»; agente = «becario con acceso a herramientas y una lista de tareas»).
- **Nada de fórmulas.** Si algo necesita una ecuación para entenderse, se rediseña la explicación.
- **Módulos cortos:** 5–10 minutos de lectura cada uno. Cada módulo termina con un bloque **«Para llevar»** (3–5 ideas clave) y, si aplica, **«Qué preguntar en una reunión»**.
- **Tono:** cercano, claro, sin hype ni catastrofismo. Señalar límites y riesgos con la misma naturalidad que las capacidades.
- **Las animaciones explican, no decoran.** Cada animación debe responder a «¿qué concepto se entiende mejor gracias a esto?».

---

## 3. Stack técnico

| Pieza | Elección | Motivo |
|---|---|---|
| Framework | **Astro** + **MDX** | Sitio de contenido, estático, rápido; el texto vive en MDX fácil de editar |
| Interactividad | **Islas React** (`client:visible`) | Solo se hidrata lo interactivo |
| Animación | **Motion** (antes Framer Motion); **GSAP + ScrollTrigger** solo si hace falta scroll-telling complejo | Animaciones declarativas y accesibles |
| Estilos | **Tailwind CSS** | Rapidez y consistencia |
| Diagramas/gráficas | SVG propio animado; **D3** solo para visualizaciones de datos | Control total y ligereza |
| Lenguaje | **TypeScript** estricto (v6) | |
| Gestor de paquetes | **pnpm** | |
| Despliegue | **GitHub Pages** vía GitHub Actions (`.github/workflows/deploy.yml`), en `https://goda87.github.io/ia_course/` | Sin backend. Todos los enlaces internos deben usar `import.meta.env.BASE_URL` (base `/ia_course`) |

No añadir backend, base de datos ni llamadas a APIs de IA en tiempo real salvo petición explícita. Las «demos» de modelos son **simulaciones** con datos pregrabados (respuestas, imágenes de ejemplo), para que la web sea gratis, rápida y determinista.

### Comandos

```bash
pnpm install       # instalar dependencias
pnpm dev           # servidor de desarrollo
pnpm build         # build de producción (debe pasar sin errores)
pnpm preview       # previsualizar el build
pnpm lint          # astro check (tipos) + prettier --check
pnpm format        # prettier --write
pnpm test          # vitest: valida los datos de src/data contra sus esquemas
```

> TypeScript está fijado en la versión 6 porque `astro check` todavía no soporta TypeScript 7.
>
> En la máquina de desarrollo original Node no estaba instalado en el sistema: se instaló en `~/.local/share/node` (añádelo al `PATH` con `export PATH=~/.local/share/node/bin:$PATH`).

---

## 4. Estructura del repositorio

```
/
├─ AGENTS.md                 # este archivo
├─ astro.config.mjs
├─ public/
│  └─ media/                 # imágenes y vídeos de ejemplo (optimizados, con licencia anotada)
├─ src/
│  ├─ content/
│  │  └─ modulos/            # un .mdx por módulo (ver sección 5)
│  ├─ data/                  # datos estructurados y verificables (JSON + esquema)
│  │  ├─ timeline.json       # hitos de la historia de la IA
│  │  ├─ companies.json      # empresas (EE. UU., China, otras)
│  │  ├─ models.json         # modelos y capacidades
│  │  ├─ glossary.json       # glosario
│  │  └─ costs.json          # rangos de costes usados en los módulos de proyectos
│  │  ├─ schemas.ts          # esquemas zod de todos los JSON
│  │  └─ index.ts            # punto único de acceso: valida al importar (un dato mal formado rompe el build)
│  ├─ components/
│  │  ├─ ui/                 # Astro: Callout, ParaLlevar, QuePreguntar, Analogia, Aviso, Term, VizFrame, CompanyGrid, CostSources, Glossary…
│  │  ├─ viz/                # React: visualizaciones animadas (una por concepto)
│  │  └─ interactive/        # React: simuladores, comparadores, ejercicios, checklist, glosario
│  ├─ content.config.ts      # colección «modulos» (frontmatter: title, order, block, summary, minutes, verifiedAt?)
│  ├─ layouts/BaseLayout.astro
│  ├─ lib/                   # blocks.ts, modules.ts, format.ts (dinero y números), motion.ts
│  ├─ pages/                 # index.astro, modulos/[slug].astro, 404.astro
│  ├─ scripts/               # progress.ts (progreso en localStorage), nav.ts (menú móvil)
│  └─ styles/global.css      # tokens de color (claro/oscuro) y color por bloque
└─ tests/                    # validación de datos (esquemas) y tests de componentes clave
```

**Regla de oro:** los **hechos** (fechas, modelos, precios, capacidades) viven en `src/data/*.json`, nunca escritos a mano dentro de componentes. El MDX y los componentes los leen de ahí. Así actualizar el «estado del arte» es editar un JSON.

### Esquema mínimo de `models.json`

```jsonc
{
  "id": "claude-opus-x",
  "name": "Claude Opus X",
  "company": "anthropic",            // id en companies.json
  "country": "US",                   // US | CN | EU | other
  "type": ["llm"],                   // llm | razonamiento | imagen | video | audio | multimodal
  "released": "2026-05",
  "openWeights": false,
  "license": "propietaria",
  "strengths": ["código", "agentes", "documentos largos"],
  "limitations": ["..."],
  "pricing": { "unit": "1M tokens", "input": null, "output": null, "currency": "USD" },
  "sources": ["https://..."],
  "verifiedAt": "2026-10-01"         // OBLIGATORIO
}
```

Validar todos los JSON con **zod** en `tests/` y en el build. Los esquemas completos están en `src/data/schemas.ts`; los tests comprueban además que no haya ids duplicados, que cada modelo apunte a una empresa existente, que cada `<Term id>` exista en el glosario y que ningún dato publicado contenga `TODO-VERIFICAR`.

---

## 5. Mapa de contenidos (módulos)

Orden recomendado de lectura. Cada módulo = un archivo MDX en `src/content/modulos/`.

### Bloque A — Contexto

**00. Bienvenida y mapa del curso**
Qué ha pasado en estos 4 años en un minuto. Animación: «línea de tiempo comprimida» de 2021 a hoy.

**01. Historia de la IA** — *timeline interactiva horizontal con zoom*
Hitos mínimos (completar y verificar en `timeline.json`):
- 1950 Test de Turing · 1956 Conferencia de Dartmouth (nace el término «IA»)
- Años 70 y 80–90: los «inviernos de la IA» y los sistemas expertos
- 1997 Deep Blue gana a Kasparov
- 2012 AlexNet: arranca el deep learning moderno
- 2014 GANs (primeras imágenes generadas «creíbles»)
- 2016 AlphaGo
- 2017 *Attention Is All You Need*: el **Transformer**, base de todo lo actual
- 2018–2020 BERT, GPT-2, GPT-3: modelos que escriben
- 2021 DALL·E y CLIP
- 2022 DALL·E 2, Midjourney, **Stable Diffusion** (difusión abierta), **ChatGPT** (noviembre) ← *aquí empieza el periodo que la usuaria se perdió*
- 2023 GPT-4, Claude, Llama (modelos abiertos), Gemini
- 2024 Modelos multimodales nativos, vídeo generativo (Sora, Veo, Kling), primeros modelos de «razonamiento» (o1)
- 2025 DeepSeek R1 (China sacude el mercado con un modelo abierto y barato), auge de los **agentes** (asistentes de código, uso del ordenador, MCP), vídeo con audio
- 2026 → lo que verifique el agente investigador (ver sección 9)

Interacción: al pulsar un hito, tarjeta con «qué pasó», «por qué importa» y «qué ha cambiado para el negocio».

**02. Mapa de la IA** — *diagrama de conjuntos anidados animado*
IA ⊃ Machine Learning ⊃ Deep Learning ⊃ IA generativa (texto, imagen, vídeo, audio). Diferencia IA predictiva vs. generativa.

### Bloque B — Cómo funciona (sin matemáticas)

**03. Cómo funciona un LLM**
Visualizaciones obligatorias:
- **Tokenizador interactivo:** la usuaria escribe una frase y ve cómo se trocea en tokens (simulado).
- **Predicción de la siguiente palabra:** barras de probabilidad animadas; un deslizador de **temperatura** muestra cómo cambia la creatividad.
- **Embeddings:** mapa 2D donde palabras parecidas aparecen cerca (rey/reina, París/Madrid).
- **Atención:** frase con flechas que muestran a qué palabras «mira» cada palabra.
- **Entrenamiento en 3 fases:** preentrenamiento (leer internet) → ajuste con instrucciones → RLHF/feedback humano. Analogía: estudiante → becario → empleado formado en la cultura de la empresa.
- **Ventana de contexto** como «memoria de trabajo» con límite.
- **Alucinaciones:** por qué ocurren y cómo se mitigan (RAG, citas, verificación).
- **Modelos de razonamiento:** el modelo «piensa antes de responder»; más calidad a cambio de más tiempo y coste.

**04. Cómo funciona un modelo de difusión (imagen y vídeo)**
- **Animación central:** una imagen que se va destruyendo con ruido (entrenamiento) y el proceso inverso, del ruido a la imagen, paso a paso guiado por el texto. Deslizador para avanzar los pasos.
- Texto → «encoder» → guía del proceso (analogía: escultor que quita mármol siguiendo instrucciones).
- Espacio latente (trabajar con una «miniatura comprimida» para ahorrar cálculo).
- Herramientas de control: **LoRA** (enseñar un estilo o personaje con pocas imágenes), **ControlNet** (fijar pose, composición, bordes), **image-to-image**, **inpainting**.
- De imagen a vídeo: consistencia temporal, por qué es más difícil y más caro.

**05. Chatbot vs. asistente vs. agente**
- **Chatbot:** pregunta → respuesta. Animación de la conversación como un documento que crece.
- **System prompt:** las «instrucciones de la casa» invisibles para el usuario. Demo: mismo mensaje, tres system prompts distintos, tres respuestas distintas.
- **RAG:** el modelo consulta documentos de la empresa antes de responder.
- **Herramientas (tool use):** el modelo pide «buscar en web», «consultar calendario», «generar imagen».
- **Agente:** bucle *pensar → actuar → observar → repetir* hasta cumplir el objetivo. Animación del bucle con un ejemplo de negocio (p. ej. «prepara un informe de competencia»).
- **Skills, MCP, subagentes y memoria:** paquetes de instrucciones/herramientas reutilizables; MCP como «USB-C de las herramientas de IA»; agentes que delegan en otros agentes.
- **Human-in-the-loop:** dónde debe aprobar una persona.
- Límites: errores que se acumulan, coste por tarea, seguridad (prompt injection), trazabilidad.

### Bloque C — Estado del arte

**06. Quién es quién: EE. UU. vs. China (y Europa)**
Componente: **comparador filtrable** (país, tipo de modelo, abierto/cerrado, precio) alimentado por `companies.json` y `models.json`.

Actores mínimos a cubrir (verificar modelos vigentes):
- **EE. UU.:** OpenAI (GPT, imagen, Sora), Anthropic (Claude), Google/DeepMind (Gemini, Imagen, Veo), Meta (Llama), xAI (Grok), Microsoft, Amazon (Nova), NVIDIA (infraestructura y modelos abiertos), Midjourney, Runway, Adobe (Firefly, enfoque «comercialmente seguro»).
- **China:** DeepSeek, Alibaba (Qwen, Wan), Moonshot (Kimi), Zhipu (GLM), MiniMax (incl. Hailuo vídeo), ByteDance (Doubao, Seedream, Seedance), Tencent (Hunyuan), Baidu (ERNIE), Kuaishou (Kling).
- **Europa (contexto):** Mistral, Black Forest Labs (FLUX), Stability AI.

Ideas clave a transmitir:
- Modelos **cerrados** (API) vs. **de pesos abiertos** (se pueden descargar, ajustar y alojar en casa): implicaciones de coste, control, privacidad y licencia.
- China lidera en modelos abiertos y precio; EE. UU. en modelos frontera cerrados (verificar con datos actuales).
- Los rankings cambian cada pocos meses: enseñar **a leer benchmarks y leaderboards** (LMArena, Artificial Analysis…) más que memorizar un ranking.
- Consideraciones de uso empresarial en la UE: **AI Act**, RGPD, residencia de datos, uso de modelos chinos vía API frente a pesos abiertos alojados en Europa.

### Bloque D — Aplicación a su trabajo

**07. Proyecto A: generación de imágenes para animación con un modelo específico** (ver sección 7)
**08. Proyecto B: agente para la creación de películas** (ver sección 8)

**09. Cómo valorar cualquier proyecto de IA** — *checklist interactiva descargable (PDF/print)*
- ¿Qué problema resuelve y cómo se resolvía antes? ¿Cuál es la métrica de éxito?
- ¿Usan un modelo de terceros (API), uno abierto ajustado o uno propio? ¿Por qué?
- ¿Qué es realmente propio (datos, flujo, interfaz) y qué es un «envoltorio» de un modelo ajeno?
- Dependencia de proveedor y plan B si cambia precio o modelo.
- Coste por uso (por imagen, por token, por tarea) y cómo escala.
- Datos: origen, derechos, privacidad, RGPD.
- Evaluación: ¿cómo miden la calidad? ¿hay un conjunto de pruebas? ¿revisión humana?
- Riesgos legales (propiedad intelectual, AI Act) y reputacionales.
- Señales de alarma: «nuestro modelo propio» sin detalle, cifras sin metodología, demos no reproducibles, «sustituye al 100 % a…».

**10. Glosario** (desde `glossary.json`, con buscador) y **recursos para seguir aprendiendo**.

---

## 6. Guía de diseño y accesibilidad

- Estética limpia, editorial, mucho aire. Paleta con un color por bloque (Contexto, Cómo funciona, Estado del arte, Aplicación).
- Navegación lateral con progreso por módulo (guardado en `localStorage`, con `try/catch`).
- **Responsive** (se leerá también en móvil/tablet).
- **`prefers-reduced-motion`**: toda animación tiene versión estática equivalente.
- Contraste AA, navegación por teclado, `alt` en todas las imágenes, sin información transmitida solo por color.
- Modo claro y oscuro.
- Rendimiento: Lighthouse ≥ 90 en todo; imágenes en AVIF/WebP; vídeos cortos, sin autoplay con sonido.

---

## 7. Contenido del módulo «Proyecto A — Imágenes para animación»

No hay detalles del proyecto, así que el módulo presenta **el abanico de posibilidades**, de menor a mayor inversión, para que la usuaria pueda **situar** la propuesta cuando la reciba. Presentarlo como una **escalera interactiva** de 5 niveles con coste, plazo, ventajas y riesgos.

> Todas las cifras son **órdenes de magnitud orientativos** (precios de mercado 2025–2026, USD). Deben vivir en `costs.json` con `sources` y `verifiedAt`, y mostrarse siempre como rangos con el aviso «orientativo».

| Nivel | Enfoque | Qué implica | Coste orientativo | Plazo |
|---|---|---|---|---|
| 1 | **API comercial + referencias de estilo** (sin entrenar nada) | Usar modelos de terceros con imágenes de referencia de personaje/estilo | ~0,01–0,10 $ por imagen; vídeo ~0,05–0,50 $ por segundo | Días |
| 2 | **LoRA sobre modelo abierto** (FLUX, Qwen-Image, SDXL; Wan/Hunyuan para vídeo) | Entrenar un «adaptador» ligero con decenas-cientos de imágenes del estilo/personajes | Cómputo: decenas a pocos cientos $ por entrenamiento. **El coste real es el dataset** (preparación, limpieza, etiquetado, artistas) y la iteración | Semanas |
| 3 | **Pipeline de producción** (LoRA + ControlNet/poses + consistencia de personaje + interpolación entre fotogramas + revisión humana) | Lo más habitual en un producto serio para animación | Desarrollo: 1–3 perfiles técnicos durante meses (decenas a cientos de miles $). Infraestructura GPU: ~1–4 $/hora por GPU en la nube, o servidores propios | 3–9 meses |
| 4 | **Fine-tuning completo** de un modelo abierto | Ajustar todo el modelo con miles-decenas de miles de imágenes propias | Cómputo: miles a decenas de miles $ + equipo especializado | Meses |
| 5 | **Entrenar un modelo desde cero** | Modelo base propio | Cientos de miles a millones $ en cómputo, más datos masivos con derechos. **Muy raramente justificable** para una empresa de animación | 6–18 meses |

Contenido adicional obligatorio del módulo:
- **Retos específicos de la animación:** consistencia del personaje entre planos, coherencia temporal, control de pose y cámara, *in-betweening* (fotogramas intermedios), estilo de línea y color planos, integración con herramientas existentes (Toon Boom, Blender, After Effects, TVPaint…).
- **Costes ocultos:** curación del dataset, horas de artistas para corregir resultados, revisión humana, MLOps, almacenamiento, actualizaciones cuando sale un modelo base mejor (cada pocos meses).
- **Licencias:** comprobar la licencia del modelo base para uso comercial (algunas versiones de FLUX, por ejemplo, tienen licencias no comerciales; otros modelos son Apache 2.0). Verificar caso por caso.
- **Propiedad intelectual y datos:** ¿con qué imágenes se entrena? ¿son propias o con derechos cedidos? ¿quién es titular del resultado? Riesgo de imitar estilos de terceros.
- **Regulación:** AI Act (obligaciones de transparencia y marcado de contenido generado), derechos de autor en la UE.
- **Preguntas para el equipo del proyecto:** ¿qué modelo base?, ¿qué significa exactamente «entrenado específicamente»?, ¿cuántas imágenes y de quién?, ¿cómo se garantiza la consistencia?, ¿qué porcentaje del trabajo final requiere retoque humano?, ¿coste por segundo de animación final vs. proceso actual?, ¿qué pasa si el modelo base cambia de licencia o queda obsoleto?
- **Simulador interactivo de costes:** la usuaria introduce minutos de animación, fps, % de fotogramas generados por IA, % de retoque humano y elige nivel → rango de coste estimado. Fórmulas y supuestos visibles y documentados en `costs.json`.

---

## 8. Contenido del módulo «Proyecto B — Agente para la creación de películas»

Hipótesis de partida: es un **agente especializado** construido sobre un LLM de terceros, con **system prompts y skills preconfigurados** por fase de producción, más herramientas conectadas. El módulo explica esa arquitectura con un **diagrama animado por capas** y da criterios para valorarlo.

### Arquitectura probable (diagrama)

1. **Modelo base** (LLM de OpenAI, Anthropic, Google, o abierto tipo Qwen/DeepSeek/Llama).
2. **System prompt** con el «rol» (productor, guionista, ayudante de dirección…).
3. **Skills por fase**, por ejemplo:
   - Desarrollo: ideación, logline, sinopsis, tratamiento, estructura, biblia de personajes.
   - Guion: escritura y revisión, formato estándar, análisis de ritmo y diálogo.
   - Preproducción: desglose de guion, lista de planos, storyboard (vía modelo de imagen), presupuesto, plan de rodaje, casting, localizaciones.
   - Producción/postproducción: continuidad, notas de montaje, subtítulos, materiales de marketing (tráiler, pósters, dossier de venta).
4. **Herramientas:** generación de imagen/vídeo/voz, lectura y escritura de documentos (Final Draft, PDF, hojas de cálculo), calendario, búsqueda.
5. **Memoria del proyecto / RAG:** guion, biblia, decisiones previas; el agente recuerda el universo de la película.
6. **Orquestación:** un agente principal que delega en subagentes especializados.
7. **Humano en el bucle:** aprobaciones en cada entrega.

Demo interactiva: el mismo encargo («haz el desglose de la escena 12») recorrido paso a paso por el bucle del agente, mostrando qué skill y qué herramienta se activa en cada momento.

### Criterios de valoración

- **¿Envoltorio o producto?** ¿Qué aporta más allá de usar directamente Claude/ChatGPT con buenas instrucciones? El valor suele estar en flujos, integraciones, formatos del sector y datos propios.
- **Dependencia del proveedor del modelo** y capacidad de cambiarlo.
- **Calidad y evaluación:** ¿cómo miden que un desglose o un presupuesto es correcto? ¿han validado con profesionales del sector?
- **Confidencialidad:** guiones inéditos enviados a APIs de terceros; condiciones de uso de datos, residencia en la UE.
- **Derechos:** autoría de textos e imágenes generados, gremios y convenios (guionistas, actores, voces).
- **Costes:** coste por token del modelo (rango orientativo para modelos frontera: ~1–15 $ por millón de tokens de entrada y ~5–75 $ de salida; verificar en `costs.json`) → estimar **coste por sesión/proyecto**; licencias de las herramientas de imagen/vídeo; desarrollo y mantenimiento de prompts y skills.
- **Mini-calculadora:** nº de usuarios × sesiones al mes × tokens medios por sesión × precio → coste mensual.

---

## 9. Veracidad y actualización (crítico)

La IA cambia cada semana. Esta web pierde todo su valor si contiene datos falsos o viejos.

- **Nunca inventar** nombres de modelos, fechas, precios ni capacidades. Si un agente no puede verificar algo, lo marca con `"TODO-VERIFICAR"` y no lo publica como hecho.
- Para el estado del arte, el agente debe **buscar en fuentes primarias** (blogs y páginas de precios oficiales de cada empresa, model cards, papers) y, como complemento, en agregadores reconocidos (Artificial Analysis, LMArena, Epoch AI, Stanford AI Index).
- Cada entrada de `src/data/` lleva `sources` y `verifiedAt`. La UI muestra «Datos verificados a fecha X» en cada módulo del Bloque C y D.
- Distinguir siempre **hecho** («el modelo X tiene una ventana de contexto de N tokens según su documentación») de **valoración** («X destaca en programación según benchmarks Y y Z»).
- Precios: siempre como rango y con moneda y fecha.
- Imágenes de ejemplo: solo con licencia que permita su uso; anotar origen en `public/media/CREDITS.md`.

---

## 10. Forma de trabajar para los agentes

### Convenciones técnicas aprendidas

- **Nada de contenido oculto antes de hidratar.** Las islas usan `client:visible`: hasta que se hidratan, se ve el HTML del servidor. No pongas `initial={{ opacity: 0 }}` en texto o contenido clave; usa `initial={false}` o `AnimatePresence initial={false}`.
- **Preferencia de movimiento:** usa `useReducedMotionSafe()` de `src/lib/motion.ts` (no `useReducedMotion` directamente) si el resultado cambia lo que se renderiza; evita errores de hidratación. Envuelve cada visualización en `<MotionConfig reducedMotion="user">`.
- **Colores:** usa los tokens (`bg-card`, `text-muted`, `border-line`…) y `var(--accent)` / `var(--accent-soft)`, que cambian según el bloque del módulo. No uses colores de Motion con `var()`: anima con clases y transiciones CSS.
- **Términos:** `<Term id="…" />` muestra el término en minúscula en mitad de frase; si va al inicio de frase o necesita otra forma, pásale el texto: `<Term id="modelo">Modelo</Term>`.
- **Cifras:** formatea con `money`, `moneyRange` y `num` de `src/lib/format.ts`. Prettier puede partir texto entre «» y JSX: construye esas cadenas con plantillas.
- **`localStorage`** solo para comodidades del lector (progreso, tema, checklist), siempre dentro de `try/catch`.
- **Verificación visual:** antes de cerrar un módulo, haz capturas a 390 px y 1300 px en claro y oscuro, comprueba que no hay desbordamiento horizontal ni errores en consola y pasa axe (WCAG A/AA).

- Trabajar **módulo a módulo**: contenido MDX + datos + visualización + revisión. No dejar módulos a medias en `main`.
- Antes de crear un componente nuevo, revisar si existe uno reutilizable en `src/components/`.
- Cada visualización en `components/viz/` es autónoma, recibe datos por props y tiene su variante estática para reduced-motion.
- Textos visibles para la usuaria: siempre en MDX o JSON, nunca incrustados en lógica.
- Antes de dar una tarea por terminada: `pnpm build` y `pnpm lint` sin errores, y comprobar el módulo en móvil y escritorio.
- Commits pequeños y descriptivos, en español, formato `tipo(módulo): descripción` (p. ej. `feat(llm): tokenizador interactivo`).
- No añadir dependencias pesadas sin justificarlo en el PR/commit.
- Ante dudas de contenido (qué nivel de detalle, qué ejemplo usar), priorizar **claridad para una persona de marketing** sobre exhaustividad técnica.

---

## 11. Hoja de ruta

1. ✅ Inicializar Astro + MDX + React + Tailwind + Motion; layout, navegación y componentes `ui/`.
2. ✅ Esquemas zod y primera carga de `src/data/` (timeline, glosario) verificada.
3. ✅ Módulos 00–02 (bienvenida, historia y mapa).
4. ✅ Módulos 03–05 (LLM, difusión, agentes) con sus visualizaciones.
5. ✅ Investigación verificada (2 de octubre de 2026) y módulo 06 (estado del arte + comparador).
6. ✅ Módulos 07–08 (proyectos) con simulador y calculadora de costes.
7. ✅ Módulo 09 (checklist) y 10 (glosario).
8. ✅ Revisión técnica de accesibilidad (axe sin violaciones A/AA), rendimiento (Lighthouse 99–100) y móvil.
9. ⏳ Lectura completa con la usuaria final y ajustes de contenido según su feedback.
10. ⏳ Cuando haya detalles reales de los proyectos A y B, actualizar los módulos 07–08 con su caso concreto.

### Mantenimiento periódico (cada 1–3 meses)

- Revisar `models.json`, `companies.json` y `costs.json` con fuentes primarias; actualizar `verifiedAt` y los `verifiedAt` del frontmatter de los módulos 01, 06, 07, 08 y 09.
- Añadir los nuevos hitos a `timeline.json`.
- Revisar el calendario del AI Act (módulos 07 y 09).
