// Prueba el widget de Punto en una matriz de tamaños, cerrado y abierto, y mide las reglas de responsive.
// Uso: node scripts/probar-punto-responsive.mjs [--url=http://localhost:5173] [--capturas=ruta] [--solo-fallas]
// Con --capturas guarda una captura con el panel abierto por tamaño (con --solo-fallas, solo de los que fallan).
// Requiere el sitio sirviéndose (npm run dev) y playwright. Sale con código 1 si algún tamaño falla.
//
// El teclado en pantalla se simula con un window.visualViewport falso que se achica (como en iOS, donde el viewport de
// diseño no cambia pero el visual sí), y además con un cambio real del alto de la ventana (como en Android).
import { chromium } from 'playwright'
import { AxeBuilder } from '@axe-core/playwright'
import fs from 'node:fs'
import path from 'node:path'

const args = Object.fromEntries(process.argv.slice(2).map((a) => a.replace(/^--/, '').split('=')))
const BASE = args.url ?? 'http://localhost:5173'
const CAPTURAS = args.capturas ? path.resolve(args.capturas) : null
const SOLO_FALLAS = 'solo-fallas' in args
if (CAPTURAS) fs.mkdirSync(CAPTURAS, { recursive: true })

// [ancho, alto, nombre, factor de pantalla]. El zoom 200% se emula con la mitad de píxeles CSS y factor 2.
const TAMANOS = [
  [320, 568, 'iPhone SE 1ra gen (320x568)'], [375, 667, 'iPhone 8 (375x667)'], [390, 844, 'iPhone 14 (390x844)'], [412, 915, 'Android grande (412x915)'],
  [640, 900, 'límite de tablet (640x900)'], [768, 1024, 'tablet vertical (768x1024)'], [1024, 768, 'tablet horizontal (1024x768)'], [667, 375, 'celular horizontal (667x375)'], [1440, 900, 'escritorio (1440x900)'],
  [720, 450, 'escritorio 1440x900 con zoom 200% (720x450 CSS)', 2], [512, 384, 'tablet horizontal con zoom 200% (512x384 CSS)', 2],
]

// visualViewport controlable, para simular el teclado sin teclado real.
const FALSO_VV = `(() => {
  const vv = new EventTarget(); const st = { h: null, offsetTop: 0 }
  // Sin simulación, el visual viewport coincide con la ventana (alto vivo, no el del momento en que se creó).
  const props = { height: () => st.h ?? innerHeight, width: () => innerWidth, offsetTop: () => st.offsetTop, offsetLeft: () => 0, scale: () => 1, pageTop: () => 0, pageLeft: () => 0 }
  for (const k of Object.keys(props)) Object.defineProperty(vv, k, { get: props[k] })
  Object.defineProperty(window, 'visualViewport', { get: () => vv, configurable: true })
  window.__vv = (h, top = 0) => { st.h = h; st.offsetTop = top; vv.dispatchEvent(new Event('resize')); vv.dispatchEvent(new Event('scroll')) }
})()`

const medir = () => {
  const vw = innerWidth, vh = innerHeight
  const panel = document.querySelector('[role=dialog]')
  if (!panel) return { sinPanel: true }
  const r = panel.getBoundingClientRect(), cs = getComputedStyle(panel)
  const input = document.querySelector('#punto-input'), ir = input.getBoundingClientRect()
  const arriba = document.elementFromPoint(ir.left + ir.width / 2, ir.top + ir.height / 2)
  const log = document.querySelector('[role=log]'), lcs = getComputedStyle(log)
  const burbuja = log.querySelector(':scope > div > div')
  const fb = document.querySelector('button[aria-label="Abrir el asistente Punto"]')
  const fbr = fb?.getBoundingClientRect()
  const fbVisible = !!fb && fbr.width > 0 && getComputedStyle(fb.parentElement).display !== 'none'
  const desborda = [...panel.querySelectorAll('*')].filter((e) => { const b = e.getBoundingClientRect(); return b.width > 0 && (b.right > r.right + 1 || b.left < r.left - 1) }).map((e) => e.tagName.toLowerCase())
  const objetivos = [...panel.querySelectorAll('button, a[href]')].filter((e) => e.getBoundingClientRect().width > 0)
    .map((e) => ({ t: (e.getAttribute('aria-label') || e.textContent || '').trim().slice(0, 28), w: Math.round(e.getBoundingClientRect().width), h: Math.round(e.getBoundingClientRect().height) })).filter((x) => x.h < 44 || x.w < 44)
  const cerrar = panel.querySelector('button[aria-label="Cerrar el asistente"]')
  const cr = cerrar.getBoundingClientRect(), sobreCerrar = document.elementFromPoint(cr.left + cr.width / 2, cr.top + cr.height / 2)
  const svg = panel.querySelector('svg')
  return {
    vw, vh, pos: cs.position, rect: { top: r.top, left: r.left, right: r.right, bottom: r.bottom, width: r.width, height: r.height },
    inputVisible: ir.width > 0 && ir.top >= 0 && ir.bottom <= vh && ir.left >= 0 && ir.right <= vw && (arriba === input || input.contains(arriba)),
    inputRect: { top: ir.top, bottom: ir.bottom }, inputFont: parseFloat(getComputedStyle(input).fontSize),
    docScrollX: document.documentElement.scrollWidth > vw, desborda: [...new Set(desborda)],
    panelScrollea: panel.scrollHeight > panel.clientHeight + 1,
    logAlto: log.clientHeight, logOverflow: lcs.overflowY, logOverscroll: lcs.overscrollBehaviorY, logMinH: lcs.minHeight,
    burbujaWrap: burbuja ? getComputedStyle(burbuja).overflowWrap : null,
    cerrarTapado: !(sobreCerrar === cerrar || cerrar.contains(sobreCerrar)), objetivos, avatar: svg ? Math.round(svg.getBoundingClientRect().width) : null,
    fb: fb ? { visible: fbVisible, right: vw - fbr.right, bottom: vh - fbr.bottom } : null,
    bloqueoFondo: [getComputedStyle(document.documentElement).overflow, getComputedStyle(document.body).overflow],
  }
}

function evaluar(m, v) {
  const f = []
  if (m.sinPanel) return ['el panel no abrió']
  const corto = m.vh < 500, movil = m.vw < 640
  const dentro = m.rect.top >= -1 && m.rect.left >= -1 && m.rect.right <= m.vw + 1 && m.rect.bottom <= m.vh + 1
  if (!dentro) f.push(`el panel se sale de la pantalla (top ${m.rect.top.toFixed(0)}, bottom ${m.rect.bottom.toFixed(0)}, right ${m.rect.right.toFixed(0)} de ${m.vw}x${m.vh})`)
  if (m.pos !== 'fixed') f.push('el panel no es position: fixed')
  if (corto) {
    if (Math.abs(m.rect.height - (m.vh - 16)) > 2) f.push(`pantalla baja: el panel debe medir 100dvh - 16 = ${m.vh - 16} px y mide ${m.rect.height.toFixed(0)}`)
    if (m.avatar > 52) f.push(`pantalla baja: Punto del encabezado debería medir ~48 px y mide ${m.avatar}`)
  } else if (movil) {
    const alto = Math.min(0.85 * m.vh, m.vh - 24)
    if (Math.abs(m.rect.left) > 1 || Math.abs(m.rect.right - m.vw) > 1) f.push(`celular: la hoja debe ocupar todo el ancho (left ${m.rect.left.toFixed(0)}, right ${m.rect.right.toFixed(0)} de ${m.vw})`)
    if (Math.abs(m.rect.bottom - m.vh) > 1) f.push(`celular: la hoja debe salir de abajo (bottom ${m.rect.bottom.toFixed(0)} de ${m.vh})`)
    if (Math.abs(m.rect.height - alto) > 2) f.push(`celular: el alto debe ser min(85dvh, 100dvh - 24) = ${alto.toFixed(0)} y es ${m.rect.height.toFixed(0)}`)
  } else {
    if (Math.abs(m.vw - m.rect.right - 16) > 1) f.push(`≥640 px: el margen derecho debe ser 16 y es ${(m.vw - m.rect.right).toFixed(0)}`)
    if (m.rect.width > Math.min(380, m.vw - 32) + 1) f.push(`≥640 px: el ancho debe ser min(380, 100vw - 32) = ${Math.min(380, m.vw - 32)} y es ${m.rect.width.toFixed(0)}`)
    if (m.rect.height > Math.min(560, m.vh - 96) + 1) f.push(`≥640 px: el alto debe ser min(560, 100dvh - 96) = ${Math.min(560, m.vh - 96)} y es ${m.rect.height.toFixed(0)}`)
  }
  if (m.cerrarTapado) f.push('el botón de cerrar está tapado por otro elemento (p. ej. el navbar)')
  if (!m.inputVisible) f.push('el campo de texto no está visible (cortado o tapado)')
  if (m.inputFont < 16) f.push(`el campo de texto tiene ${m.inputFont}px (iOS hace zoom por debajo de 16)`)
  if (m.docScrollX) f.push('hay scroll horizontal en la página')
  if (m.desborda.length) f.push('contenido que se sale del panel: ' + m.desborda.join(', '))
  if (m.panelScrollea) f.push('el panel entero scrollea (solo debe scrollear la lista de mensajes)')
  if (m.logAlto < 80) f.push(`la lista de mensajes queda de ${m.logAlto} px (muy chica)`)
  if (!/auto|scroll/.test(m.logOverflow)) f.push('la lista de mensajes no tiene overflow-y: auto')
  if (m.logOverscroll !== 'contain') f.push(`la lista no tiene overscroll-behavior: contain (es ${m.logOverscroll})`)
  if (m.logMinH !== '0px') f.push(`la lista no tiene min-height: 0 (es ${m.logMinH})`)
  if (m.burbujaWrap !== 'anywhere') f.push(`las burbujas no tienen overflow-wrap: anywhere (es ${m.burbujaWrap})`)
  if (m.objetivos.length) f.push('objetivos táctiles menores de 44 px: ' + m.objetivos.map((o) => `"${o.t}" ${o.w}x${o.h}`).join(', '))
  if ((movil || corto) && !m.bloqueoFondo.includes('hidden')) f.push('con el panel abierto el fondo sigue scrolleando (falta bloquear el scroll)')
  if ((movil || corto) && m.fb?.visible) f.push('con el panel abierto el botón flotante sigue visible')
  return f
}

const navegador = await chromium.launch()
let tamanosConFallas = 0
const resumen = []
for (const [w, h, nombre, dsf = 1] of TAMANOS) {
  const ctx = await navegador.newContext({ viewport: { width: w, height: h }, deviceScaleFactor: dsf, isMobile: w < 1100 && dsf === 1, hasTouch: w < 1100 && dsf === 1 })
  await ctx.addInitScript(FALSO_VV)
  const p = await ctx.newPage()
  const errores = []; p.on('pageerror', (e) => errores.push(e.message))
  await p.goto(BASE + '/', { waitUntil: 'load' })
  const boton = p.getByRole('button', { name: 'Abrir el asistente Punto' })
  await boton.waitFor({ timeout: 15000 })
  await p.waitForTimeout(400)
  const fallas = []
  // Cerrado: el botón flotante entero a la vista y con margen de 16 px (o el borde seguro del dispositivo)
  const cerrado = await p.evaluate(() => { const b = document.querySelector('button[aria-label="Abrir el asistente Punto"]').getBoundingClientRect(); return { right: innerWidth - b.right, bottom: innerHeight - b.bottom, w: b.width, h: b.height, enVista: b.left >= 0 && b.top >= 0 && b.right <= innerWidth && b.bottom <= innerHeight } })
  if (!cerrado.enVista) fallas.push('cerrado: el botón flotante se sale de la pantalla')
  if (cerrado.right < 15.5 || cerrado.bottom < 15.5) fallas.push(`cerrado: el botón debe tener 16 px de margen y tiene ${cerrado.right.toFixed(0)} a la derecha y ${cerrado.bottom.toFixed(0)} abajo`)
  if (cerrado.w < 44 || cerrado.h < 44) fallas.push('cerrado: el botón flotante mide menos de 44 px')
  const html = await p.evaluate(() => document.documentElement.scrollWidth > innerWidth)
  if (html) fallas.push('cerrado: hay scroll horizontal en la página')
  // Abierto
  await boton.click(); await p.waitForSelector('[role=dialog]'); await p.waitForTimeout(700)
  // algunos mensajes largos para probar el wrap y el scroll de la lista
  const abierto = await p.evaluate(medir)
  fallas.push(...evaluar(abierto))
  // foco y teclado: el foco entra al panel, Tab no se escapa, Escape cierra
  const enfoque = await p.evaluate(() => document.querySelector('[role=dialog]').contains(document.activeElement))
  if (!enfoque) fallas.push('foco: al abrir, el foco no entra al panel')
  let escapo = false
  for (let i = 0; i < 14; i++) { await p.keyboard.press('Tab'); if (!(await p.evaluate(() => document.querySelector('[role=dialog]')?.contains(document.activeElement)))) { escapo = true; break } }
  if (escapo) fallas.push('foco: con Tab el foco se escapa del panel (falla la trampa de foco)')
  // texto largo sin espacios para probar overflow-wrap
  await p.locator('#punto-input').fill('A'.repeat(60)); await p.getByRole('button', { name: 'Enviar mensaje' }).click(); await p.waitForTimeout(500)
  const largo = await p.evaluate(() => { const l = document.querySelector('[role=log]'); return l.scrollWidth > l.clientWidth + 1 })
  if (largo) fallas.push('un mensaje largo sin espacios hace scroll horizontal en la lista (falta overflow-wrap: anywhere)')
  // teclado en pantalla (iOS): se achica el visual viewport sin cambiar el viewport de diseño
  let tecladoIos = null
  if (w < 640 || h < 500) {
    const alto = Math.round(h * 0.55)
    await p.evaluate((a) => window.__vv(a, 0), alto); await p.waitForTimeout(400)
    tecladoIos = await p.evaluate((a) => { const i = document.querySelector('#punto-input').getBoundingClientRect(), pn = document.querySelector('[role=dialog]').getBoundingClientRect(); return { inputBottom: i.bottom, inputTop: i.top, panelBottom: pn.bottom, panelTop: pn.top, vv: a } }, alto)
    if (tecladoIos.inputBottom > alto + 1 || tecladoIos.inputTop < 0) fallas.push(`teclado (visual viewport de ${alto} px): el campo queda tapado (top ${tecladoIos.inputTop.toFixed(0)}, bottom ${tecladoIos.inputBottom.toFixed(0)})`)
    if (tecladoIos.panelTop < -1) fallas.push(`teclado: el panel se sale por arriba (top ${tecladoIos.panelTop.toFixed(0)})`)
    if (CAPTURAS && (!SOLO_FALLAS || fallas.some((x) => x.startsWith('teclado')))) await p.screenshot({ path: path.join(CAPTURAS, `teclado-ios-${w}x${h}.png`) })
    await p.evaluate(() => window.__vv(null, 0)); await p.waitForTimeout(300)
    // teclado estilo Android: cambia el alto real de la ventana
    await p.setViewportSize({ width: w, height: alto }); await p.waitForTimeout(500)
    const a = await p.evaluate(() => ({ ok: document.querySelector('#punto-input').getBoundingClientRect().bottom <= innerHeight && document.querySelector('#punto-input').getBoundingClientRect().top >= 0 }))
    if (!a.ok) fallas.push(`teclado (ventana de ${alto} px de alto): el campo queda fuera de la pantalla`)
    await p.setViewportSize({ width: w, height: h }); await p.waitForTimeout(300)
  }
  // Escape cierra
  await p.keyboard.press('Escape'); await p.waitForTimeout(500)
  if (await p.getByRole('dialog').count()) fallas.push('Escape no cierra el panel')
  // captura con el panel abierto
  await boton.click().catch(() => {}); await p.waitForSelector('[role=dialog]').catch(() => {}); await p.waitForTimeout(700)
  const falla = fallas.length > 0
  if (CAPTURAS && (!SOLO_FALLAS || falla)) await p.screenshot({ path: path.join(CAPTURAS, `${falla ? 'FALLA-' : ''}abierto-${w}x${h}${dsf > 1 ? '-zoom200' : ''}.png`) })
  // axe con el panel abierto
  const axe = await new AxeBuilder({ page: p }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa']).analyze()
  for (const v of axe.violations) fallas.push(`axe ${v.impact} ${v.id} x${v.nodes.length}: ${v.nodes[0].target.join(' ')}`)
  if (errores.length) fallas.push('errores de página: ' + errores.join(' | '))
  if (fallas.length) tamanosConFallas++
  resumen.push({ nombre, w, h, fallas })
  console.log(`\n${fallas.length ? '✗' : '✓'} ${nombre}${fallas.length ? ` — ${fallas.length} falla(s)` : ''}`)
  for (const x of fallas) console.log('    · ' + x)
  await ctx.close()
}

// Menú móvil del navbar abierto: el botón de Punto debe ocultarse
{
  const ctx = await navegador.newContext({ viewport: { width: 375, height: 667 }, isMobile: true, hasTouch: true })
  const p = await ctx.newPage(); await p.goto(BASE + '/', { waitUntil: 'load' })
  const boton = p.getByRole('button', { name: 'Abrir el asistente Punto' }); await boton.waitFor({ timeout: 15000 })
  await p.getByRole('button', { name: /menú/i }).click(); await p.waitForTimeout(500)
  const visibleConMenu = await boton.isVisible()
  const f = []
  if (visibleConMenu) f.push('con el menú móvil del navbar abierto el botón de Punto sigue visible')
  console.log(`\n${f.length ? '✗' : '✓'} menú móvil abierto (375x667)${f.length ? ' — 1 falla' : ''}`); f.forEach((x) => console.log('    · ' + x))
  if (f.length) { tamanosConFallas++; if (CAPTURAS) await p.screenshot({ path: path.join(CAPTURAS, 'FALLA-menu-movil-abierto.png') }) }
  await ctx.close()
}
await navegador.close()
console.log(`\n${tamanosConFallas ? `✗ ${tamanosConFallas} caso(s) con fallas` : '✓ todos los tamaños cumplen'}`)
fs.writeFileSync(path.join(import.meta.dirname, '..', 'docs', 'capturas', 'punto-responsive-resultado.json'), JSON.stringify(resumen, null, 1)) // se pisa en cada corrida
process.exit(tamanosConFallas ? 1 : 0)
