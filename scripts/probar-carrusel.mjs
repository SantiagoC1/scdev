// Pruebas funcionales del carrusel de Trabajos. Uso: node scripts/probar-carrusel.mjs [--url=http://localhost:4175]
// Requiere el build servido (npm run build && node scripts/servir.mjs 4175). Sale con código 1 si algo falla.
import { chromium } from 'playwright'
import { AxeBuilder } from '@axe-core/playwright'

const args = Object.fromEntries(process.argv.slice(2).map((a) => a.replace(/^--/, '').split('=')))
const BASE = args.url ?? 'http://localhost:4175'
let fallos = 0
const ok = (nombre, cond, detalle = '') => {
  if (!cond) fallos++
  console.log(`  ${cond ? '✓' : '✗'} ${nombre}${detalle ? '  ' + detalle : ''}`)
}
const dormir = (ms) => new Promise((r) => setTimeout(r, ms))
const navegador = await chromium.launch()
const sl = (p) => p.evaluate(() => document.querySelector('#trabajos [role=region]').scrollLeft)

console.log('— Escritorio (1440x900) —')
{
  const ctx = await navegador.newContext({ viewport: { width: 1440, height: 900 } })
  await ctx.route(/tabanocultura\.org|vercel\.app|somosbalance|adsumpater|unidosconstruimos|scdev\.com\.ar\/?$/, (r) => r.fulfill({ status: 200, contentType: 'text/html', body: 'sitio externo' }))
  const p = await ctx.newPage(); const errores = []; p.on('pageerror', (e) => errores.push(e.message))
  await p.goto(BASE + '/', { waitUntil: 'networkidle' })
  const carril = p.getByRole('region', { name: 'Trabajos' })
  await carril.evaluate((el) => el.scrollIntoView({ block: 'center' })); await dormir(800)
  // imágenes
  const imgs = await p.evaluate(() => [...document.querySelectorAll('#trabajos [role=region] img')].map((i) => ({ lazy: i.loading, srcset: i.srcset, sizes: i.sizes, w: i.getAttribute('width'), h: i.getAttribute('height'), dec: i.decoding })))
  ok('las dos primeras imágenes son eager y el resto lazy', imgs[0].lazy === 'eager' && imgs[1].lazy === 'eager' && imgs.slice(2).every((i) => i.lazy === 'lazy'), imgs.map((i) => i.lazy[0]).join(''))
  ok('todas con width, height y decoding async', imgs.every((i) => i.w && i.h && i.dec === 'async'))
  ok('todas con srcset de variantes 480/960', imgs.every((i) => /-480\.webp 480w/.test(i.srcset)) , imgs[0].srcset.slice(0, 90))
  const usadas = await p.evaluate(() => [...document.querySelectorAll('#trabajos [role=region] img')].filter((i) => i.complete && i.naturalWidth).map((i) => i.currentSrc.split('/').pop() + ' ' + i.naturalWidth))
  ok('el navegador elige variantes de 480 a 960 px (no la de 1600)', usadas.length > 0 && usadas.every((u) => Number(u.split(' ')[1]) <= 960), usadas.join(' | '))
  // flechas
  const prev = p.getByRole('button', { name: 'Ver trabajos anteriores' }), sig = p.getByRole('button', { name: 'Ver trabajos siguientes' })
  ok('al inicio: "anterior" desactivada y "siguiente" activa', (await prev.isDisabled()) && !(await sig.isDisabled()))
  const s0 = await sl(p); await sig.click(); await dormir(900)
  const s1 = await sl(p)
  ok('flecha siguiente avanza una tarjeta (~502 px)', s1 - s0 > 400 && s1 - s0 < 600, `(${Math.round(s1 - s0)} px)`)
  ok('tras avanzar, "anterior" se activa', !(await prev.isDisabled()))
  for (let i = 0; i < 8; i++) { if (await sig.isDisabled()) break; await sig.click(); await dormir(700) }
  ok('en el último, "siguiente" se desactiva', await sig.isDisabled())
  for (let i = 0; i < 9; i++) { if (await prev.isDisabled()) break; await prev.click(); await dormir(700) }
  ok('de vuelta al primero, "anterior" se desactiva', await prev.isDisabled())
  // teclado
  await carril.focus(); const k0 = await sl(p); await p.keyboard.press('ArrowRight'); await dormir(400)
  ok('con el teclado (flecha derecha) el carrusel avanza', (await sl(p)) > k0)
  // arrastre con mouse
  const caja = await carril.boundingBox(); const y = caja.y + 120
  const antes = await sl(p)
  await p.mouse.move(900, y); await p.mouse.down()
  for (let i = 1; i <= 12; i++) { await p.mouse.move(900 - i * 30, y); await dormir(8) }
  const marcaDurante = await carril.evaluate((el) => el.dataset.arrastrando)
  await p.mouse.up(); await dormir(900)
  const despues = await sl(p)
  ok('arrastrar con el mouse mueve el carrusel', despues - antes > 300, `(${Math.round(despues - antes)} px, con inercia)`)
  ok('durante el arrastre las cards no reciben el puntero (data-arrastrando)', marcaDurante === 'true')
  await dormir(2500) // la inercia dura ~1,5 s; recién al detenerse se restaura el snap
  ok('al terminar la inercia se quita data-arrastrando y se restaura el snap', (await carril.evaluate((el) => el.dataset.arrastrando === undefined && el.style.scrollSnapType === '')))
  // el arrastre no abre el link; el clic sin arrastre sí
  const paginas0 = ctx.pages().length
  const tarjeta = p.locator('#trabajos a[href^="https"]').first(); const tb = await tarjeta.boundingBox()
  await carril.evaluate((el) => (el.scrollLeft = 0)); await dormir(600)
  const tb2 = await tarjeta.boundingBox()
  await p.mouse.move(tb2.x + tb2.width / 2, tb2.y + tb2.height / 2); await p.mouse.down()
  for (let i = 1; i <= 8; i++) { await p.mouse.move(tb2.x + tb2.width / 2 - i * 12, tb2.y + tb2.height / 2); await dormir(8) }
  await p.mouse.up(); await dormir(700)
  ok('un arrastre que termina sobre el link NO abre la pestaña', ctx.pages().length === paginas0)
  await carril.evaluate((el) => (el.scrollLeft = 0)); await dormir(700)
  const tb3 = await tarjeta.boundingBox()
  const [popup] = await Promise.all([ctx.waitForEvent('page', { timeout: 4000 }).catch(() => null), tarjeta.click({ position: { x: tb3.width / 2, y: tb3.height / 2 } })])
  ok('un clic normal sobre el link sí abre la pestaña nueva', !!popup)
  ok('el link abre en pestaña nueva con rel noopener noreferrer', (await tarjeta.getAttribute('target')) === '_blank' && (await tarjeta.getAttribute('rel')) === 'noopener noreferrer')
  ok('sin scroll horizontal de página', !(await p.evaluate(() => document.documentElement.scrollWidth > innerWidth)))
  ok('sin errores de página', errores.length === 0, errores.join(' | '))
  const axe = await new AxeBuilder({ page: p }).include('#trabajos').withTags(['wcag2a', 'wcag2aa', 'wcag21aa']).analyze()
  ok('axe sin violaciones en Trabajos', axe.violations.length === 0, axe.violations.map((v) => `${v.id} x${v.nodes.length}`).join(', '))
  await ctx.close()
}

console.log('\n— Movimiento reducido —')
{
  const ctx = await navegador.newContext({ viewport: { width: 1440, height: 900 }, reducedMotion: 'reduce' })
  const p = await ctx.newPage(); await p.goto(BASE + '/', { waitUntil: 'networkidle' })
  const carril = p.getByRole('region', { name: 'Trabajos' }); await carril.evaluate((el) => el.scrollIntoView({ block: 'center' })); await dormir(600)
  const caja = await carril.boundingBox(); const y = caja.y + 120
  await p.mouse.move(900, y); await p.mouse.down(); for (let i = 1; i <= 10; i++) { await p.mouse.move(900 - i * 30, y); await dormir(8) }
  await p.mouse.up(); await dormir(120)
  const a = await sl(p); await dormir(500); const b = await sl(p)
  ok('sin inercia: tras soltar el carrusel no sigue corriendo', Math.abs(b - a) < 60, `(${Math.round(b - a)} px en 500 ms; solo el acomodo del snap)`)
  await ctx.close()
}

console.log('\n— Celular (375x667, touch) —')
{
  const ctx = await navegador.newContext({ viewport: { width: 375, height: 667 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true })
  const p = await ctx.newPage(); await p.goto(BASE + '/', { waitUntil: 'networkidle' })
  const carril = p.getByRole('region', { name: 'Trabajos' }); await carril.evaluate((el) => el.scrollIntoView({ block: 'center' })); await dormir(800)
  const est = await carril.evaluate((el) => { const c = getComputedStyle(el); return { snap: c.scrollSnapType, ob: c.overscrollBehaviorX } })
  // proximity es el valor por defecto: el navegador lo serializa solo como "x" (mandatory saldría como "x mandatory").
  ok('snap proximity (no mandatory) y overscroll-behavior-x contain', /^x( proximity)?$/.test(est.snap) && est.ob === 'contain', JSON.stringify(est))
  ok('las flechas no se muestran en celular', !(await p.getByRole('button', { name: 'Ver trabajos siguientes' }).isVisible()))
  const caja = await carril.boundingBox(); const y = Math.round(caja.y + 100); const cdp = await ctx.newCDPSession(p)
  await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x: 330, y }] })
  for (let i = 1; i <= 14; i++) { await cdp.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x: 330 - (270 * i) / 14, y }] }); await dormir(12) }
  await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] }); await dormir(1000)
  ok('deslizar con el dedo mueve el carrusel (scroll nativo)', (await sl(p)) > 150, `(${Math.round(await sl(p))} px)`)
  ok('sin scroll horizontal de página', !(await p.evaluate(() => document.documentElement.scrollWidth > innerWidth)))
  await ctx.close()
}
await navegador.close()
console.log(fallos ? `\n✗ ${fallos} chequeo(s) fallaron` : '\n✓ todo bien')
process.exit(fallos ? 1 : 0)
