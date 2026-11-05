// Prerender estático. Corre después de `vite build` y `vite build --ssr` (ver "build" en package.json).
// - Lee la config (precios) del Sheet vía VITE_APPS_SCRIPT_URL, con timeout; si falla usa CONFIG_FALLBACK.
// - Renderiza cada ruta válida con el bundle de dist-ssr y guarda dist/<ruta>/index.html.
// - Renderiza la página 404 en dist/404.html (noindex).
// - Genera sitemap.xml y verifica que todas las rutas válidas tengan su HTML.
import fs from 'node:fs'
import path from 'node:path'
import { pathToFileURL } from 'node:url'

const raiz = path.resolve(import.meta.dirname, '..')
const dist = path.join(raiz, 'dist')
const SITE_URL = 'https://scdev.com.ar'
const TIMEOUT_MS = 8000

// Variables de .env para el build local (en Netlify llegan como variables de entorno del sitio).
for (const f of ['.env.local', '.env']) {
  try { process.loadEnvFile(path.join(raiz, f)) } catch { /* no existe */ }
}

const { render, RUTAS, RUTA_404, CONFIG_FALLBACK } = await import(pathToFileURL(path.join(raiz, 'dist-ssr/entry-server.js')).href)

async function cargarConfig() {
  const url = process.env.VITE_APPS_SCRIPT_URL
  if (!url) {
    console.warn('⚠ VITE_APPS_SCRIPT_URL no está definida: se usa CONFIG_FALLBACK para precios y contacto.')
    return CONFIG_FALLBACK
  }
  try {
    const r = await fetch(url, { signal: AbortSignal.timeout(TIMEOUT_MS), redirect: 'follow' })
    if (!r.ok) throw new Error(`HTTP ${r.status}`)
    const data = await r.json()
    if (!data.ok || !data.config) throw new Error('respuesta sin config')
    console.log(`✓ Config leída del Sheet (${Object.keys(data.config).length} claves)`)
    return { ...CONFIG_FALLBACK, ...data.config }
  } catch (e) {
    console.warn(`⚠ No pude leer el Sheet (${e.message}): se usa CONFIG_FALLBACK.`)
    return CONFIG_FALLBACK
  }
}

const config = await cargarConfig()
// La misma config va embebida en el HTML para que el cliente hidrate con los mismos valores.
const scriptConfig = `<script>window.__SCDEV_CONFIG__=${JSON.stringify(config).replace(/</g, '\\u003c')}</script>`

// dist/index.html se sobrescribe con la home prerenderizada: la plantilla original se guarda aparte
// (en dist-ssr, que no se publica) para poder volver a correr este script sin rehacer el build.
const archivoPlantilla = path.join(raiz, 'dist-ssr/plantilla.html')
if (!fs.existsSync(archivoPlantilla)) fs.copyFileSync(path.join(dist, 'index.html'), archivoPlantilla)
const plantilla = fs.readFileSync(archivoPlantilla, 'utf8')

// Metas que cada ruta define por su cuenta: se sacan de la plantilla para no duplicarlas.
const porRuta = [
  /<title>[\s\S]*?<\/title>\s*/,
  /<meta\s+name="description"[\s\S]*?\/>\s*/,
  /<meta\s+property="og:(title|description|url|type|image|image:width|image:height)"[\s\S]*?\/>\s*/g,
  /<meta\s+name="twitter:(title|description|image)"[\s\S]*?\/>\s*/g,
  /<link\s+rel="canonical"[^>]*>\s*/,
]
const robots = /<meta\s+name="robots"[\s\S]*?\/>\s*/

async function pagina(ruta, marca) {
  const { html, head } = await render(ruta, config)
  let out = plantilla
  for (const re of porRuta) out = out.replace(re, '')
  if (head.includes('name="robots"')) out = out.replace(robots, '') // la ruta define su propio robots (404: noindex)
  out = out.replace('</head>', `${scriptConfig}\n${head}\n</head>`)
  if (!out.includes('<div id="root"></div>')) throw new Error('No encontré <div id="root"></div> en dist/index.html')
  return out.replace('<div id="root"></div>', `<div id="root" data-ruta="${marca}">${html}</div>`)
}

const escribir = (destino, contenido) => {
  fs.mkdirSync(path.dirname(destino), { recursive: true })
  fs.writeFileSync(destino, contenido)
}

for (const ruta of RUTAS) {
  const out = await pagina(ruta, ruta)
  escribir(ruta === '/' ? path.join(dist, 'index.html') : path.join(dist, ruta, 'index.html'), out)
  console.log(`✓ ${ruta}  (${(out.length / 1024).toFixed(1)} kB)`)
}

const out404 = await pagina(RUTA_404, '404')
if (!out404.includes('noindex')) throw new Error('404.html no tiene noindex')
escribir(path.join(dist, '404.html'), out404)
console.log(`✓ 404.html  (${(out404.length / 1024).toFixed(1)} kB, noindex)`)

// sitemap.xml con lastmod de la fecha del build
const hoy = new Date().toISOString().slice(0, 10)
const prioridad = (r) => (r === '/' ? '1.0' : r === '/nosotros' ? '0.9' : r === '/privacidad' ? '0.3' : '0.8')
const urls = RUTAS.map(
  (r) => `  <url>\n    <loc>${SITE_URL}${r}</loc>\n    <lastmod>${hoy}</lastmod>\n    <changefreq>monthly</changefreq>\n    <priority>${prioridad(r)}</priority>\n  </url>`,
).join('\n')
escribir(
  path.join(dist, 'sitemap.xml'),
  `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`,
)
console.log(`✓ sitemap.xml (${RUTAS.length} rutas, lastmod ${hoy})`)

// Verificación: cada ruta válida tiene HTML con su <h1> y está en el sitemap.
const faltan = RUTAS.filter((r) => {
  const f = r === '/' ? path.join(dist, 'index.html') : path.join(dist, r, 'index.html')
  return !fs.existsSync(f) || !/<h1[\s>]/.test(fs.readFileSync(f, 'utf8'))
})
if (faltan.length) throw new Error(`Rutas sin HTML prerenderizado o sin <h1>: ${faltan.join(', ')}`)
console.log(`✓ ${RUTAS.length} rutas válidas verificadas en el prerender`)
