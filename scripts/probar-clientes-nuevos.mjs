// Verifica la franja y las cards de Deca y Diputados: sin scroll horizontal, logos legibles (44 px de alto), axe y capturas.
// Uso: node scripts/probar-clientes-nuevos.mjs [--url=http://localhost:4175] [--capturas=docs/capturas/deca-diputados]
import { chromium } from 'playwright'
import { AxeBuilder } from '@axe-core/playwright'
const args = Object.fromEntries(process.argv.slice(2).map((a) => a.replace(/^--/, '').split('=')))
const BASE = args.url ?? 'http://localhost:4175'
let fallos = 0
const ok = (n, c, d = '') => { if (!c) fallos++; console.log(`  ${c ? '✓' : '✗'} ${n}${d ? '  ' + d : ''}`) }
const nav = await chromium.launch()
for (const [w, h] of [[320, 640], [375, 812], [768, 1024], [1440, 900]]) {
  console.log(`— ${w}x${h} —`)
  const ctx = await nav.newContext({ viewport: { width: w, height: h } })
  const page = await ctx.newPage()
  await page.goto(BASE + '/', { waitUntil: 'networkidle' })
  await page.locator('#trabajos').scrollIntoViewIfNeeded()
  await page.waitForTimeout(600)
  const m = await page.evaluate(() => {
    const logos = [...document.querySelectorAll('#trabajos img[alt="Deca Electromecánica"], #trabajos img[alt="Diputados Bonaerenses"]')]
      .filter((i) => !i.closest('[aria-hidden=true]') && !/captura/.test(i.src))
    return {
      scrollX: document.documentElement.scrollWidth - document.documentElement.clientWidth,
      logos: logos.map((i) => ({ alt: i.alt, alto: Math.round(i.getBoundingClientRect().height), ok: i.complete && i.naturalWidth > 0 })),
      cards: [...document.querySelectorAll('#trabajos img')].filter((i) => /deca-captura|diputados-captura/.test(i.currentSrc || i.src)).map((i) => ({ src: (i.currentSrc || i.src).split('/').pop(), ok: i.complete && i.naturalWidth > 0 })),
    }
  })
  ok('sin scroll horizontal', m.scrollX <= 0, `(${m.scrollX} px)`)
  ok('logos de Deca y Diputados en la franja a 44 px', m.logos.length >= 2 && m.logos.every((l) => l.alto === 44 && l.ok), JSON.stringify(m.logos))
  ok('las dos cards nuevas cargan su imagen', m.cards.length === 2 && m.cards.every((c) => c.ok), JSON.stringify(m.cards))
  const r = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa']).analyze()
  ok('axe 0 violaciones', r.violations.length === 0, r.violations.map((v) => v.id).join(','))
  if (args.capturas) await page.locator('#trabajos').screenshot({ path: `${args.capturas}/trabajos-${w}.png` })
  await ctx.close()
}
await nav.close()
console.log(fallos ? `\n✗ ${fallos} fallo(s)` : '\n✓ todo bien')
process.exit(fallos ? 1 : 0)
