# Cierre C1 (bugs y peso)

Medido con `scripts/medir.mjs` sobre `npm run build && npm run preview`. JSON en `docs/lighthouse/c1/` (la línea base está en `docs/lighthouse/antes/`). Es una sola corrida por ruta y Lighthouse tiene varianza, así que las diferencias chicas (por ejemplo TBT en escritorio) no son concluyentes.

## Antes / después

| Ruta | Modo | Perf | A11y | LCP | CLS | TBT |
|---|---|---|---|---|---|---|
| `/` | móvil | 41 → **51** | 94 → **98** | 11,0 s → **6,4 s** | 0,009 → 0,008 | 1.990 → 1.580 ms |
| `/` | escritorio | 84 → 81 | 91 → **97** | 1,9 s → **1,3 s** | 0,039 → 0,039 | 210 → 360 ms |
| `/servicios/landing-page-profesional` | móvil | 46 → **77** | 93 → **98** | 10,1 s → **0,8 s** | 0,001 → 0,012 | 2.210 → 1.130 ms |
| `/servicios/landing-page-profesional` | escritorio | 91 → **98** | 91 → **97** | 1,2 s → **0,2 s** | 0 → 0,001 | 210 → 130 ms |

Buenas prácticas y SEO siguen en 100.

## Chunk inicial de JS (gzip)

| | Antes (C0) | Después (C1) |
|---|---|---|
| `index-*.js` | 130.794 B | **131.643 B** (+849 B, +0,6 %) |

**Está 0,8 KB por encima de C0.** Viene del código nuevo del `ContactModal` (trampa de foco, radiogroup con flechas) y de `ParticlesBackground`. C1 no tenía como objetivo bajarlo y el límite se exige en C6. Lo recupero con `LazyMotion` + `m.*` (pedido en las reglas de trabajo), con la eliminación del marquee y de las secciones duplicadas en C4, y con la carga lazy de las secciones bajo el hero.

## Qué se hizo

- **Logos rotos.** Causa: no había 404. `loading="lazy"` dentro del marquee con `transform`, más logos de ~1 MB. Se quitó `lazy` en el marquee y los logos pasaron a WebP de 512 px (5 a 35 KB). Verificado en navegador: los 4 logos cargan.
- **Imágenes.** `scripts/optimizar-imagenes.mjs`: `AdsumPater` 2.051 → 58 KB, `balance` 431 → 34 KB, `Scdev` 413 → 37 KB, `campusfit` 196 → 15 KB, `LogoCompletoHorizontalFN` (Navbar y Footer) 1.004 → 19 KB, logos de clientes 78-145 → 5-35 KB. Ninguna imagen de contenido supera 60 KB. Se borraron los PNG reemplazados. Todos los `<img>` propios tienen `width` y `height`.
- **Partículas.** Ya no están en el `<head>`. Se inyectan desde `ParticlesBackground` tras `requestIdleCallback`, solo con `innerWidth >= 768` y sin `prefers-reduced-motion`; máximo 40; pausa por `IntersectionObserver`; se destruyen al desmontar.
- **`index.html`.** `charset` y viewport antes de GTM; sin `preconnect` a Google Fonts.
- **OG.** `public/images/og-scdev.jpg` 1200×630, 40 KB (`scripts/generar-og.mjs`), usada en `index.html` y `PageMeta` (se agregó `og:image` y `twitter:image` a `PageMeta`, que antes no los tenía). Favicons `favicon-32/180/512.png` (0,7 / 7 / 31 KB) en lugar del PNG de 862 KB. El JSON-LD usa `favicon-512.png` como `logo` y la OG como `image`.
- **Contraste.** `--color-accent-text: #FF6B6B` y reemplazo de todo `text-[#D32F2F]`. Ningún texto menor a 12 px. Además, el texto secundario con `text-white/20` a `/40` (19 usos) subió a `/60`, porque axe lo marcaba como falla de contraste. axe (WCAG 2 A/AA): **0 violaciones** en `/`, `/nosotros` y `/servicios/landing-page-profesional`, a 375 y 1440, y con el modal abierto (`scripts/axe.mjs`). También se hizo enfocable la región con scroll horizontal de `/nosotros`.
- **`ContactModal`.** Labels con `htmlFor`/`id`; foco inicial en Nombre; trampa de foco; retorno del foco al botón que abrió; el overlay ya no es un tab stop; `radiogroup` con `role="radio"`, `aria-checked`, `aria-label`, tabindex móvil y flechas; precio sacado de la opción de Presencia Web; `console.log` del payload eliminados (y el de la config, que ahora solo corre en desarrollo).

## Cosas que el prompt daba por hechas y no coincidían

- `DrPadegimas.png` **sí** estaba en `public/images`; no había problema de nombre ni mayúsculas.
- El `<div>` "vacío con salto de línea" sobre el título del modal no existía como tal: era un `<div>` que envolvía solo al `<h2>`. Se lo quitó.
- `dataLayer.push({ event: 'form_submission', form_name: 'contacto_scdev', servicio })` **ya existía** tras el `fetch`, con los tres campos. Se dejó como estaba. Solo se dispara cuando el `fetch` no lanza error; como el envío es `no-cors`, no distingue una respuesta fallida del servidor.

## Cambios visuales mínimos (inevitables)

El rojo de texto es ahora un rojo más claro (`#FF6B6B`) y el texto secundario es algo más brillante. Es lo que exige el contraste. Nada más cambió de aspecto.

## Pendiente de decisión

- `LogoCompletoFN.png` se usa como fuente de `generar-og.mjs`, y la Parte B pide borrarlo. Si se borra, la OG ya generada sigue funcionando, pero `generar-og.mjs` deja de poder correrse (se puede mover el original a `docs/` o a otra carpeta de fuentes).
- Siguen en `public/images` pero sin uso en el sitio: PNG de fotos del equipo (5-7,6 MB cada uno, ya existen sus `.webp`), `UnidosConstruimos.png` (2,6 MB), variantes `LogoCompleto*`/`LogoChicoFB`/`LogoSolo*` y `lucasFernandez.jpeg`. No cargan en el navegador pero se publican. No los borré porque no estaban en el alcance de C1 ni en la lista de la Parte B.
