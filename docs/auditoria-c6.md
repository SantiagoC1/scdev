# Auditoría C6 (cierre)

Medido sobre `npm run build` servido con `node scripts/servir.mjs` (imita a Netlify: HTML prerenderizado, 404 real), Lighthouse con Chromium de Playwright. Cada combinación se corrió 4 veces, **se descarta la primera** y se informa la mediana de las otras 3. JSON en `docs/lighthouse/despues/`. La línea base (C0) es una sola corrida por combinación (`docs/lighthouse/antes/`).

## Lighthouse antes y después

| Ruta | Modo | | Perf | A11y | BP | SEO | LCP | CLS | TBT |
|---|---|---|---|---|---|---|---|---|---|
| `/` | móvil | antes | 41 | 94 | 100 | 100 | 11,0 s | 0,009 | 1.992 ms |
| | | **después** | **70** | **98** | **100** | **100** | **1,4 s** | **0** | **2.431 ms** |
| `/` | escritorio | antes | 84 | 91 | 100 | 100 | 1,9 s | 0,039 | 208 ms |
| | | **después** | **85** | **98** | **100** | **100** | **0,4 s** | **0** | **344 ms** |
| `/servicios/landing-page-profesional` | móvil | antes | 46 | 93 | 100 | 100 | 10,1 s | 0,001 | 2.208 ms |
| | | **después** | **71** | **98** | **100** | **100** | **1,1 s** | **0** | **2.317 ms** |
| `/servicios/landing-page-profesional` | escritorio | antes | 91 | 91 | 100 | 100 | 1,2 s | 0 | 206 ms |
| | | **después** | **84** | **97** | **100** | **100** | **0,3 s** | **0** | **377 ms** |

### Objetivos de la Parte C

| Objetivo | Resultado |
|---|---|
| Accesibilidad 95+ | Cumple (97 a 98). |
| Buenas prácticas 95+ | Cumple (100). |
| SEO 100 | Cumple (100). |
| LCP menor a 2,5 s | Cumple (0,3 s a 1,4 s). Era de 10 a 11 s en móvil. |
| CLS menor a 0,05 | Cumple (0). |
| Performance 90+ | **No se alcanza**: móvil 70 a 71, escritorio 84 a 85. |
| TBT menor a 200 ms | **No se alcanza**: móvil unos 2,4 s, escritorio 344 a 377 ms. |

### Por qué no llegan Performance y TBT

El TBT es de Google Tag Manager y Google Analytics, no del código del sitio. Medido en C5 bloqueando solo GTM/GA (con el resto igual): el TBT móvil bajó a unos 180 ms y Performance subió a unos 81. Con GTM activo, `gtm.js` y `gtag/destination` suman cerca de 1,4 s de tareas largas en el hilo principal. Las tareas largas propias que quedan son la hidratación de React (unos 500 ms de script sin throttling).

En escritorio el TBT subió respecto de C0 (208 a 344 ms y 206 a 377 ms): el prerender sumó la hidratación del HTML completo, y eso pesa más en la landing, donde antes el JS propio era mínimo. A cambio el LCP bajó de 1,2 a 0,3 s. Performance de la landing en escritorio pasó de 91 a 84 por ese TBT.

### Variación entre sesiones

En C5 había medido 75 / 1,2 s / 1.330 ms para la home móvil. Hoy el mismo commit de C5 (construido en un worktree aparte y medido con el mismo método) dio **71 / 1,4 s / 2.340 ms**, igual que C6. O sea que C6 no empeoró nada: el TBT depende de cuánto tarda en ejecutarse GTM/GA en cada sesión, y la diferencia entre sesiones (1,3 s a 2,4 s) es más grande que cualquier cambio de código de estas etapas. Por eso las comparaciones de abajo se hacen siempre dentro de la misma sesión. JSON en `docs/lighthouse/c5-vuelta/`.

## Experimento: GTM diferido

`src/gtm.config.ts` tiene `GTM_DIFERIDO`. Con `true`, el snippet inline sale del HTML (queda solo `window.dataLayer = []`) y GTM se carga después del evento `load` y de `requestIdleCallback` con timeout de 3 s (`src/utils/gtm.ts`). **Queda en `false` por defecto.**

Home móvil, 4 corridas con la primera descartada, misma sesión:

| Variante | Perf (corridas 2 a 4) | LCP | TBT (corridas 2 a 4) |
|---|---|---|---|
| GTM inline (por defecto) | 71 / 70 / 71, mediana **71** | 1,4 s | 2.480 / 2.830 / 2.330, mediana **2.480 ms** |
| **GTM diferido** | 71 / 71 / 70, mediana **71** | 1,4 s | 2.450 / 2.380 / 2.390, mediana **2.390 ms** |
| C5 (valor medido en su momento) | 75 | 1,2 s | 1.330 ms |
| C5 (mismo commit, vuelto a medir hoy) | 71 | 1,4 s | 2.340 ms |

Lectura:
- En Lighthouse **no hay diferencia**: Performance igual (71) y TBT 90 ms menor, dentro del ruido (las corridas de la misma variante varían más de 300 ms). Lighthouse sigue midiendo hasta que la red se aquieta, y GTM cargado después de `load` cae dentro de esa ventana.
- Funciona como se diseñó: `load` a los 183 ms, `gtm.js` se pide a los 467 ms, el `dataLayer` recibe `gtm.js` y los eventos previos se procesan (están en el array).
- El beneficio posible es de usuarios reales (GTM deja de competir con la carga inicial), pero no lo puedo medir con Lighthouse. El costo es que las conversiones de Google Ads y los eventos de las primeras fracciones de segundo dependen de que GTM cargue (hasta 3 s después del `load`); si alguien abre el formulario y lo envía antes, el evento queda en el `dataLayer` y se procesa cuando GTM llega.
- Recomendación: dejarlo apagado. No mejora lo medible y agrega un riesgo mínimo sobre las conversiones. JSON en `docs/lighthouse/gtm-diferido/` y `docs/lighthouse/default-sesion/`.

## JS (gzip)

| | C0 | C6 |
|---|---|---|
| Chunk inicial `index-*.js` | 130,8 KB (413 KB sin comprimir) | **116,2 KB** (358 KB sin comprimir) |
| CSS | 8,2 KB | 9,9 KB |

El chunk inicial es 11% menor que el de C0 (el límite que fijó la Parte C). Todo lo que está bajo el hero carga con `lazy()`.

## Accesibilidad y navegación (`node scripts/auditoria.mjs`)

- **axe** (WCAG 2.0/2.1 A y AA) a 375 y 1440 en las 7 rutas válidas y en la 404: **0 violaciones** en las 16 combinaciones.
- **Scroll horizontal a 320 px**: 0 px de exceso en las 8 rutas (recorridas de arriba abajo, con las secciones lazy ya cargadas).
- **Solo teclado**: el primer foco es "Saltar al contenido"; con Tab se recorren 89 elementos enfocables, todos con indicador de foco visible (anillo de 2 px) y se llega a Servicios, Trabajos, Nosotros, Preguntas, Contacto, Formulario, el selector del hero, el botón del panel, "Ver qué incluye", "Consultar planes" y "Conocer al equipo". Las flechas mueven el selector de rubro, Enter y Espacio abren y cierran el FAQ (`<details>`), el modal atrapa el foco, Escape lo cierra y el foco vuelve al botón "Formulario".

## Rutas, prerender y SEO

- `SearchAction` eliminado del JSON-LD del `WebSite` (0 apariciones en `index.html` y en todos los HTML de `dist/`).
- Prerender de las 7 rutas válidas (`/`, `/nosotros`, 5 servicios) más `404.html` con `noindex`. El build falla si una ruta válida queda sin HTML o sin `<h1>`. La lista sale de una sola tabla (`PAGINAS` en `src/App.tsx`).
- `netlify.toml`: `/* /404.html 404`. Una ruta inexistente devuelve 404 con la página de error; las válidas devuelven 200. `public/_redirects` se eliminó.
- Precios: el build lee el Sheet (timeout de 8 s, con fallback) y genera el HTML y el JSON-LD con esos valores. Probado con un Sheet simulado en `price_esencial_min = 90000`: el HTML y el `Offer` salieron con 90.000. Probado con URL inválida y con un servidor que no responde: usa el fallback y avisa en el log. Cómo disparar un rebuild: ver el README (build hook de Netlify).
- Eventos `cta_whatsapp_click` verificados en `dataLayer`: servicio (`servicio`, 2 links), footer (`footer`) y modal (`modal`), además de hero y navbar.

## Verificación de build

`npm run build` (incluye `tsc`) y `npx tsc --noEmit` terminan sin errores.

## Pendiente que no depende del código

Ver `docs/pendientes.md`: stack por persona, logo real de Padejimas, Perfil de Empresa de Google, condiciones nuevas a confirmar y el valor de `price_esencial_min` del Sheet (hoy devuelve 80000).
