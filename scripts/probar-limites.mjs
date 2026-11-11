// Pruebas de las protecciones contra abuso de /api/punto, sin red ni Netlify (usa un almacén en memoria con la misma
// semántica de escrituras condicionales que Blobs y un proveedor de IA simulado).
//
// Uso:   node scripts/probar-limites.mjs
// Requiere Node 22.18+ (importa los .ts/.mts directamente). Sale con código 1 si algo falla.
//
// Lo que NO cubre: la atomicidad de las escrituras condicionales de Blobs frente a pedidos simultáneos reales. El emulador
// local de `netlify dev` no la respeta; hay que verificarla en un Deploy Preview (ver CLAUDE.md, sección Punto).
import path from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'

const raiz = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const imp = (rel) => import(pathToFileURL(path.join(raiz, rel)).href)
const { claveRed, revisarLimites } = await imp('netlify/functions/punto/limite.ts')
const { origenPermitido } = await imp('netlify/functions/punto/origen.ts')
const { default: handler } = await imp('netlify/functions/punto.mts')

let fallos = 0
const chequear = (nombre, ok, detalle = '') => {
  if (!ok) fallos++
  console.log(`${ok ? '✓' : '✗'} ${nombre}${detalle ? '  ' + detalle : ''}`)
}
const dormir = (ms) => new Promise((s) => setTimeout(s, ms))
const limpiarEnv = (...claves) => claves.forEach((k) => delete process.env[k])
const silenciar = () => {
  const w = console.warn, l = console.log
  console.warn = () => {}; console.log = () => {}
  return () => { console.warn = w; console.log = l }
}

/** Almacén en memoria con ETags y latencia simulada. */
function almacenFalso() {
  const m = new Map(); let v = 0
  const espera = () => new Promise((r) => setTimeout(r, Math.random() * 3))
  return {
    datos: m,
    async leer(k) { await espera(); const e = m.get(k); return e ? { valor: e.valor, etag: e.etag } : null },
    async crear(k, valor) { await espera(); if (m.has(k)) return false; m.set(k, { valor, etag: 'e' + ++v }); return true },
    async reemplazar(k, valor, etag) { await espera(); const e = m.get(k); if (!e || e.etag !== etag) return false; m.set(k, { valor, etag: 'e' + ++v }); return true },
  }
}

process.env.PUNTO_SALT = 'sal-de-prueba'

console.log('\n— IPv6: solo el prefijo /64 —')
const casos = [
  ['203.0.113.5', '203.0.113.5'], ['2001:db8:1:2::a', '2001:0db8:0001:0002::/64'], ['2001:db8:1:2:ffff:ffff:ffff:ffff', '2001:0db8:0001:0002::/64'],
  ['2001:DB8:1:2:0:0:0:1', '2001:0db8:0001:0002::/64'], ['2001:db8:1:3::a', '2001:0db8:0001:0003::/64'], ['::1', '0000:0000:0000:0000::/64'],
  ['::ffff:203.0.113.5', '203.0.113.5'], ['0:0:0:0:0:ffff:203.0.113.5', '203.0.113.5'], ['[2001:db8:1:2::a]', '2001:0db8:0001:0002::/64'],
  ['fe80::1%eth0', 'fe80:0000:0000:0000::/64'], ['2001:db8::', '2001:0db8:0000:0000::/64'], ['64:ff9b::192.0.2.33', '0064:ff9b:0000:0000::/64'],
  ['garbage', 'garbage'], ['', ''],
]
const malas = casos.filter(([e, s]) => claveRed(e) !== s)
chequear(`claveRed normaliza ${casos.length} casos`, malas.length === 0, malas.map(([e]) => e).join(', '))
{
  limpiarEnv('PUNTO_INTERVALO_MS'); process.env.PUNTO_INTERVALO_MS = '0'; process.env.PUNTO_LIMITE_DIA = '3'; process.env.PUNTO_TOPE_DIARIO = '999'
  const a = almacenFalso(); const r = []
  for (const ip of ['2001:db8:aaaa:1::1', '2001:db8:aaaa:1::2', '2001:db8:aaaa:1:dead:beef:0:3', '2001:db8:aaaa:1::ffff', '2001:db8:aaaa:1:1:2:3:4']) r.push(await revisarLimites(ip, a))
  chequear('5 direcciones distintas del mismo /64 comparten el tope por IP (3)', r.join() === 'ok,ok,ok,limite,limite', r.join())
  chequear('otro /64 tiene su propio contador', (await revisarLimites('2001:db8:aaaa:2::1', a)) === 'ok')
  const claves = [...a.datos.keys()]
  chequear('no se guarda la IP, solo hashes', !claves.some((k) => /2001|db8/.test(k)), `${claves.length} claves`)
}

console.log('\n— Tope global diario (PUNTO_TOPE_DIARIO) —')
{
  process.env.PUNTO_INTERVALO_MS = '0'; process.env.PUNTO_LIMITE_DIA = '30'; process.env.PUNTO_TOPE_DIARIO = '3'
  let a = almacenFalso(); const r = []
  for (let i = 1; i <= 5; i++) r.push(await revisarLimites('10.0.0.' + i, a))
  chequear('tope 3 con 5 visitantes distintos', r.join() === 'ok,ok,ok,tope,tope', r.join())
  process.env.PUNTO_TOPE_DIARIO = '100'; process.env.PUNTO_LIMITE_DIA = '2'; a = almacenFalso()
  const r2 = []; for (let i = 0; i < 6; i++) r2.push(await revisarLimites('10.9.9.9', a))
  chequear('una IP pasada de su tope diario no gasta el tope global', r2.join() === 'ok,ok,limite,limite,limite,limite' && a.datos.get([...a.datos.keys()].find((k) => k.endsWith('/global'))).valor === '2', r2.join())
  process.env.PUNTO_TOPE_DIARIO = '5'; process.env.PUNTO_LIMITE_DIA = '999'; a = almacenFalso()
  const res = await Promise.all(Array.from({ length: 20 }, (_, i) => revisarLimites('10.1.1.' + i, a)))
  chequear('20 pedidos simultáneos con tope 5: pasan exactamente 5', res.filter((x) => x === 'ok').length === 5, `ok=${res.filter((x) => x === 'ok').length}`)
}

console.log('\n— Intervalo mínimo de 3 s por IP —')
{
  limpiarEnv('PUNTO_INTERVALO_MS'); process.env.PUNTO_LIMITE_DIA = '999'; process.env.PUNTO_TOPE_DIARIO = '999'
  let a = almacenFalso(); const seq = []
  for (let i = 0; i < 4; i++) seq.push(await revisarLimites('8.8.4.4', a))
  chequear('ráfaga secuencial: pasa 1 y rechaza 3', seq.join() === 'ok,intervalo,intervalo,intervalo', seq.join())
  chequear('otra IP en ese momento no se ve afectada', (await revisarLimites('1.1.1.1', a)) === 'ok')
  const rafaga = await Promise.all(Array.from({ length: 10 }, () => revisarLimites('8.8.8.8', almacenFalso())))
  chequear('10 pedidos simultáneos sobre almacenes distintos son independientes', rafaga.every((x) => x === 'ok'))
  const b = almacenFalso(); const sim = await Promise.all(Array.from({ length: 10 }, () => revisarLimites('8.8.8.8', b)))
  chequear('ráfaga simultánea con escrituras condicionales atómicas: pasa 1 de 10', sim.filter((x) => x === 'ok').length === 1, `ok=${sim.filter((x) => x === 'ok').length}`)
  await dormir(3100)
  chequear('a los 3,1 s la misma IP vuelve a pasar', (await revisarLimites('8.8.4.4', a)) === 'ok')
  a = almacenFalso(); await revisarLimites('7.7.7.7', a); await dormir(2000)
  const rechazado = await revisarLimites('7.7.7.7', a); await dormir(1250)
  chequear('un rechazo no renueva la hora (reintentar a los 2 s no bloquea a los 3,25 s)', rechazado === 'intervalo' && (await revisarLimites('7.7.7.7', a)) === 'ok')
}

console.log('\n— Origen (403) —')
const req = (h) => new Request('http://x/api/punto', { method: 'POST', headers: h })
const origen = (titulo, env, casosO) => {
  limpiarEnv('NETLIFY_DEV', 'SITE_NAME', 'PUNTO_NETLIFY_SITE', 'DEPLOY_PRIME_URL', 'DEPLOY_URL', 'URL', 'PUNTO_ORIGENES_EXTRA')
  Object.assign(process.env, env)
  const malos = casosO.filter(([h, esperado]) => origenPermitido(req(h)) !== esperado)
  chequear(`${titulo} (${casosO.length} casos)`, malos.length === 0, malos.map(([h]) => JSON.stringify(h)).join(' '))
}
origen('producción', {}, [
  [{ origin: 'https://scdev.com.ar' }, true], [{ origin: 'https://www.scdev.com.ar' }, true], [{ referer: 'https://scdev.com.ar/nosotros' }, true],
  [{ origin: 'https://evil.com' }, false], [{ origin: 'https://scdev.com.ar.evil.com' }, false], [{ origin: 'https://evilscdev.com.ar' }, false],
  [{ origin: 'http://scdev.com.ar' }, false], [{ origin: 'https://sub.scdev.com.ar' }, false], [{}, false], [{ origin: 'null' }, false],
  [{ origin: 'http://localhost:8888' }, false], [{ origin: 'https://evil.com', referer: 'https://scdev.com.ar/' }, false], [{ origin: 'no es url' }, false],
])
origen('desarrollo (NETLIFY_DEV=true): localhost sí, el resto no', { NETLIFY_DEV: 'true' }, [
  [{ origin: 'http://localhost:8888' }, true], [{ origin: 'http://127.0.0.1:5173' }, true], [{ origin: 'http://localhost.evil.com' }, false], [{ origin: 'https://evil.com' }, false],
])
origen('Deploy Previews del sitio (SITE_NAME=scdev)', { SITE_NAME: 'scdev' }, [
  [{ origin: 'https://deploy-preview-12--scdev.netlify.app' }, true], [{ origin: 'https://deploy-preview-12--otrositio.netlify.app' }, false],
  [{ origin: 'https://main--scdev.netlify.app' }, false], [{ origin: 'https://deploy-preview-x--scdev.netlify.app' }, false],
  [{ origin: 'http://deploy-preview-12--scdev.netlify.app' }, false], [{ origin: 'https://deploy-preview-12--scdev.netlify.app.evil.com' }, false],
])
origen('sitio deducido de DEPLOY_PRIME_URL', { DEPLOY_PRIME_URL: 'https://deploy-preview-3--mi-sitio.netlify.app' }, [
  [{ origin: 'https://deploy-preview-7--mi-sitio.netlify.app' }, true], [{ origin: 'https://deploy-preview-7--scdev.netlify.app' }, false],
])
origen('sin nombre de sitio, los previews se rechazan', {}, [[{ origin: 'https://deploy-preview-7--scdev.netlify.app' }, false]])
origen('PUNTO_ORIGENES_EXTRA', { PUNTO_ORIGENES_EXTRA: 'https://staging.scdev.com.ar, https://otro.com' }, [
  [{ origin: 'https://staging.scdev.com.ar' }, true], [{ origin: 'https://otro.com' }, true], [{ origin: 'https://nada.com' }, false],
])

console.log('\n— Interruptor, método y header (proveedor de IA simulado) —')
{
  limpiarEnv('NETLIFY_DEV', 'SITE_NAME', 'PUNTO_NETLIFY_SITE', 'DEPLOY_PRIME_URL', 'DEPLOY_URL', 'URL', 'PUNTO_ORIGENES_EXTRA', 'PUNTO_ACTIVO')
  Object.assign(process.env, { PUNTO_INTERVALO_MS: '0', PUNTO_LIMITE_DIA: '999', PUNTO_TOPE_DIARIO: '999', GROQ_API_KEY: 'x', GROQ_MODEL: 'm', GEMINI_API_KEY: '', CLOUDFLARE_API_TOKEN: '', APPS_SCRIPT_URL: '', VITE_APPS_SCRIPT_URL: '' })
  const fetchReal = globalThis.fetch
  globalThis.fetch = async () => new Response('data: {"choices":[{"delta":{"content":"Hola"}}]}\n\ndata: {"choices":[{"delta":{},"finish_reason":"stop"}]}\n\ndata: [DONE]\n\n')
  const O = { origin: 'https://scdev.com.ar', 'content-type': 'application/json' }
  const post = (h = O) => new Request('http://x/api/punto', { method: 'POST', headers: h, body: JSON.stringify({ mensajes: [{ role: 'user', content: 'Hola' }] }) })
  const restaurar = silenciar()
  const sinOrigen = await handler(post({ 'content-type': 'application/json' }))
  const otroOrigen = await handler(post({ ...O, origin: 'https://evil.com' }))
  const prod = await handler(post()); const textoProd = await prod.text()
  process.env.NETLIFY_DEV = 'true'; const dev = await handler(post()); await dev.text(); delete process.env.NETLIFY_DEV
  process.env.PUNTO_ACTIVO = 'false'
  const apagado = await handler(post()); const apagadoJson = await apagado.json()
  const getApagado = await (await handler(new Request('http://x/api/punto', { headers: { origin: 'https://scdev.com.ar' } }))).json()
  delete process.env.PUNTO_ACTIVO
  const getActivo = await (await handler(new Request('http://x/api/punto', { headers: { origin: 'https://scdev.com.ar' } }))).json()
  const metodo = await handler(new Request('http://x/api/punto', { method: 'DELETE', headers: O }))
  restaurar(); globalThis.fetch = fetchReal
  chequear('pedido sin Origin: 403', sinOrigen.status === 403)
  chequear('pedido desde otro origen: 403', otroOrigen.status === 403)
  chequear('pedido válido: 200 con stream', prod.status === 200 && textoProd.includes('"delta":"Hola"'))
  chequear('producción: sin header X-Punto-Proveedor', prod.headers.get('x-punto-proveedor') === null)
  chequear('desarrollo (NETLIFY_DEV=true): con header X-Punto-Proveedor', dev.headers.get('x-punto-proveedor') === 'groq')
  chequear('PUNTO_ACTIVO=false: POST devuelve 503 desactivado', apagado.status === 503 && apagadoJson.error === 'desactivado')
  chequear('GET informa el estado ({activo})', getApagado.activo === false && getActivo.activo === true)
  chequear('otros métodos: 405', metodo.status === 405)
}

console.log(fallos ? `\n✗ ${fallos} chequeo(s) fallaron` : '\n✓ todo bien')
process.exit(fallos ? 1 : 0)
