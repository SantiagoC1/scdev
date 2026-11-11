# Cierre C2 (sacar lo que suena a plantilla)

## 1. Chunk inicial de JS (gzip)

| Estado | Bytes |
|---|---|
| C0 (línea base) | 130.794 |
| Fin de C1 | 131.643 |
| Tras `LazyMotion` (`domAnimation`, `m.*`, `MotionConfig reducedMotion="user"`) | 119.475 |
| Fin de C2 | **118.998** (11,8 KB por debajo de C0) |

## 2. Rendimiento de la home, mediana de 3 corridas (`scripts/medir.mjs`, `MEDIR_REPS=3`)

La caída de 84 a 81 en escritorio **no era una regresión**: el propio estado de C0 midió 75, 82 y 83 en tres corridas.

| Estado | Escritorio perf (corridas) | Escritorio TBT | Móvil perf | Móvil LCP | Móvil TBT |
|---|---|---|---|---|---|
| C0, 3 corridas (worktree) | **82** [75, 82, 83] | 251 ms | (una corrida: 41) | 11,0 s | 1.990 ms |
| Tras C1 + LazyMotion | **86** [85, 86, 88] | 258 ms | | | |
| Tras preload de fuentes | **86** [88, 81, 86] | 283 ms | **53** [50, 54, 53] | 5,4 s | 1.819 ms |
| Fin de C2 | **85** [85, 75, 86] | 284 ms | **51** [49, 52, 51] | 5,5 s | 2.195 ms |

Lectura honesta: en escritorio la mediana pasó de 82 a 85-86, con TBT equivalente (251 a 284 ms, dentro de la dispersión entre corridas: 242 a 460). En móvil el LCP bajó de 11,0 s a ~5,5 s, pero **el TBT móvil no mejora**: ~1.800 a 2.200 ms. Entre el paso de fuentes y el cierre de C2 subió de 1.819 a 2.195 ms y los rangos de las corridas no se solapan (1.656 a 1.941 contra 2.010 a 2.281). No identifiqué la causa. Lo que sé: C2 solo quitó animaciones de entrada y cambió estilos, y el hero (typewriter con `setState` cada 100 ms más partículas) y GTM siguen intactos. Lo reviso en C3, cuando se reescribe el hero. GTM no se tocó, como pediste.

## 3. Fuentes (perfil de la home)

- **`font-display`**: las 18 declaraciones `@font-face` de `@fontsource` ya llevan `font-display: swap`. No hay que cambiar nada.
- **Subsets**: funcionan por `unicode-range`. Solo se descarga `latin` (`greek`/`latin-ext` no se piden). Los acentos del español están en `latin`.
- **Pesos descargados en la home**: 5 archivos woff2 (~14 KB c/u): DM Sans 400 y 500, Syne 600, 700 y 800. `Syne 800` entra por `font-black` en el CTA final y la página `/nosotros`; DM Sans 300 y Syne 400 no se piden. No consolidé pesos para no cambiar el aspecto; quitar Syne 800 ahorraría ~14 KB pero adelgaza el titular del CTA final.
- **Problema real**: las fuentes se pedían a los ~370 ms, después de que React renderiza el `h1` (el HTML no trae texto), o sea en cascada detrás del JS.
- **Cambio**: `<link rel="preload" as="font" crossorigin>` en `index.html` para Syne 700 (peso del `h1`) y DM Sans 400 (texto base). Vite reescribe las rutas con hash en el build. Efecto medido: el CLS de la home en escritorio bajó de **0,039 a 0,006** en las tres corridas (el desplazamiento era el cambio de fuente en el hero). La mediana de rendimiento no cambió.
- Cuando exista prerender (C5) el HTML traerá el texto, así que las fuentes se descubrirán al parsear el CSS; el preload seguirá sirviendo para adelantarlas.

## 4. Qué se hizo en C2

- **Etiquetas con forma de código**: en este repo ya no existían `About.load() → Ready`, `Services.load()…`, `terminalLabel` ni el badge `SCdev.init()` (el prompt los daba por presentes). Lo único que quedaba era `— Hablemos` (eliminado) y el prompt `>` del typewriter del hero (eliminado). También se sacó `font-mono` de las etiquetas de sección y badges.
- **Flechas `→`**: se mantienen en el CTA principal (`Empezar proyecto →`) y en links a otra página (`Conocé al equipo →`, `Ver más →` de servicio y de proyecto). Se sacaron de `Enviar mensaje` y `Consultar planes` (abre WhatsApp).
- **Titulares en blanco**: sin palabras rojas en `Hero`, `CtaFinal` y `/nosotros`. El rojo quedó en botones, precios (ahora en rojo claro en las cards y en la página de servicio) y foco.
- **Animaciones**: eliminado el fade-up de entrada de todas las secciones, de `/nosotros`, de las páginas de servicio, de `EquipoCard`, y el contador animado de Nosotros (muestra los números finales). Se mantienen: hover (`whileHover` en las cards y botones del CTA, `hover:scale` en los íconos de stack), menú móvil, apertura del modal (fade/scale de 180 ms por CSS) y el `<details>` del FAQ. Siguen sin tocar el hero (se reescribe en C3) y el marquee de clientes (se elimina en C4). Se agregó un `@media (prefers-reduced-motion)` global.
- **Radios y sombras**: solo 8 px (`rounded-lg`) para controles/chips/badges y 16 px (`rounded-2xl`) para contenedores. Sin sombras salvo el modal. `rounded-full` quedó solo en círculos reales (spinner y puntos).
- **Foco**: anillo de 2 px con `--color-accent-text` y offset de 2 px en todo lo interactivo (`:focus-visible` global; se sacó `focus:outline-none` de los inputs del modal). Link "Saltar al contenido" como primer tab stop; `<main id="contenido">` en las tres plantillas.

## 5. Regresión que introduje y corregí

El paso de `LazyMotion` con `domAnimation` rompió en silencio el arrastre del carrusel de Proyectos (`drag` es de `domMax` y TypeScript no avisa). Se reemplazó por scroll nativo con `scroll-snap` y arrastre por puntero (se desactiva el snap mientras se arrastra, se evita el arrastre nativo de imágenes y el click tras arrastrar no abre la card). Verificado en navegador. Es además accesible por teclado (región enfocable) y funciona con touch sin código extra.

## 6. Verificación

- `tsc` limpio, build OK.
- axe (WCAG 2 A/AA): **0 violaciones** en `/`, `/nosotros` y `/servicios/landing-page-profesional`, a 375 y 1440, y con el modal abierto. Al quitar los fade-ups axe empezó a medir textos que antes estaban a opacidad 0 y aparecieron dos fallas reales, ya corregidas: los números de paso (`/20` → `/70`) y un párrafo `text-white/80` sobre fondo rojo (→ `text-white`).
- Sin scroll horizontal a 320 px. Sin errores de consola.
- Capturas en `docs/capturas/c2/`.

## 7. Limpieza y archivos

- `LogoCompletoFN.png` y `LogoChicoFN.png` pasaron a `scripts/fuentes/`; `generar-og.mjs` y `optimizar-imagenes.mjs` leen de ahí. (El prompt decía que `optimizar-imagenes.mjs` lee `LogoCompletoFN`; en realidad lo lee `generar-og.mjs`, y `optimizar-imagenes.mjs` lee `LogoChicoFN`. Moví ambas fuentes.)
- Borrados sin referencias: `Bplay.png`, `EasyBet.png`, `LogoSoloPalabraFN.png`, `LogoSoloPalabraFB.png`.
- **Se conservan** sin uso en el sitio: `UnidosConstruimos.png` (esperando tu confirmación), `LogoCompletoFB/HorizontalFB/ChicoFB.png` (los menciona el prompt para la sección clara de C4) y `SantaigoCaceres.png`, `AgustinMazzoni.png`, `EzequielWeber.png`, `lucasFernandez.jpeg`, `UnidosConstruimosLogo.png`, porque `scripts/resize-team-photos.mjs` los lee como fuente.
