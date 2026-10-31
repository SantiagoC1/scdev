# Auditoría C0 (línea base, rama `feat/rediseno`)

Medido sobre `npm run build && npm run preview` (localhost:4173), Lighthouse con Chromium de Playwright. JSON en `docs/lighthouse/antes/`, capturas (375, 768, 1440) en `docs/capturas/c0/`.

## Lighthouse

| Ruta | Modo | Perf | A11y | BP | SEO | LCP | CLS | TBT |
|---|---|---|---|---|---|---|---|---|
| `/` | móvil | 41 | 94 | 100 | 100 | 11,0 s | 0,009 | 1.990 ms |
| `/` | escritorio | 84 | 91 | 100 | 100 | 1,9 s | 0,039 | 210 ms |
| `/servicios/landing-page-profesional` | móvil | 46 | 93 | 100 | 100 | 10,1 s | 0,001 | 2.210 ms |
| `/servicios/landing-page-profesional` | escritorio | 91 | 91 | 100 | 100 | 1,2 s | 0 | 210 ms |

Peso total de la home en móvil: 2.382 KiB. Nota: el preview local no pasa por la CDN de Netlify, así que el LCP real en producción puede ser algo mejor, pero la proporción entre rutas es válida.

## JS (gzip)

- Chunk inicial `index-*.js`: **130,8 KB** (413 KB sin comprimir). Incluye Home completa y todas las secciones, porque `Home` no es lazy. Este es el número que C6 no puede superar.
- Rutas lazy: `ServicePage` 3,9 KB, `NosotrosPage` 4,8 KB, las cinco páginas de servicio ~0,3 KB cada una (son wrappers), icono 0,5 KB.
- CSS: 8,2 KB gzip.

## Crawler sin JavaScript

`curl` de `/` y de `/servicios/landing-page-profesional` devuelve solo `<div id="root"></div>`. En la página de servicio el `<title>` es el de la home (el de la ruta se inyecta con JS). Sin `<h1>`, sin contenido, sin meta por ruta.

## Los 10 problemas más graves, por impacto

1. **Sin prerender (SEO/GEO).** Crawlers e IA ven una página vacía y el `<title>` de la home en todas las rutas. Es el mayor riesgo para el objetivo del sitio (aparecer en búsquedas locales). Se resuelve en C5.
2. **LCP de 10-11 s y TBT de ~2 s en móvil.** Imágenes de cientos de KB a MB, `particles.js` bloqueante, todo el JS de la home en un solo chunk y partículas corriendo en celular. Se ataca en C1 y C3.
3. **Imágenes sin optimizar.** Fotos del equipo de 5-7,6 MB (`EzequielWeber.png` 7,6 MB, `AgustinMazzoni.png` 6,1 MB, `SantaigoCaceres.png` 5,2 MB), `UnidosConstruimos.png` 2,6 MB, `AdsumPater.png` 2,1 MB y logos de marca de ~0,9-1,7 MB. Varias ya tienen versión `.webp` pero los `.png` siguen en `public/` y se publican. Las imágenes no declaran `width`/`height` (Lighthouse: `unsized-images`).
4. **Logos de clientes rotos.** Diagnóstico: no hay 404 (probé todas las `/images/*` y ninguna devuelve error; `DrPadegimas.png` sí está en `public/images`). La causa es `loading="lazy"` en imágenes dentro del marquee animado con `transform`, sumado a logos de ~1 MB: no cargan a tiempo y queda visible el `alt` cortado en la caja de 48 px. Se arregla en C1 (quitar el marquee en C4 lo elimina de raíz).
5. **`particles.min.js` bloquea el render** (script síncrono en `<head>`) y el efecto corre también en móvil y con `prefers-reduced-motion`.
6. **OG image incorrecta.** `og:image` apunta a `LogoChicoFN.png` (862 KB) declarada como 1200×630 y no lo es; el favicon también sirve ese PNG de 862 KB.
7. **Contraste y accesibilidad (A11y 91-94).** Falla `color-contrast` (25 usos de `text-[#D32F2F]` sobre fondo oscuro, textos de 10-11 px), `heading-order`, y `ContactModal` con labels sin `htmlFor`/`id`. Tiene `role="dialog"` y `aria-labelledby`, pero no trampa de foco ni retorno de foco.
8. **`ContactModal` deja datos personales en la consola.** `console.log` del payload (líneas 117-118, 134) y precio hardcodeado en la opción de Presencia Web. `useSheetConfig` también loguea la config. El evento `form_submission` de `dataLayer` existe (línea ~147), falta verificar que lleve `form_name` y `servicio`.
9. **Estructura de home redundante.** Clientes (marquee) y Portfolio muestran los mismos proyectos; cinco cards iguales de servicios sin jerarquía de precio; 54 usos de `initial=`/`whileInView` (fade-up en cada sección).
10. **Estética de plantilla.** Etiquetas tipo código (`— Hablemos` y las `.load() → …`), palabras sueltas en rojo, `→` en botones, sin link "Saltar al contenido". Lighthouse además marca la falta de `llms.txt` y de schema válido por página (`llms-txt`, `ard-schema`).

## Otros hallazgos menores

- `netlify.toml` y `public/_redirects` duplican el redirect SPA (se deja uno solo en C5).
- `preconnect` a `fonts.googleapis.com` sin uso (fuentes vía `@fontsource`).
- GTM va antes de `<meta charset>`/viewport en `index.html`.
- `Bplay.png`, `EasyBet.png`, `UnidosConstruimosLogo.png`: pesados y probablemente sin uso (la Parte B los borra).

## Cambios en el repo en C0

Solo herramientas: `playwright`, `lighthouse`, `@axe-core/playwright` y `chrome-launcher` como `devDependencies`, y `scripts/medir.mjs` (se reutiliza en C6). No se tocó código del sitio.

## Perfil de Performance en móvil (anexo, traza de Lighthouse)

### Elemento LCP

| Ruta | Elemento LCP | Desglose observado | LCP reportado |
|---|---|---|---|
| `/` | `h1` del hero (`main > section#hero h1`), texto | TTFB 21 ms, **retraso de render 2.327 ms** | 11,0 s |
| `/servicios/landing-page-profesional` | `p.text-white/60.text-xl` del hero de la página | TTFB 9 ms, retraso de render 946 ms | 10,1 s |

Conclusión: el LCP **no es una imagen**. Es texto que tarda en pintarse porque el hero espera a que cargue y ejecute el JS (el `h1` entra con `opacity`/`transform` de Framer Motion) y porque el hilo principal está ocupado. Optimizar imágenes (C1) baja el peso total pero **casi no mueve el LCP**; lo mueven la entrada del hero con CSS (C3), sacar el script bloqueante de partículas y reducir el JS inicial. Nota: el valor de 11 s es el simulado con throttling móvil de Lighthouse; el retraso observado sin simulación es el de la columna del medio.

### Tareas largas que explican el TBT (~2 s en `/`)

| Duración | Cuándo | Origen |
|---|---|---|
| 1.066 ms | 9,5 s | GTM/GA: `gtag/destination?id=G-X1DLK1FW6F` |
| 717 ms | 3,8 s | `index-*.js` propio (hidratación/montaje de la home) |
| 414 ms y 119 ms | 4,5 s y 3,7 s | `index-*.js` propio |
| 576, 573 y 527 ms | 0,8 s, 1,9 s y 1,4 s | Sin atribución (layout, estilos y animaciones: "Style & Layout" suma 1.214 ms) |
| 323 y 138 ms | 5,0 s y 5,3 s | GTM `gtm.js` |

Tiempo de ejecución por script: `index-*.js` propio 3.044 ms (2.029 ms de script), `particles.min.js` 1.475 ms (483 ms de script, sincrónico en el `<head>`), GTM/GA ~1.600 ms entre `gtag/destination` y `gtm.js`. Por categoría: Script Evaluation 3,9 s, Other 3,3 s, Style & Layout 1,2 s.

En `/servicios/landing-page-profesional` el patrón es el mismo pero más chico: 873 ms de GTM, ~1,6 s de tareas sin atribución y el JS propio con tareas de menos de 180 ms.

Lectura: el TBT se reparte en tres. (1) JS propio de la home (un solo chunk, con todas las secciones y animaciones de Framer corriendo al montar). (2) GTM/GA, que está fuera de nuestro control pero se puede retrasar. (3) Partículas y animaciones continuas (marquee, `whileInView`) que fuerzan layout y estilos. Los puntos (1) y (3) se atacan en C1/C3/C4; GTM queda como límite parcial (hay que explicarlo en `auditoria-c6.md` si el TBT no llega a 200 ms).

Nota sobre el prompt: `PROMPT_CLAUDE_CODE_V3.md` se movió a `docs/`. La versión en disco es byte a byte la misma que leí antes (misma fecha de modificación, 206 líneas); no detecté cambios en la Parte B respecto de lo que ya tenía.
