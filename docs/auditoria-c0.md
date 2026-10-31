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
