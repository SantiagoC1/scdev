// Prueba los planes de mantenimiento en celular (pestañas + tarjeta) y que el escritorio no cambió.
// Uso: node scripts/probar-mantenimiento-mobile.mjs [--url=http://localhost:5173] [--capturas=ruta]
// Requiere el sitio sirviéndose (npm run dev). Sale con código 1 si algo falla.
import { chromium } from 'playwright'
import { AxeBuilder } from '@axe-core/playwright'
import fs from 'node:fs'
import path from 'node:path'

const args = Object.fromEntries(process.argv.slice(2).map((a) => a.replace(/^--/, '').split('=')))
const BASE = args.url ?? 'http://localhost:5173'
const CAPTURAS = args.capturas ? path.resolve(args.capturas) : null
if (CAPTURAS) fs.mkdirSync(CAPTURAS, { recursive: true })

const PLANES = ['Básico', 'Estándar', 'Pro']
let fallos = 0
const ok = (nombre, cond, detalle = '') => {
  if (!cond) fallos++
  console.log(`  ${cond ? '✓' : '✗'} ${nombre}${detalle ? '  ' + detalle : ''}`)
}
const navegador = await chromium.launch()
const bloque = (p) => p.getByRole('heading', { name: 'Mantenimiento mensual' }).locator('..')

console.log('— Celular (< 768 px): pestañas y tarjeta —')
for (const [w, h] of [[320, 640], [375, 667], [390, 844], [412, 915], [767, 1024]]) {
  console.log(`\n${w}x${h}`)
  const ctx = await navegador.newContext({ viewport: { width: w, height: h }, isMobile: true, hasTouch: true })
  await ctx.route(/wa\.me/, (r) => r.fulfill({ status: 200, contentType: 'text/html', body: 'wa' }))
  const p = await ctx.newPage()
  await p.goto(BASE + '/', { waitUntil: 'networkidle' })
  const b = bloque(p); await b.scrollIntoViewIfNeeded(); await p.waitForTimeout(500)
  const tabs = p.getByRole('tab')
  ok('3 pestañas', (await tabs.count()) === 3)
  ok('tablist con nombre accesible', (await p.getByRole('tablist', { name: 'Planes de mantenimiento mensual' }).count()) === 1)
  ok('preseleccionado el recomendado (Estándar)', (await tabs.nth(1).getAttribute('aria-selected')) === 'true' && (await tabs.nth(0).getAttribute('aria-selected')) === 'false')
  const alturas = []
  for (let i = 0; i < 3; i++) {
    await tabs.nth(i).click(); await p.waitForTimeout(260)
    const info = await p.evaluate(() => {
      const visibles = [...document.querySelectorAll('[role=tabpanel]')].filter((e) => getComputedStyle(e).visibility !== 'hidden')
      const t = [...document.querySelectorAll('[role=tab]')].map((e) => e.getBoundingClientRect())
      const cont = document.querySelector('[role=tabpanel]').parentElement.getBoundingClientRect()
      return { visibles: visibles.length, texto: visibles[0]?.innerText ?? '', altoCont: Math.round(cont.height), tabMin: Math.min(...t.map((r) => Math.min(r.width, r.height))), sx: document.documentElement.scrollWidth > innerWidth }
    })
    alturas.push(info.altoCont)
    ok(`pestaña ${PLANES[i]}: una sola tarjeta visible`, info.visibles === 1)
    ok(`pestaña ${PLANES[i]}: sin scroll horizontal`, !info.sx)
    ok(`pestaña ${PLANES[i]}: objetivos táctiles de 44 px o más`, info.tabMin >= 44, `(mínimo ${info.tabMin})`)
    ok(`pestaña ${PLANES[i]}: muestra el nombre y "por mes"`, info.texto.includes(PLANES[i]) && info.texto.includes('por mes'))
    if (i === 1) ok('Estándar: "Recomendado" y la frase "2 cambios de contenido por mes"', info.texto.includes('Recomendado') && info.texto.includes('2 cambios de contenido por mes'))
    if (i === 2) ok('Pro: "Cambios de contenido ilimitados"', info.texto.includes('Cambios de contenido ilimitados'))
    if (i === 0) ok('Básico: lo que no incluye está para lectores de pantalla ("No incluye:")', (await p.locator('[role=tabpanel][data-activo=true] .sr-only', { hasText: 'No incluye' }).count()) >= 4)
    if (CAPTURAS) await b.screenshot({ path: path.join(CAPTURAS, `${w}-${PLANES[i].toLowerCase().replace('á', 'a')}.png`) })
  }
  ok('la altura no salta al cambiar de plan', new Set(alturas).size === 1, `(${alturas.join(' / ')} px)`)
  // teclado
  await tabs.nth(1).click(); await tabs.nth(1).focus()
  await p.keyboard.press('ArrowRight'); await p.waitForTimeout(250)
  ok('flecha derecha: pasa a Pro y mueve el foco', (await tabs.nth(2).getAttribute('aria-selected')) === 'true' && (await p.evaluate(() => document.activeElement?.getAttribute('id'))) === 'mant-tab-pro')
  await p.keyboard.press('ArrowRight'); await p.waitForTimeout(250)
  ok('flecha derecha desde el último: vuelve a Básico', (await tabs.nth(0).getAttribute('aria-selected')) === 'true')
  await p.keyboard.press('ArrowLeft'); await p.waitForTimeout(250)
  ok('flecha izquierda desde el primero: va a Pro', (await tabs.nth(2).getAttribute('aria-selected')) === 'true')
  await p.keyboard.press('Home'); await p.waitForTimeout(200); const home = (await tabs.nth(0).getAttribute('aria-selected')) === 'true'
  await p.keyboard.press('End'); await p.waitForTimeout(200)
  ok('Inicio y Fin van a los extremos', home && (await tabs.nth(2).getAttribute('aria-selected')) === 'true')
  const rov = await p.evaluate(() => [...document.querySelectorAll('[role=tab]')].map((e) => e.tabIndex))
  ok('foco itinerante: solo la pestaña activa está en el orden de Tab', rov.filter((x) => x === 0).length === 1 && rov.filter((x) => x === -1).length === 2, rov.join(','))
  await p.keyboard.press('Tab')
  ok('Tab desde la pestaña va al botón de WhatsApp de la tarjeta', (await p.evaluate(() => document.activeElement?.tagName + ':' + (document.activeElement?.textContent ?? ''))).includes('A:Consultar el plan Pro'))
  const foco = await p.evaluate(() => { const t = document.querySelector('[role=tab]'); t.focus(); const cs = getComputedStyle(t); return { outline: cs.outlineStyle, ancho: cs.outlineWidth } })
  ok('foco visible en la pestaña', foco.outline !== 'none' && parseFloat(foco.ancho) >= 2, JSON.stringify(foco))
  // WhatsApp: mensaje con el nombre del plan y evento de GTM de siempre
  await tabs.nth(1).click(); await p.waitForTimeout(260)
  const enlace = p.locator('[role=tabpanel][data-activo=true] a')
  const href = decodeURIComponent((await enlace.getAttribute('href')) ?? '')
  ok('WhatsApp con el nombre del plan', href.includes('plan de mantenimiento mensual Estándar'), href.slice(href.indexOf('text=')))
  await p.evaluate(() => { window.dataLayer = window.dataLayer ?? []; window.__n = window.dataLayer.length })
  const [popup] = await Promise.all([ctx.waitForEvent('page'), enlace.click()]); await popup.close()
  const ev = await p.evaluate(() => window.dataLayer.slice(window.__n).filter((e) => e.event === 'cta_whatsapp_click'))
  ok('evento cta_whatsapp_click con location "mantenimiento"', ev.length === 1 && ev[0].location === 'mantenimiento', JSON.stringify(ev))
  // axe
  const axe = await new AxeBuilder({ page: p }).include('#servicios').withTags(['wcag2a', 'wcag2aa', 'wcag21aa']).analyze()
  ok('axe sin violaciones en la sección', axe.violations.length === 0, axe.violations.map((v) => `${v.id} x${v.nodes.length}`).join(', '))
  await ctx.close()
}

console.log('\n— prefers-reduced-motion —')
{
  const ctx = await navegador.newContext({ viewport: { width: 375, height: 667 }, isMobile: true, hasTouch: true, reducedMotion: 'reduce' })
  const p = await ctx.newPage(); await p.goto(BASE + '/', { waitUntil: 'networkidle' })
  await bloque(p).scrollIntoViewIfNeeded()
  const d = await p.evaluate(() => parseFloat(getComputedStyle(document.querySelector('.mant-panel')).transitionDuration) * 1000)
  ok('con movimiento reducido el cambio es instantáneo', d < 1, `(${d} ms)`)
  await ctx.close()
  const ctx2 = await navegador.newContext({ viewport: { width: 375, height: 667 }, isMobile: true, hasTouch: true })
  const p2 = await ctx2.newPage(); await p2.goto(BASE + '/', { waitUntil: 'networkidle' })
  const d2 = await p2.evaluate(() => parseFloat(getComputedStyle(document.querySelector('[role=tabpanel][data-activo=true]')).transitionDuration) * 1000)
  ok('sin preferencia, el cross-fade dura 150 ms', Math.round(d2) === 150, `(${d2} ms)`)
  await ctx2.close()
}

console.log('\n— Tablet y escritorio (≥ 768 px): la tabla sigue y las pestañas no se ven —')
for (const [w, h] of [[768, 1024], [1024, 768], [1440, 900]]) {
  const ctx = await navegador.newContext({ viewport: { width: w, height: h } })
  const p = await ctx.newPage(); await p.goto(BASE + '/', { waitUntil: 'networkidle' })
  const b = bloque(p); await b.scrollIntoViewIfNeeded(); await p.waitForTimeout(500)
  const m = await p.evaluate(() => ({ tabla: !!document.querySelector('#servicios table') && document.querySelector('#servicios table').getBoundingClientRect().width > 0, tablist: document.querySelector('[role=tablist]').getBoundingClientRect().width > 0, cta: [...document.querySelectorAll('#servicios a')].some((a) => a.textContent.trim() === 'Consultar planes' && a.getBoundingClientRect().width > 0) }))
  ok(`${w}x${h}: tabla visible, pestañas ocultas, botón "Consultar planes"`, m.tabla && !m.tablist && m.cta, JSON.stringify(m))
  if (CAPTURAS) await b.screenshot({ path: path.join(CAPTURAS, `escritorio-${w}.png`) })
  await ctx.close()
}
await navegador.close()
console.log(fallos ? `\n✗ ${fallos} chequeo(s) fallaron` : '\n✓ todo bien')
process.exit(fallos ? 1 : 0)
