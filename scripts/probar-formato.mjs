// Pruebas de la normalización y del markdown de Punto (src/components/punto/formato.ts). Sin red ni servidor.
// Uso: node --test scripts/probar-formato.mjs        (Node 22.18+: importa el .ts directamente)
import { test } from 'node:test'
import assert from 'node:assert/strict'
import path from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'

const raiz = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const { normalizarTexto, parsearMarkdown, parsearInline } = await import(pathToFileURL(path.join(raiz, 'src/components/punto/formato.ts')).href)

const FINO = ' '
const NBSP = ' '
const NOSEP = '‑'

test('montos: espacio fino, no separable y normal → punto de miles', () => {
  assert.equal(normalizarTexto(`desde $80${FINO}000`), 'desde $80.000')
  assert.equal(normalizarTexto(`desde $80${NBSP}000`), 'desde $80.000')
  assert.equal(normalizarTexto('desde $80 000'), 'desde $80.000')
  assert.equal(normalizarTexto('desde $80000'), 'desde $80.000')
  assert.equal(normalizarTexto('desde $1 500 000'), 'desde $1.500.000')
  assert.equal(normalizarTexto(`desde $1${FINO}500${FINO}000.`), 'desde $1.500.000.')
  assert.equal(normalizarTexto('desde $1500000, 1 a 4 meses'), 'desde $1.500.000, 1 a 4 meses')
})

test('montos ya bien escritos y cifras sin "$" no se tocan', () => {
  assert.equal(normalizarTexto('desde $80.000'), 'desde $80.000')
  assert.equal(normalizarTexto('desde $1.500.000'), 'desde $1.500.000')
  assert.equal(normalizarTexto('desde $300'), 'desde $300')
  assert.equal(normalizarTexto('en 2026 tenemos 30000 visitas'), 'en 2026 tenemos 30000 visitas')
  assert.equal(normalizarTexto('desde $80.000 100 personas'), 'desde $80.000 100 personas')
})

test('el espacio entre "$" y la cifra: uno normal se respeta, uno raro se saca', () => {
  assert.equal(normalizarTexto('$ 80 000'), '$ 80.000')
  assert.equal(normalizarTexto(`$${FINO}80${FINO}000`), '$80.000')
})

test('espacios finos y no separables fuera de montos pasan a espacio normal', () => {
  assert.equal(normalizarTexto(`Hola${NBSP}Santi${FINO}¿cómo va?`), 'Hola Santi ¿cómo va?')
})

test('rangos de tiempo: "a" en lugar del guion', () => {
  assert.equal(normalizarTexto(`entrega en 3${NOSEP}5 días`), 'entrega en 3 a 5 días')
  assert.equal(normalizarTexto('entrega en 1-2 semanas'), 'entrega en 1 a 2 semanas')
  assert.equal(normalizarTexto('entre 3–5 días hábiles'), 'entre 3 a 5 días hábiles')
  assert.equal(normalizarTexto(`1${NOSEP}4 meses`), '1 a 4 meses')
  assert.equal(normalizarTexto('3 - 5 días'), '3 a 5 días')
})

test('otros rangos numéricos con guion no separable → raya; fechas y teléfonos no se tocan', () => {
  assert.equal(normalizarTexto(`de 10${NOSEP}20 páginas`), 'de 10–20 páginas')
  assert.equal(normalizarTexto('el 2026-11-04'), 'el 2026-11-04')
  assert.equal(normalizarTexto('al 221-4567890'), 'al 221-4567890')
  assert.equal(normalizarTexto(`e${NOSEP}commerce`), 'e-commerce')
})

test('espacios al final de línea (salto de línea de markdown) se sacan', () => {
  assert.equal(normalizarTexto('uno  \ndos   \ntres'), 'uno\ndos\ntres')
})

test('negrita completa', () => {
  assert.deepEqual(parsearInline('la **Landing Page** sale'), [
    { texto: 'la ', negrita: false },
    { texto: 'Landing Page', negrita: true },
    { texto: ' sale', negrita: false },
  ])
})

test('stream cortado: "**" sin cerrar no se muestra y el resto queda en negrita', () => {
  assert.deepEqual(parsearInline('la **Landing Pa'), [
    { texto: 'la ', negrita: false },
    { texto: 'Landing Pa', negrita: true },
  ])
  assert.deepEqual(parsearInline('la **'), [{ texto: 'la ', negrita: false }])
})

test('stream cortado: media marca "*" al final se descarta', () => {
  assert.deepEqual(parsearInline('la **Landing*'), [
    { texto: 'la ', negrita: false },
    { texto: 'Landing', negrita: true },
  ])
  assert.deepEqual(parsearInline('listo *'), [{ texto: 'listo ', negrita: false }])
})

test('stream cortado: cualquier prefijo de una respuesta nunca deja símbolos de markdown ni de monto a medias', () => {
  const completa = `Hola.\n\n- **Presencia Web Esencial**: desde $80${FINO}000, 3${NOSEP}5 días.\n- **Landing**: desde $400${FINO}000.\n\n¿Qué rubro es?`
  for (let i = 1; i <= completa.length; i++) {
    const bloques = parsearMarkdown(completa.slice(0, i))
    const plano = JSON.stringify(bloques)
    assert.ok(!plano.includes('**'), `quedó "**" en el prefijo ${i}: ${completa.slice(0, i)}`)
    assert.ok(!plano.includes(FINO) && !plano.includes(NOSEP), `quedó un carácter raro en el prefijo ${i}`)
  }
  const final = JSON.stringify(parsearMarkdown(completa))
  assert.ok(final.includes('$80.000') && final.includes('3 a 5 días') && final.includes('$400.000'))
})

test('el monto cortado a mitad se corrige cuando llega el resto', () => {
  assert.equal(normalizarTexto('desde $80'), 'desde $80')
  assert.equal(normalizarTexto(`desde $80${FINO}`), 'desde $80')
  assert.equal(normalizarTexto(`desde $80${FINO}000`), 'desde $80.000')
})

test('listas con "- ", "* " y "• ": una lista con viñetas, párrafos aparte', () => {
  const b = parsearMarkdown('Tenemos:\n- uno\n* dos\n• tres\n\nY después sigue.')
  assert.deepEqual(b.map((x) => x.tipo), ['parrafo', 'lista', 'parrafo'])
  assert.equal(b[1].items.length, 3)
  assert.equal(b[1].items[1][0].texto, 'dos')
})

test('"**Negrita**" al inicio de línea no es una viñeta', () => {
  const b = parsearMarkdown('**Ojo** con esto')
  assert.equal(b[0].tipo, 'parrafo')
  assert.deepEqual(b[0].lineas[0][0], { texto: 'Ojo', negrita: true })
})

test('saltos de línea simples se respetan dentro del párrafo; la línea en blanco separa párrafos', () => {
  const b = parsearMarkdown('uno\ndos\n\ntres')
  assert.equal(b.length, 2)
  assert.equal(b[0].lineas.length, 2)
})

test('títulos y tablas salen como texto plano sin símbolos', () => {
  const b = parsearMarkdown('## Precios\n\n| Servicio | Desde |\n|---|---|\n| Landing | $400.000 |')
  const plano = b.map((x) => x.lineas.map((l) => l.map((t) => t.texto).join('')).join('\n')).join('\n')
  assert.equal(plano, 'Precios\nServicio · Desde\nLanding · $400.000')
  assert.ok(!/[#|]/.test(plano))
})

test('el HTML y los símbolos se tratan como texto (React los escapa al dibujar)', () => {
  const b = parsearMarkdown('<img src=x onerror=alert(1)> y <b>hola</b> & más')
  assert.equal(b[0].lineas[0][0].texto, '<img src=x onerror=alert(1)> y <b>hola</b> & más')
})

test('texto vacío y solo espacios no generan bloques', () => {
  assert.deepEqual(parsearMarkdown(''), [])
  assert.deepEqual(parsearMarkdown('  \n \n'), [])
})

test('ejemplo real de gpt-oss: sin "**", sin caracteres raros y con lista', () => {
  const crudo = `¡Hola! En SCdev armamos:\n\n- **Presencia Web Esencial** (ideal para gasistas): desde $80${FINO}000, entrega en 3${NOSEP}5 días.  \n- **Landing Page Profesional**: desde $400${FINO}000, 1${NOSEP}2 semanas.  \n\n¿En qué rubro está tu negocio?`
  const b = parsearMarkdown(crudo)
  const plano = JSON.stringify(b)
  assert.deepEqual(b.map((x) => x.tipo), ['parrafo', 'lista', 'parrafo'])
  assert.ok(!plano.includes('**') && !plano.includes(FINO) && !plano.includes(NOSEP))
  assert.ok(plano.includes('desde $80.000, entrega en 3 a 5 días.') && plano.includes('1 a 2 semanas'))
})
