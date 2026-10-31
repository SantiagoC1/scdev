// Auditoría de cierre: axe en todas las rutas, scroll horizontal a 320 px y navegación solo con teclado.
// Uso: node scripts/auditoria.mjs   (con dist/ servido en localhost:4173: node scripts/servir.mjs)
import { chromium } from 'playwright'
import { AxeBuilder } from '@axe-core/playwright'

const BASE = process.env.BASE_URL ?? 'http://localhost:4173'
const RUTAS = ['/', '/nosotros', '/servicios/presencia-web-esencial', '/servicios/landing-page-profesional', '/servicios/sitio-web-corporativo', '/servicios/sistema-a-medida', '/servicios/automatizacion-whatsapp', '/ruta-que-no-existe']
const browser = await chromium.launch()
let fallas = 0
const falla = (msg) => { fallas++; console.log('  ✗', msg) }

// 1) axe (WCAG 2.0/2.1 A y AA) a 375 y 1440
console.log('— axe')
for (const [w, h] of [[375, 812], [1440, 900]]) {
  for (const ruta of RUTAS) {
    const ctx = await browser.newContext({ viewport: { width: w, height: h } })
    const page = await ctx.newPage()
    await page.goto(BASE + ruta, { waitUntil: 'networkidle' })
    await page.waitForTimeout(600)
    const r = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa']).analyze()
    const graves = r.violations
    console.log(`  [${w}] ${ruta}: ${graves.length} violaciones`)
    graves.forEach((v) => falla(`${v.impact} ${v.id} ${v.nodes[0].target.join(' ')}`))
    await ctx.close()
  }
}

// 2) sin scroll horizontal a 320 px
console.log('— scroll horizontal a 320 px')
for (const ruta of RUTAS) {
  const ctx = await browser.newContext({ viewport: { width: 320, height: 640 } })
  const page = await ctx.newPage()
  await page.goto(BASE + ruta, { waitUntil: 'networkidle' })
  const H = await page.evaluate(() => document.body.scrollHeight)
  for (let y = 0; y < H; y += 600) { await page.evaluate((y) => scrollTo(0, y), y); await page.waitForTimeout(80) }
  const exceso = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth)
  console.log(`  ${ruta}: exceso ${exceso}px`)
  if (exceso > 0) falla(`${ruta} tiene scroll horizontal (${exceso}px)`)
  await ctx.close()
}

// 3) teclado: recorrido con Tab, foco visible, FAQ, selector del hero, modal
console.log('— teclado (solo Tab, flechas, Enter, Espacio y Escape)')
{
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } })
  const page = await ctx.newPage()
  await page.goto(BASE + '/', { waitUntil: 'networkidle' })
  await page.waitForTimeout(800)

  const descripcion = () => page.evaluate(() => {
    const e = document.activeElement
    if (!e || e === document.body) return null
    const cs = getComputedStyle(e)
    const visible = (cs.outlineStyle !== 'none' && parseFloat(cs.outlineWidth) >= 2) || (cs.boxShadow && cs.boxShadow !== 'none')
    const r = e.getBoundingClientRect()
    return { tag: e.tagName.toLowerCase(), texto: (e.getAttribute('aria-label') || e.textContent || '').trim().replace(/\s+/g, ' ').slice(0, 40), visible, enPantalla: r.width > 0 && r.height > 0 }
  })

  const vistos = []
  let sinFoco = 0
  for (let i = 0; i < 90; i++) {
    await page.keyboard.press('Tab')
    const d = await descripcion()
    if (!d) { sinFoco++; if (sinFoco > 2) break; continue }
    vistos.push(d)
    if (!d.visible) falla(`sin indicador de foco: <${d.tag}> "${d.texto}"`)
  }
  console.log(`  ${vistos.length} elementos enfocables recorridos; primero: "${vistos[0]?.texto}"`)
  if (!/saltar/i.test(vistos[0]?.texto ?? '')) falla('el primer foco no es "Saltar al contenido"')
  const necesarios = [/Servicios/, /Trabajos/, /Nosotros/, /Preguntas/, /Contacto/, /Formulario/, /Oficios/, /Pedir esta web/, /incluye/, /Consultar planes/, /Conocer al equipo/]
  for (const re of necesarios) if (!vistos.some((v) => re.test(v.texto))) falla(`no se llegó con Tab a: ${re}`)

  // selector del hero: flechas
  await page.goto(BASE + '/', { waitUntil: 'networkidle' })
  await page.getByRole('radio', { name: 'Oficios' }).focus()
  await page.keyboard.press('ArrowRight'); await page.keyboard.press('ArrowRight')
  const marcado = await page.evaluate(() => document.querySelector('[role=radio][aria-checked=true]')?.textContent)
  console.log(`  selector del hero con flechas → "${marcado}"`)
  if (marcado !== 'Comercio y gastronomía') falla('las flechas no mueven el selector')

  // FAQ: Enter y Espacio abren y cierran
  await page.locator('#preguntas summary').first().focus()
  await page.keyboard.press('Enter')
  const abierta1 = await page.evaluate(() => document.querySelector('#preguntas details').open)
  await page.keyboard.press('Space')
  const abierta2 = await page.evaluate(() => document.querySelector('#preguntas details').open)
  console.log(`  FAQ: Enter abre=${abierta1}, Espacio cierra=${!abierta2}`)
  if (!abierta1 || abierta2) falla('el <details> del FAQ no responde a Enter/Espacio')

  // modal: abre con Enter, atrapa el foco, Escape cierra y devuelve el foco
  await page.evaluate(() => scrollTo(0, 0))
  const boton = page.getByRole('button', { name: 'Formulario' }).first()
  await boton.focus(); await page.keyboard.press('Enter')
  await page.waitForSelector('[role=dialog]')
  const dentro = []
  for (let i = 0; i < 40; i++) {
    await page.keyboard.press('Tab')
    dentro.push(await page.evaluate(() => !!document.activeElement?.closest('[role=dialog]')))
  }
  console.log(`  modal: foco siempre dentro del diálogo = ${dentro.every(Boolean)}`)
  if (!dentro.every(Boolean)) falla('el foco se escapa del modal')
  await page.keyboard.press('Escape')
  await page.waitForTimeout(300)
  const cerrado = (await page.locator('[role=dialog]').count()) === 0
  const vuelta = await page.evaluate(() => document.activeElement?.textContent?.trim())
  console.log(`  modal: Escape cierra=${cerrado}, foco vuelve a "${vuelta}"`)
  if (!cerrado) falla('Escape no cierra el modal')
  if (vuelta !== 'Formulario') falla('el foco no vuelve al botón que abrió el modal')
  await ctx.close()
}

await browser.close()
console.log(fallas === 0 ? '\n✓ Auditoría sin fallas' : `\n✗ ${fallas} falla(s)`)
process.exitCode = fallas === 0 ? 0 : 1
