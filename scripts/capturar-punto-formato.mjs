// Capturas del panel de Punto con una respuesta con lista y precios, tal como la escribe gpt-oss (con **negritas**,
// espacios finos y guiones no separables). Mockea /api/punto: no gasta cuota de IA.
// Uso (con `npm run dev` corriendo): node scripts/capturar-punto-formato.mjs [--url=http://localhost:5173] [--salida=docs/capturas/punto-formato]
import fs from 'node:fs'
import path from 'node:path'
import { chromium } from 'playwright'

const args = Object.fromEntries(process.argv.slice(2).map((a) => a.replace(/^--/, '').split('=')))
const BASE = args.url ?? 'http://localhost:5173'
const SALIDA = path.resolve(args.salida ?? 'docs/capturas/punto-formato')
fs.mkdirSync(SALIDA, { recursive: true })

const FINO = ' '
const NOSEP = '‑'
const RESPUESTA =
  `Para una peluquería te recomiendo estas dos opciones:\n\n` +
  `- **Presencia Web Esencial**: desde $80${FINO}000, entrega en 3${NOSEP}5 días.  \n` +
  `- **Landing Page Profesional**: desde $400${FINO}000, entrega en 1${NOSEP}2 semanas.  \n\n` +
  `Son precios de referencia: el valor final depende del proyecto. ¿Querés que sigamos por WhatsApp con el equipo?`

const sse = (texto) => {
  const trozos = texto.match(/[\s\S]{1,7}/g) ?? [texto]
  return trozos.map((d) => `data: ${JSON.stringify({ delta: d })}\n\n`).join('') + 'data: [DONE]\n\n'
}

const navegador = await chromium.launch()
for (const [w, h, nombre] of [[375, 812, '375'], [1440, 900, '1440']]) {
  const ctx = await navegador.newContext({ viewport: { width: w, height: h }, deviceScaleFactor: 2, isMobile: w < 640, hasTouch: w < 640 })
  const p = await ctx.newPage()
  await p.route('**/api/punto', (ruta) => {
    if (ruta.request().method() === 'GET') return ruta.fulfill({ status: 200, contentType: 'application/json', body: '{"activo":true}' })
    return ruta.fulfill({ status: 200, contentType: 'text/event-stream; charset=utf-8', body: sse(RESPUESTA) })
  })
  await p.goto(BASE + '/', { waitUntil: 'load' })
  await p.getByRole('button', { name: 'Abrir el asistente Punto' }).click()
  await p.waitForSelector('[role=dialog]')
  await p.locator('#punto-input').fill('Tengo una peluquería, ¿qué me recomiendan?')
  await p.getByRole('button', { name: 'Enviar mensaje' }).click()
  await p.waitForTimeout(2500)
  const texto = await p.locator('[role=dialog] [aria-live]').innerText()
  const mal = ['**', FINO, NOSEP, '$80 000'].filter((x) => texto.includes(x))
  console.log(`${nombre}: ${mal.length ? 'FALLA, quedó ' + JSON.stringify(mal) : 'ok (sin ** ni caracteres raros; "$80.000" y "3 a 5 días" presentes: ' + (texto.includes('$80.000') && texto.includes('3 a 5 días')) + ')'}`)
  await p.screenshot({ path: path.join(SALIDA, `panel-lista-${nombre}.png`) })
  await ctx.close()
}
await navegador.close()
