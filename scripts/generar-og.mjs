// Genera public/images/og-scdev.jpg (1200x630) renderizando un HTML chico con Playwright.
import { chromium } from 'playwright'
import sharp from 'sharp'
import fs from 'node:fs'
import path from 'node:path'
import { pathToFileURL } from 'node:url'

const raiz = process.cwd()
const logo = await sharp(path.join(raiz, 'scripts/fuentes/LogoCompletoFN.png')).trim().resize({ width: 360 }).png().toBuffer()
const fuente = pathToFileURL(path.join(raiz, 'node_modules/@fontsource/syne/files/syne-latin-800-normal.woff2')).href
const fuenteBody = pathToFileURL(path.join(raiz, 'node_modules/@fontsource/dm-sans/files/dm-sans-latin-400-normal.woff2')).href

const html = `<!doctype html><meta charset="utf-8"><style>
@font-face{font-family:Syne;font-weight:800;src:url(${fuente})}
@font-face{font-family:'DM Sans';font-weight:400;src:url(${fuenteBody})}
*{margin:0;box-sizing:border-box}
body{width:1200px;height:630px;background:#0a0a0a;color:#fff;display:flex;flex-direction:column;justify-content:center;align-items:flex-start;padding:0 90px;gap:44px;position:relative;overflow:hidden}
body::before{content:"";position:absolute;inset:0;background:radial-gradient(ellipse at 15% 50%,rgba(211,47,47,.18),transparent 60%)}
img{width:260px;height:auto;position:relative}
h1{font:800 64px/1.1 Syne;position:relative;max-width:900px}
p{font:400 30px 'DM Sans';color:#D32F2F;position:relative}
</style>
<img src="data:image/png;base64,${logo.toString('base64')}">
<h1>Webs y sistemas para negocios de La Plata.</h1>
<p>Precios publicados.</p>`

const tmp = path.join(raiz, 'scripts/_og.html')
fs.writeFileSync(tmp, html)
const browser = await chromium.launch()
const page = await browser.newPage({ viewport: { width: 1200, height: 630 } })
await page.goto(pathToFileURL(tmp).href)
await page.evaluate(() => document.fonts.ready)
const png = await page.screenshot({ type: 'png' })
await browser.close()
fs.unlinkSync(tmp)
let q = 85, jpg
do { jpg = await sharp(png).jpeg({ quality: q, mozjpeg: true }).toBuffer(); q -= 5 } while (jpg.length > 200 * 1024 && q > 40)
fs.writeFileSync(path.join(raiz, 'public/images/og-scdev.jpg'), jpg)
console.log(`og-scdev.jpg ${(jpg.length / 1024).toFixed(0)} KB`)
