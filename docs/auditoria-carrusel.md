# Carrusel de Trabajos: diagnóstico y arreglos

Medido con `scripts/medir-carrusel.mjs` sobre el build de producción servido con `scripts/servir.mjs`, con **CPU 4 veces más lenta** (CDP `Emulation.setCPUThrottlingRate`) y una traza de rendimiento (`devtools.timeline`) durante 12 gestos: 6 hacia adelante y 6 hacia atrás. Dos escenarios: celular emulado (375×667, touch, eventos táctiles reales por CDP) y escritorio (1440×900, arrastre con mouse). Las comparaciones de escritorio son la **mediana de 3 corridas**: una sola corrida engaña, porque el escritorio mostró un comportamiento bimodal (corridas "pesadas" con ~100 cuadros largos y corridas "livianas" con ~25).

Pruebas funcionales: `node scripts/probar-carrusel.mjs` (26 verificaciones, pasan todas). Videos del arrastre: `docs/capturas/carrusel/`.

## Diagnóstico, hipótesis por hipótesis (código anterior)

| Hipótesis | Evidencia | Veredicto |
|---|---|---|
| **Transiciones de hover mientras se arrastra** | Las corridas pesadas son las que disparan `transitionrun` (la card tenía `transition-all` y la imagen `scale-105` con 500 ms). Apagando solo el hover, la mediana de cuadros de más de 33 ms baja de **101 a 11**, el paint de 14,1 s a 3,5 s y el raster de 7,9 s a 5,4 s. | **Causa principal en escritorio.** |
| Imágenes grandes decodificándose | Las 7 imágenes pesan 382 KB y se muestran a 478×299 px (317×198 en celular) pero son de hasta 1600×1000, sin `srcset` y todas `lazy`. Decodificación: ~760 ms por sesión de arrastre. Servidas a 960 px bajan a ~360 ms, pero solas no mejoran los cuadros largos. | Costo real y fácil de evitar, secundario. |
| Trabajo de JS en `pointermove` | `pointermove` 498 ms + `mousemove` 342 ms en los 12 arrastres a CPU 4x (handler de React que escribe `scrollLeft` en cada evento). En celular el scroll es nativo: `touchmove` suma 75 ms en total. | Moderado en escritorio; en celular no hay JS en el camino. |
| `scroll-snap-mandatory` que "frena" | Apagar el snap no mejora los cuadros largos de escritorio (90 contra 101 de la base). En celular el emulador **no genera inercia táctil real** (los eventos CDP no producen velocidad de suelta): con snap mandatory, proximity o ninguno el avance por gesto fue el mismo. | **No se pudo medir.** Se pasó a `proximity` por la guía, sin evidencia numérica de mejora. |
| Arrastre con mouse peleando con el snap | El snap se apagaba al soltar y volvía de golpe, sin inercia. | Mala sensación, no un costo de CPU. |
| Hilo principal en celular | Cuadros (rAF) con mediana y p95 de 16,7 ms, máximo 83 ms, 2 cuadros de más de 50 ms; sin tareas largas durante el gesto. | **El celular no se traba por JS.** |

## Qué se cambió y por qué

1. **Hover barato y sin hover mientras se arrastra.** La card pasa de `transition-all` a `transition-colors`; la imagen crece 3% solo en dispositivos con hover real (`@media (hover: hover)`), con una transición de `transform` y `will-change` únicamente durante el hover. Mientras dura el arrastre (`data-arrastrando`) las cards no reciben el puntero y la imagen no se anima.
2. **Imágenes con `srcset`.** `scripts/optimizar-imagenes.mjs` genera `-480.webp` y `-960.webp` (los mostrados son 317 y 478 px, o el doble en pantallas de alta densidad); `sizes="(max-width: 639px) 85vw, 480px"`. Las dos primeras cards cargan `eager` y el resto `lazy`; todas con `width`, `height` y `decoding="async"`. Opt-in por proyecto con `anchoImagen` en `portfolio.ts`. Peso de lo que se pide: 382 KB → 143 KB (Tábano: 173 → 48 KB).
3. **Arrastre con mouse.** Un solo handler de `pointermove` en `window` (pasivo, solo escribe en una ref), `scrollLeft` escrito una vez por cuadro con `requestAnimationFrame`, sin lecturas de layout, velocidad de suelta calculada con timestamps y snap apagado durante el arrastre. Al soltar, el destino de la inercia (velocidad × 325 ms) se calcula una vez y lo anima el navegador con `scrollTo({ behavior: 'smooth' })`; el snap se reactiva al final. Un arrastre no dispara el click del link. Cursor `grab` / `grabbing`.
4. **Scroll nativo en celular y teclado.** `scroll-snap-type: x proximity`, `scroll-snap-stop: normal` y `overscroll-behavior-x: contain`. En touch no hay JS en el camino; los listeners de rueda y toque son pasivos.
5. **Flechas** anterior y siguiente (desde 768 px) con `scrollBy` smooth, `auto` con `prefers-reduced-motion`, desactivadas en los extremos (detectadas con `IntersectionObserver`, sin listener de scroll). Con movimiento reducido tampoco hay inercia.

### Por qué la inercia la anima el navegador y no un bucle de `rAF`

Se probaron las dos. La inercia por `rAF` (escribir `scrollLeft` en cada cuadro) mejoró los cuadros largos, pero el raster se **triplicó** (≈23 s contra ≈8 s; por cada 1.000 px recorridos, de ~1,7 s a ~5,1 s) porque cada escritura de `scrollLeft` en el hilo principal rasteriza tiles nuevos. Con `scrollTo` smooth el movimiento va por el compositor y el raster vuelve al nivel de antes (~1,4 s por cada 1.000 px). Quedó esa.

## Antes y después

Escritorio, CPU 4x, 12 arrastres (4.512 px recorridos en todos los casos). Medianas de 3 corridas; entre paréntesis, las corridas individuales.

| | Antes | `rAF` (descartada) | Final |
|---|---|---|---|
| Cuadros de más de 33 ms | 101 (113/27/101) | 34 | **43** (40/44/43) |
| Cuadros de más de 50 ms | 18 (21/7/18) | 6 | **2** (1/2/2) |
| Cuadro más largo | 150 / 117 / 133 ms | 67 ms | **50 / 67 / 67 ms** |
| Tareas largas en el gesto | 6 a 11 (526 a 876 ms) | 6 a 7 | **0 a 2 (0 a 104 ms)** |
| Decodificar imágenes | 745 a 775 ms | 115 a 121 ms | **56 a 59 ms** |
| Layout | 1.389 a 1.457 ms | 1.903 a 1.957 ms | **956 a 970 ms** |
| Eventos | 1.363 a 1.443 ms | 1.605 a 1.628 ms | **863 a 882 ms** |
| Raster por cada 1.000 px | 1,7 a 2,3 s | 5,1 a 5,8 s | **1,2 a 1,5 s** |
| Imágenes que se piden | 382 KB | | **143 KB** |

Celular emulado, CPU 4x, 12 gestos táctiles: cuadros de más de 33 ms 2 → 0 a 1; de más de 50 ms 2 → 0; cuadro más largo 83 → 33 ms; decodificación de imágenes 160 → ~92 ms. Sin tareas largas ni antes ni después.

Lighthouse móvil de la home, 3 corridas alternadas en la misma sesión contra `feat/punto`: **antes** performance 74, LCP 1,26 s, CLS ≈0, TBT 1.457 ms; **después** 74, 1,27 s, ≈0, 1.488 ms. No empeora LCP ni CLS (el último valor registrado en `docs/auditoria-c6.md` era 70 / 1,4 s / 0 / 2.431 ms, en otra sesión).

## Lo que no se pudo medir

- La inercia táctil real: el emulador no genera velocidad de suelta, así que no hay números del efecto de `mandatory` contra `proximity` en celular. Conviene probarlo en un teléfono.
- Las mediciones son con CPU 4x en un Chromium de escritorio, no en un dispositivo real.
