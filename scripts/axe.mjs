// Corre axe sobre las rutas principales y el modal de contacto. Uso: node scripts/axe.mjs
import { chromium } from 'playwright'
import { AxeBuilder } from '@axe-core/playwright'

const BASE = process.env.BASE_URL ?? 'http://localhost:4173'
const browser = await chromium.launch()
let total = 0
for (const [w, h] of [[375, 812], [1440, 900]]) {
  for (const ruta of ['/', '/nosotros', '/servicios/landing-page-profesional']) {
    const ctx = await browser.newContext({ viewport: { width: w, height: h } })
    const page = await ctx.newPage()
    await page.goto(BASE + ruta, { waitUntil: 'networkidle' })
    await page.waitForTimeout(800)
    const r = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa']).analyze()
    for (const v of r.violations) {
      total++
      console.log(`[${w}] ${ruta} ${v.impact} ${v.id} x${v.nodes.length}: ${v.nodes[0].target.join(' ')}`)
    }
    if (ruta === '/') {
      await page.evaluate(() => window.scrollTo(0, 0))
      const abrir = page.getByRole('button', { name: /contactar|cotizar|empezar/i }).first()
      if (await abrir.count()) {
        await abrir.click()
        await page.waitForTimeout(400)
        const m = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa']).analyze()
        for (const v of m.violations) { total++; console.log(`[${w}] MODAL ${v.impact} ${v.id} x${v.nodes.length}: ${v.nodes[0].target.join(' ')}`) }
      }
    }
    await ctx.close()
  }
}
await browser.close()
console.log('violaciones:', total)
