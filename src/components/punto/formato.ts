/**
 * Formato de las respuestas de Punto. Funciones puras, sin React: se aplican sobre el texto ACUMULADO del mensaje en
 * cada actualización del stream (no por fragmento, porque el stream corta tokens, montos y marcas a la mitad).
 *
 * 1. normalizarTexto: espacios raros, montos en formato argentino ("$80.000") y rangos ("3 a 5 días").
 * 2. parsearMarkdown: un subconjunto mínimo (negrita, listas con viñetas, saltos de línea) como datos, no como HTML.
 *    El componente lo dibuja con elementos de React, así que todo lo demás queda escapado por construcción.
 */

// Espacios que algunos modelos usan como separador de miles: U+00A0, U+2007, U+2009, U+200A, U+202F, U+2008, U+2002-2006.
const ESPACIOS_RAROS = '\\u00a0\\u2002-\\u200a\\u202f\\u205f\\u3000'
const RE_ESPACIOS_RAROS = new RegExp(`[${ESPACIOS_RAROS}]`, 'g')
const SEP_ESPACIO = `[ ${ESPACIOS_RAROS}]` // separador de miles con espacio (normal o raro)
// Guiones: el de U+2010/U+2011 no separables, el medio, el largo y el signo menos.
const GUION = '[\\u2010\\u2011\\u2012\\u2013\\u2212-]'
const UNIDAD_TIEMPO = '(?:d[ií]as?|semanas?|meses|mes|horas?|hs)\\b'

const conPuntos = (digitos: string) => digitos.replace(/\B(?=(\d{3})+(?!\d))/g, '.')

/** Espacios raros → espacio normal; montos con punto de miles; guiones entre números → "a" (tiempo) o "–" (otros). */
export function normalizarTexto(entrada: string): string {
  let t = entrada

  // 1. Entre "$" y la cifra no queda ningún espacio raro (un espacio normal se respeta). Después, los espacios raros pasan a normales.
  t = t.replace(new RegExp(`\\$[${ESPACIOS_RAROS}]+(?=\\d)`, 'g'), '$')
  t = t.replace(RE_ESPACIOS_RAROS, ' ')

  // 2. Montos: "$80 000", "$80000" y "$1 500 000" → "$80.000", "$1.500.000". Solo con "$" adelante, para no tocar
  //    otras cifras (años, teléfonos). Los grupos son de a 3 dígitos; lo que sigue (",50", " días") no se toca.
  t = t.replace(new RegExp(`\\$(\\s?)(\\d{1,3}(?:\\.\\d{3})+|\\d{1,3}(?:${SEP_ESPACIO}\\d{3})+|\\d{4,})(?!\\d)`, 'g'), (_m, esp: string, cifra: string) => {
    return `$${esp}${conPuntos(cifra.replace(/[^\d]/g, ''))}`
  })

  // 3. Rangos de tiempo: "3‑5 días" / "3-5 días" / "3–5 semanas" → "3 a 5 días".
  t = t.replace(new RegExp(`(\\d+)\\s?${GUION}\\s?(\\d+)(\\s*${UNIDAD_TIEMPO})`, 'gi'), '$1 a $2$3')
  // 3b. Otros rangos entre números (de hasta 4 cifras, para no tocar teléfonos ni fechas) con guion no separable,
  //     o con guion normal cuando no es parte de una cadena (2024-05-01): "10‑20" → "10–20".
  t = t.replace(/(?<![\d\-‐‑–])(\d{1,4})[‐‑‒–](\d{1,4})(?![\d\-‐‑–])/g, '$1–$2')

  // 4. Cualquier guion no separable que quede (palabras compuestas) pasa al guion común.
  t = t.replace(/[‐‑]/g, '-')

  // 5. Espacios al final de cada línea ("  \n" es un salto de línea en markdown) y espacios dobles dentro de la línea.
  t = t.replace(/[ \t]+$/gm, '').replace(/(\S)[ \t]{2,}(?=\S)/g, '$1 ')
  return t
}

// --- Markdown mínimo ----------------------------------------------------------------------------------------------

export type Tramo = { texto: string; negrita: boolean }
export type Bloque = { tipo: 'parrafo'; lineas: Tramo[][] } | { tipo: 'lista'; items: Tramo[][] }

/** Texto de una línea sin símbolos de título ni de tabla. */
function aplanarLinea(linea: string): string | null {
  const t = linea.trim()
  if (/^\|?[\s:|-]+\|?$/.test(t) && t.includes('-') && t.includes('|')) return null // separador de tabla "|---|---|"
  if (/^#{1,6}\s/.test(t)) return t.replace(/^#{1,6}\s+/, '').replace(/\s*#+$/, '')
  if (t.startsWith('|') || (t.includes(' | ') && /\|\s*$/.test(t))) {
    return t.replace(/^\||\|$/g, '').split('|').map((c) => c.trim()).filter(Boolean).join(' · ')
  }
  if (/^>\s?/.test(t)) return t.replace(/^>\s?/, '')
  return linea
}

/**
 * Negrita con **...**. Una "**" sin cerrar (el stream todavía no mandó el cierre) deja el resto de la línea en negrita
 * sin mostrar el símbolo; un "*" suelto al final (media marca) se descarta. Otras marcas (_, `, *cursiva*) se muestran sin símbolo.
 */
export function parsearInline(linea: string): Tramo[] {
  const limpia = linea.replace(/`+/g, '').replace(/(^|[\s(])_{1,2}([^_\n]+)_{1,2}(?=[\s).,;:!?]|$)/g, '$1$2')
  const partes = limpia.split('**')
  const tramos: Tramo[] = []
  partes.forEach((parte, i) => {
    let texto = parte
    if (i === partes.length - 1) texto = texto.replace(/\*$/, '') // media marca "*" al final del stream
    texto = texto.replace(/(^|\s)\*(?=\S)([^*\n]+)\*(?=\s|[.,;:!?)]|$)/g, '$1$2') // *cursiva* sin símbolos
    if (texto) tramos.push({ texto, negrita: i % 2 === 1 })
  })
  return tramos
}

const RE_ITEM = /^\s*(?:[-*•–]|‑)\s+(.*)$/

export function parsearMarkdown(entrada: string): Bloque[] {
  const bloques: Bloque[] = []
  let parrafo: string[] = []
  let lista: string[] = []
  const cerrarParrafo = () => {
    if (parrafo.length) bloques.push({ tipo: 'parrafo', lineas: parrafo.map(parsearInline) })
    parrafo = []
  }
  const cerrarLista = () => {
    if (lista.length) bloques.push({ tipo: 'lista', items: lista.map(parsearInline) })
    lista = []
  }

  for (const cruda of normalizarTexto(entrada).replace(/\r\n?/g, '\n').split('\n')) {
    if (!cruda.trim()) {
      cerrarParrafo()
      cerrarLista()
      continue
    }
    const item = RE_ITEM.exec(cruda)
    // "**Negrita**" al inicio no es una viñeta: RE_ITEM exige un espacio después del "*".
    if (item && item[1].trim()) {
      cerrarParrafo()
      lista.push(item[1].trim())
      continue
    }
    const plana = aplanarLinea(cruda)
    if (plana === null) continue
    cerrarLista()
    parrafo.push(plana.trim())
  }
  cerrarParrafo()
  cerrarLista()
  return bloques
}
