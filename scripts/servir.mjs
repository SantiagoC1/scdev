// Servidor estático que imita a Netlify: archivo exacto, luego <ruta>/index.html y, si no hay nada, /200.html.
// Sirve para probar el prerender (vite preview siempre devuelve /index.html). Uso: node scripts/servir.mjs [puerto]
import http from 'node:http'
import fs from 'node:fs'
import path from 'node:path'

const dist = path.resolve(import.meta.dirname, '..', 'dist')
const puerto = Number(process.argv[2] ?? 4173)
const tipos = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.svg': 'image/svg+xml', '.webp': 'image/webp', '.png': 'image/png', '.jpg': 'image/jpeg', '.woff': 'font/woff', '.woff2': 'font/woff2', '.xml': 'application/xml', '.txt': 'text/plain; charset=utf-8' }

const esArchivo = (p) => fs.existsSync(p) && fs.statSync(p).isFile()

http
  .createServer((req, res) => {
    const ruta = decodeURIComponent(new URL(req.url, 'http://x').pathname).replace(/\/+$/, '')
    const base = path.join(dist, ruta)
    const candidatos = [base, path.join(base, 'index.html')]
    let archivo = candidatos.find((c) => c.startsWith(dist) && esArchivo(c))
    let estado = 200
    if (!archivo) archivo = path.join(dist, '200.html') // rewrite 200 de _redirects
    const cuerpo = fs.readFileSync(archivo)
    res.writeHead(estado, { 'Content-Type': tipos[path.extname(archivo)] ?? 'application/octet-stream' })
    res.end(cuerpo)
  })
  .listen(puerto, () => console.log(`dist en http://localhost:${puerto}`))
