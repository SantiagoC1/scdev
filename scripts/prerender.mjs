// Prerender estático. Corre después de `vite build` y `vite build --ssr`.
// Renderiza cada ruta con el bundle de dist-ssr, la inyecta en dist/index.html y guarda dist/<ruta>/index.html.
// También deja dist/200.html (shell sin contenido, fallback de rutas desconocidas) y genera sitemap.xml.
import fs from 'node:fs'
import path from 'node:path'
import { pathToFileURL } from 'node:url'

const raiz = path.resolve(import.meta.dirname, '..')
const dist = path.join(raiz, 'dist')
const SITE_URL = 'https://scdev.com.ar'

const { render, RUTAS } = await import(pathToFileURL(path.join(raiz, 'dist-ssr/entry-server.js')).href)

const plantilla = fs.readFileSync(path.join(dist, 'index.html'), 'utf8')
fs.writeFileSync(path.join(dist, '200.html'), plantilla)

// Metas que cada ruta define por su cuenta: se sacan de la plantilla para no duplicarlas.
const porRuta = [
  /<title>[\s\S]*?<\/title>\s*/,
  /<meta\s+name="description"[\s\S]*?\/>\s*/,
  /<meta\s+property="og:(title|description|url|type|image|image:width|image:height)"[\s\S]*?\/>\s*/g,
  /<meta\s+name="twitter:(title|description|image)"[\s\S]*?\/>\s*/g,
  /<link\s+rel="canonical"[^>]*>\s*/,
]

for (const ruta of RUTAS) {
  const { html, head } = await render(ruta)
  let out = plantilla
  for (const re of porRuta) out = out.replace(re, '')
  out = out.replace('</head>', `${head}\n</head>`)
  if (!out.includes('<div id="root"></div>')) throw new Error('No encontré <div id="root"></div> en dist/index.html')
  out = out.replace('<div id="root"></div>', `<div id="root" data-ruta="${ruta}">${html}</div>`)

  const destino = ruta === '/' ? path.join(dist, 'index.html') : path.join(dist, ruta, 'index.html')
  fs.mkdirSync(path.dirname(destino), { recursive: true })
  fs.writeFileSync(destino, out)
  console.log(`✓ ${ruta}  (${(out.length / 1024).toFixed(1)} kB)`)
}

// sitemap.xml con lastmod de la fecha del build
const hoy = new Date().toISOString().slice(0, 10)
const prioridad = (r) => (r === '/' ? '1.0' : r === '/nosotros' ? '0.9' : '0.8')
const urls = RUTAS.map(
  (r) => `  <url>\n    <loc>${SITE_URL}${r === '/' ? '/' : r}</loc>\n    <lastmod>${hoy}</lastmod>\n    <changefreq>monthly</changefreq>\n    <priority>${prioridad(r)}</priority>\n  </url>`,
).join('\n')
fs.writeFileSync(
  path.join(dist, 'sitemap.xml'),
  `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`,
)
console.log(`✓ sitemap.xml (${RUTAS.length} rutas, lastmod ${hoy})`)
