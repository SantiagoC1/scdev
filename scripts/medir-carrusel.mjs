// Mide la fluidez del carrusel de Trabajos con una traza de rendimiento y CPU 4x más lenta.
// Uso: node scripts/medir-carrusel.mjs [--url=http://localhost:4175] [--salida=ruta.json]
// Requiere el build servido (npm run build && node scripts/servir.mjs 4175). Dos escenarios: celular emulado (deslizar con
// gestos táctiles reales por CDP) y escritorio (arrastrar con el mouse). Mide: duración de cuadros (rAF), tareas largas,
// tiempo de scripting / layout / paint / decodificación de imágenes (de la traza), peso de las imágenes del carrusel y
// cuánto avanza cada gesto (efecto del scroll-snap).
// Opciones: --solo=movil|escritorio  --ablar=hover|snap|imgs   (experimentos: apagar el hover, apagar el snap, o servir las imágenes
// del carrusel reescaladas a 960 px de ancho, para ver cuánto pesa cada hipótesis).
import { chromium } from 'playwright'
import fs from 'node:fs'
import path from 'node:path'
import sharp from 'sharp'

const args = Object.fromEntries(process.argv.slice(2).map((a) => a.replace(/^--/, '').split('=')))
const BASE = args.url ?? 'http://localhost:4175'
const dormir = (ms) => new Promise((r) => setTimeout(r, ms))
const pct = (arr, q) => { const s = [...arr].sort((a, b) => a - b); return s.length ? s[Math.min(s.length - 1, Math.floor(q * s.length))] : 0 }

const INSTRUMENTO = `(() => {
  window.__m = { cuadros: [], tareas: [], laf: [] }
  let t0 = null
  const bucle = (t) => { if (window.__m.on) { if (t0 !== null) window.__m.cuadros.push(t - t0); t0 = t } else t0 = null; requestAnimationFrame(bucle) }
  requestAnimationFrame(bucle)
  try { new PerformanceObserver((l) => { for (const e of l.getEntries()) if (window.__m.on) window.__m.tareas.push(e.duration) }).observe({ type: 'longtask', buffered: false }) } catch {}
  try { new PerformanceObserver((l) => { for (const e of l.getEntries()) if (window.__m.on) window.__m.laf.push({ d: e.duration, s: e.scripts?.reduce((a, x) => a + x.duration, 0) ?? 0 }) }).observe({ type: 'long-animation-frame', buffered: false }) } catch {}
})()`

const ABLAR = args.ablar ?? ''
async function escenario(nombre, opciones, gestos) {
  const navegador = await chromium.launch()
  const ctx = await navegador.newContext(opciones)
  const p = await ctx.newPage()
  const imagenes = []
  p.on('response', async (r) => { if (/\.(webp|png|jpe?g)$/.test(r.url()) && /\/images\//.test(r.url())) imagenes.push({ url: r.url().split('/').pop(), bytes: Number((await r.allHeaders())['content-length'] ?? 0) }) })
  await ctx.addInitScript(INSTRUMENTO)
  if (ABLAR === 'imgs') {
    await ctx.route(/\/images\/.*\.webp$/, async (route) => {
      const archivo = path.join('dist', new URL(route.request().url()).pathname)
      if (!/captura|Unidos|balance|Scdev|AdsumPater|campusfit/.test(archivo)) return route.continue()
      const cuerpo = await sharp(archivo).resize({ width: 960, withoutEnlargement: true }).webp({ quality: 78 }).toBuffer()
      route.fulfill({ status: 200, contentType: 'image/webp', body: cuerpo })
    })
  }
  const cdp = await ctx.newCDPSession(p)
  await cdp.send('Emulation.setCPUThrottlingRate', { rate: 4 })
  await p.goto(BASE + '/', { waitUntil: 'networkidle' })
  const carril = p.getByRole('region', { name: 'Trabajos' })
  await carril.evaluate((el) => el.scrollIntoView({ block: 'center' })); await dormir(1500)
  if (ABLAR === 'hover') await p.addStyleTag({ content: '#trabajos img{transition:none!important;transform:none!important} #trabajos .group{transition:none!important}' })
  if (ABLAR === 'proximity') await p.addStyleTag({ content: '#trabajos [role=region]{scroll-snap-type:x proximity!important}' })
  if (ABLAR === 'snap') await p.addStyleTag({ content: '#trabajos [role=region]{scroll-snap-type:none!important}' })
  const caja = await carril.boundingBox()
  const x = caja.x + caja.width / 2, y = caja.y + Math.min(150, caja.height / 2) // dentro de la pantalla
  // imágenes del carrusel: tamaño del archivo, tamaño natural y tamaño mostrado
  const imgs = await p.evaluate(() => [...document.querySelectorAll('#trabajos [role=region] img')].map((i) => ({ src: i.getAttribute('src'), natural: `${i.naturalWidth}x${i.naturalHeight}`, mostrada: `${Math.round(i.getBoundingClientRect().width)}x${Math.round(i.getBoundingClientRect().height)}`, lazy: i.loading, srcset: !!i.srcset, completa: i.complete })))
  const desplazamientos = []
  await navegador.startTracing(p, { categories: ['devtools.timeline', 'disabled-by-default-devtools.timeline', 'v8.execute', 'blink', 'cc'] })
  await p.evaluate(() => { window.__m.on = true })
  for (const g of gestos) {
    const antes = await p.evaluate(() => document.querySelector('#trabajos [role=region]').scrollLeft)
    const t0 = Date.now()
    await g({ p, cdp, x, y })
    // espera a que el scroll se asiente
    let prev = -1, quieto = 0
    while (quieto < 4 && Date.now() - t0 < 4000) { await dormir(60); const s = await p.evaluate(() => document.querySelector('#trabajos [role=region]').scrollLeft); quieto = s === prev ? quieto + 1 : 0; prev = s }
    desplazamientos.push({ px: Math.round(prev - antes), ms: Date.now() - t0 })
  }
  await p.evaluate(() => { window.__m.on = false })
  const traza = JSON.parse((await navegador.stopTracing()).toString())
  const m = await p.evaluate(() => window.__m)
  // la traza: suma de duraciones por nombre de evento (solo eventos completos 'X' con duración)
  const total = {}, porEvento = {}
  for (const e of traza.traceEvents ?? traza) {
    if (e.ph !== 'X' || !e.dur) continue
    total[e.name] = (total[e.name] ?? 0) + e.dur / 1000
    if (e.name === 'EventDispatch') { const tipo = e.args?.data?.type ?? '?'; porEvento[tipo] = (porEvento[tipo] ?? 0) + e.dur / 1000 }
  }
  const ms = (...n) => Math.round(n.reduce((a, k) => a + (total[k] ?? 0), 0))
  const cuadros = m.cuadros
  const r = {
    escenario: nombre,
    cuadros: { n: cuadros.length, p50: +pct(cuadros, 0.5).toFixed(1), p95: +pct(cuadros, 0.95).toFixed(1), max: +Math.max(0, ...cuadros).toFixed(0), mayores33: cuadros.filter((c) => c > 33.4).length, mayores50: cuadros.filter((c) => c > 50).length },
    tareasLargas: { n: m.tareas.length, totalMs: Math.round(m.tareas.reduce((a, b) => a + b, 0)), maxMs: Math.round(Math.max(0, ...m.tareas)) },
    longAnimationFrames: { n: m.laf.length, scriptMs: Math.round(m.laf.reduce((a, b) => a + b.s, 0)) },
    traza: { scriptingMs: ms('FunctionCall', 'EvaluateScript'), eventosMs: ms('EventDispatch'), layoutMs: ms('Layout', 'UpdateLayoutTree'), paintMs: ms('Paint', 'PrePaint', 'Layerize', 'Commit'), decodificarImagenMs: ms('Decode Image', 'ImageDecodeTask', 'Decode LazyPixelRef'), rasterMs: ms('RasterTask') },
    eventosPorTipo: Object.fromEntries(Object.entries(porEvento).filter(([, v]) => v >= 5).map(([k, v]) => [k, Math.round(v)])),
    gestos: desplazamientos,
    imagenes: imgs,
    pesoImagenesKB: Math.round(imgs.reduce((a, i) => a + (ABLAR === 'imgs' ? 0 : (fs.existsSync(path.join('dist', i.src)) ? fs.statSync(path.join('dist', i.src)).size : 0)), 0) / 1024),
    pesoPorImagenKB: Object.fromEntries(imgs.map((i) => [path.basename(i.src), fs.existsSync(path.join('dist', i.src)) ? Math.round(fs.statSync(path.join('dist', i.src)).size / 1024) : 0])),
  }
  await navegador.close()
  return r
}

// Gestos: 6 hacia adelante y 6 hacia atrás. Con --gesto=fling el dedo se mueve rápido (8 pasos de 5 ms): un deslizamiento fuerte.
const RAPIDO = args.gesto === 'fling'
// Deslizar con el dedo: eventos táctiles reales por CDP (apoyar, mover en 14 pasos de 12 ms, soltar). dx < 0 = hacia adelante.
const tactil = (dx) => async ({ cdp, y }) => {
  const x0 = dx < 0 ? 330 : 60, x1 = dx < 0 ? 60 : 330
  await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x: x0, y }] })
  const pasos = RAPIDO ? 8 : 14, dt = RAPIDO ? 5 : 12
  for (let i = 1; i <= pasos; i++) { await cdp.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x: x0 + ((x1 - x0) * i) / pasos, y }] }); await dormir(dt) }
  await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] })
}
const mouse = (dx) => async ({ p, x, y }) => {
  await p.mouse.move(x, y); await p.mouse.down()
  const pasos = 20
  for (let i = 1; i <= pasos; i++) { await p.mouse.move(x + (dx * i) / pasos, y); await dormir(14) }
  await p.mouse.up()
}
const serie = (g) => [...Array(6).fill(-420), ...Array(6).fill(420)].map((d) => g(d))

const resultados = []
if (args.solo !== 'escritorio') resultados.push(await escenario('celular emulado (375x667, touch, CPU 4x)', { viewport: { width: 375, height: 667 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true }, serie(tactil)))
if (args.solo !== 'movil') resultados.push(await escenario('escritorio (1440x900, mouse, CPU 4x)', { viewport: { width: 1440, height: 900 } }, serie(mouse)))
for (const r of resultados) {
  console.log(`\n== ${r.escenario}`)
  console.log(`cuadros (rAF, ${r.cuadros.n}): mediana ${r.cuadros.p50} ms, p95 ${r.cuadros.p95} ms, máx ${r.cuadros.max} ms; >33 ms: ${r.cuadros.mayores33}; >50 ms: ${r.cuadros.mayores50}`)
  console.log(`tareas largas: ${r.tareasLargas.n} (total ${r.tareasLargas.totalMs} ms, máx ${r.tareasLargas.maxMs} ms) | long-animation-frames: ${r.longAnimationFrames.n} (scripts ${r.longAnimationFrames.scriptMs} ms)`)
  console.log(`traza: scripting ${r.traza.scriptingMs} ms, eventos ${r.traza.eventosMs} ms, layout ${r.traza.layoutMs} ms, paint/layerize ${r.traza.paintMs} ms, decodificar imágenes ${r.traza.decodificarImagenMs} ms, raster ${r.traza.rasterMs} ms`)
  console.log(`eventos por tipo (ms): ${JSON.stringify(r.eventosPorTipo)}`)
  console.log(`gestos (avance px / tiempo ms): ${r.gestos.map((g) => `${g.px}/${g.ms}`).join('  ')}`)
  console.log(`imágenes: ${r.imagenes.map((i) => `${i.src.split('/').pop()} ${i.natural}→${i.mostrada}${i.lazy === 'lazy' ? ' lazy' : ''}${i.srcset ? ' srcset' : ''}`).join(' | ')}`)
  console.log(`peso de las imágenes del carrusel en disco: ${r.pesoImagenesKB} KB ${JSON.stringify(r.pesoPorImagenKB)}`)
}
if (args.salida) fs.writeFileSync(args.salida, JSON.stringify(resultados, null, 1))
