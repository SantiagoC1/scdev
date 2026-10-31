// Mide Lighthouse (móvil y escritorio) y saca capturas. Uso: node scripts/medir.mjs <carpeta-lh> [--capturas <carpeta>]
import { launch } from 'chrome-launcher'
import lighthouse from 'lighthouse'
import { chromium } from 'playwright'
import fs from 'node:fs'

const BASE = process.env.BASE_URL ?? 'http://localhost:4173'
const RUTAS = ['/', '/servicios/landing-page-profesional']
const outDir = process.argv[2]
const capIdx = process.argv.indexOf('--capturas')
const capDir = capIdx > 0 ? process.argv[capIdx + 1] : null

if (outDir) {
  fs.mkdirSync(outDir, { recursive: true })
  const chrome = await launch({
    chromePath: chromium.executablePath(),
    chromeFlags: ['--headless=new', '--no-sandbox'],
  })
  for (const ruta of RUTAS) {
    for (const modo of ['mobile', 'desktop']) {
      const flags = { port: chrome.port, output: 'json', logLevel: 'error' }
      const config = modo === 'desktop' ? { extends: 'lighthouse:default', settings: { formFactor: 'desktop', screenEmulation: { mobile: false, width: 1350, height: 940, deviceScaleFactor: 1, disabled: false }, throttling: { rttMs: 40, throughputKbps: 10240, cpuSlowdownMultiplier: 1 } } } : undefined
      const r = await lighthouse(BASE + ruta, flags, config)
      const nombre = `${ruta === '/' ? 'home' : 'landing'}-${modo}.json`
      fs.writeFileSync(`${outDir}/${nombre}`, r.report)
      const c = r.lhr.categories, a = r.lhr.audits
      console.log(nombre, 'perf', Math.round(c.performance.score * 100), 'a11y', Math.round(c.accessibility.score * 100), 'bp', Math.round(c['best-practices'].score * 100), 'seo', Math.round(c.seo.score * 100),
        '| LCP', a['largest-contentful-paint'].displayValue, 'CLS', a['cumulative-layout-shift'].displayValue, 'TBT', a['total-blocking-time'].displayValue)
    }
  }
  await chrome.kill()
}

if (capDir) {
  fs.mkdirSync(capDir, { recursive: true })
  const browser = await chromium.launch()
  for (const [nombre, w, h] of [['375', 375, 812], ['768', 768, 1024], ['1440', 1440, 900]]) {
    const page = await browser.newPage({ viewport: { width: w, height: h } })
    await page.goto(BASE + '/', { waitUntil: 'networkidle' })
    await page.waitForTimeout(1500)
    const secciones = await page.$$eval('main > section, footer', els => els.map((e, i) => e.id || e.tagName.toLowerCase() + i))
    const handles = await page.$$('main > section, footer')
    for (let i = 0; i < handles.length; i++) {
      await handles[i].scrollIntoViewIfNeeded()
      await page.waitForTimeout(900) // deja correr las animaciones de entrada
      await handles[i].screenshot({ path: `${capDir}/${String(i).padStart(2, '0')}-${secciones[i]}-${nombre}.png` })
    }
    await page.close()
  }
  await browser.close()
}
