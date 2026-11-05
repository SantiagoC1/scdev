import { armarConocimiento } from './punto/conocimiento.ts'
import { obtenerPrecios } from './punto/config.ts'
import { SYSTEM_PROMPT } from './punto/prompt.ts'

export const config = { path: '/api/punto' }

/**
 * Cadena de proveedores: Groq → Gemini → Cloudflare Workers AI, los tres con API compatible con OpenAI.
 * Los ids de modelo vienen de variables de entorno (GROQ_MODEL, GEMINI_MODEL, CLOUDFLARE_MODEL):
 * un proveedor sin clave o sin modelo se saltea.
 * Los precios del prompt salen de la config en vivo (Apps Script, caché de 10 min, con respaldo): ver punto/config.ts.
 *
 * Formato hacia el cliente (SSE): `data: {"delta":"texto"}\n\n` … `data: [DONE]\n\n`.
 * Solo se reenvía choices[0].delta.content: los campos de razonamiento (reasoning, reasoning_content, thought…) se descartan.
 */

const TIMEOUT_MS = 8000
const MAX_MENSAJES = 8
const MAX_CARACTERES = 500
const MAX_BODY_BYTES = 16_000

interface Proveedor {
  nombre: string
  url: string
  key: string
  model: string
}

function proveedores(): Proveedor[] {
  const e = process.env
  const lista: Proveedor[] = [
    { nombre: 'groq', url: 'https://api.groq.com/openai/v1/chat/completions', key: e.GROQ_API_KEY ?? '', model: e.GROQ_MODEL ?? '' },
    {
      nombre: 'gemini',
      url: 'https://generativelanguage.googleapis.com/v1beta/openai/chat/completions',
      key: e.GEMINI_API_KEY ?? '',
      model: e.GEMINI_MODEL ?? '',
    },
    {
      nombre: 'cloudflare',
      url: `https://api.cloudflare.com/client/v4/accounts/${e.CLOUDFLARE_ACCOUNT_ID ?? ''}/ai/v1/chat/completions`,
      key: e.CLOUDFLARE_API_TOKEN ?? '',
      model: e.CLOUDFLARE_MODEL ?? '',
    },
  ]
  return lista.filter((p) => p.key && p.model && (p.nombre !== 'cloudflare' || e.CLOUDFLARE_ACCOUNT_ID))
}

interface MensajeIA {
  role: 'user' | 'assistant'
  content: string
}

function limpiarHistorial(mensajes: unknown): MensajeIA[] {
  if (!Array.isArray(mensajes)) return []
  return mensajes
    .filter((m) => m && (m.role === 'user' || m.role === 'assistant') && typeof m.content === 'string' && m.content.trim())
    .slice(-MAX_MENSAJES)
    .map((m) => ({ role: m.role as 'user' | 'assistant', content: (m.content as string).slice(0, MAX_CARACTERES) }))
}

/** Lee el SSE de un proveedor y entrega solo los fragmentos no vacíos de delta.content. */
async function* deltas(reader: ReadableStreamDefaultReader<Uint8Array>): AsyncGenerator<string> {
  const dec = new TextDecoder()
  let buf = ''
  for (;;) {
    const { value, done } = await reader.read()
    if (done) break
    buf += dec.decode(value, { stream: true })
    let i: number
    while ((i = buf.indexOf('\n')) >= 0) {
      const linea = buf.slice(0, i).trim()
      buf = buf.slice(i + 1)
      if (!linea.startsWith('data:')) continue
      const dato = linea.slice(5).trim()
      if (dato === '[DONE]') return
      try {
        const c = JSON.parse(dato)?.choices?.[0]?.delta?.content
        if (typeof c === 'string' && c) yield c
      } catch {
        /* línea incompleta o no JSON: se ignora */
      }
    }
  }
}

/** Devuelve el stream con el primer fragmento ya leído, o null si hay que pasar al siguiente proveedor. */
async function intentar(
  p: Proveedor,
  mensajes: unknown[],
  cancelar: AbortSignal,
): Promise<{ primero: string; resto: AsyncGenerator<string> } | null> {
  const ctl = new AbortController()
  const timer = setTimeout(() => ctl.abort(), TIMEOUT_MS)
  const alCancelar = () => ctl.abort()
  cancelar.addEventListener('abort', alCancelar)
  try {
    const r = await fetch(p.url, {
      method: 'POST',
      signal: ctl.signal,
      headers: { Authorization: `Bearer ${p.key}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ model: p.model, messages: mensajes, max_tokens: 300, temperature: 0.6, stream: true }),
    })
    if (!r.ok || !r.body) {
      console.warn(`[punto] ${p.nombre}: HTTP ${r.status}`)
      await r.body?.cancel().catch(() => {})
      return null
    }
    const gen = deltas(r.body.getReader())
    const primero = await gen.next() // el plazo de 8 s cubre hasta el primer contenido
    if (primero.done) {
      console.warn(`[punto] ${p.nombre}: respuesta vacía`)
      return null
    }
    return { primero: primero.value, resto: gen }
  } catch (err) {
    console.warn(`[punto] ${p.nombre}: ${ctl.signal.aborted ? 'timeout' : (err as Error).name}`)
    return null
  } finally {
    clearTimeout(timer)
    cancelar.removeEventListener('abort', alCancelar)
  }
}

const json = (cuerpo: unknown, status: number) => Response.json(cuerpo, { status, headers: { 'Cache-Control': 'no-store' } })

export default async function handler(req: Request): Promise<Response> {
  if (req.method !== 'POST') return new Response(null, { status: 405, headers: { Allow: 'POST' } })
  if (Number(req.headers.get('content-length') ?? 0) > MAX_BODY_BYTES) return json({ error: 'demasiado_largo' }, 413)

  let cuerpo: { mensajes?: unknown }
  try {
    cuerpo = await req.json()
  } catch {
    return json({ error: 'json_invalido' }, 400)
  }
  const historial = limpiarHistorial(cuerpo?.mensajes)
  if (!historial.length || historial[historial.length - 1].role !== 'user') return json({ error: 'sin_mensaje' }, 400)

  const mensajes = [{ role: 'system', content: SYSTEM_PROMPT.replace('{{conocimiento}}', armarConocimiento(await obtenerPrecios())) }, ...historial]

  for (const p of proveedores()) {
    const r = await intentar(p, mensajes, req.signal)
    if (!r) continue
    console.log(`[punto] respondió ${p.nombre}`)

    const enc = new TextEncoder()
    const evento = (o: unknown) => enc.encode(`data: ${JSON.stringify(o)}\n\n`)
    const stream = new ReadableStream<Uint8Array>({
      async start(ctrl) {
        try {
          ctrl.enqueue(evento({ delta: r.primero }))
          for await (const d of r.resto) ctrl.enqueue(evento({ delta: d }))
        } catch {
          ctrl.enqueue(evento({ error: 'stream' })) // cortado a mitad: el cliente decide qué mostrar
        }
        ctrl.enqueue(enc.encode('data: [DONE]\n\n'))
        ctrl.close()
      },
      cancel() {
        void r.resto.return(undefined)
      },
    })
    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream; charset=utf-8',
        'Cache-Control': 'no-store, no-transform',
        'X-Punto-Proveedor': p.nombre,
      },
    })
  }
  return json({ error: 'sin_servicio' }, 503)
}
