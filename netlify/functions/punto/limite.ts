import { createHash } from 'node:crypto'
import { getStore } from '@netlify/blobs'

/**
 * Límites de uso de Punto con Netlify Blobs. No se guarda la IP: solo un hash (SHA-256 con sal PUNTO_SALT + día),
 * así que el mismo visitante no se puede reconocer de un día para el otro.
 *
 *  - Por IP y por día: PUNTO_LIMITE_DIA (por defecto 30).
 *  - Global por día, para todos los visitantes juntos: PUNTO_TOPE_DIARIO (por defecto 600). Protege el plan gratuito.
 *  - Intervalo mínimo entre mensajes de la misma IP: PUNTO_INTERVALO_MS (por defecto 3000), verificado acá además de en el cliente.
 *
 * Los contadores usan escrituras condicionales de Blobs (crear solo si no existe / reemplazar solo si el ETag
 * coincide), así que dos mensajes simultáneos no pisan la cuenta del otro. Si Blobs falla, se deja pasar (mejor un
 * mensaje de más que dejar a un cliente sin respuesta por un problema nuestro).
 */

export type Resultado = 'ok' | 'intervalo' | 'limite' | 'tope'

/** Lo mínimo que se necesita de un almacén clave-valor con escrituras condicionales (Blobs, o uno en memoria para pruebas). */
export interface Almacen {
  leer(clave: string): Promise<{ valor: string; etag: string } | null>
  /** Crea la clave solo si no existe. Devuelve false si ya existía. */
  crear(clave: string, valor: string): Promise<boolean>
  /** Reemplaza solo si el ETag sigue siendo el leído. Devuelve false si alguien escribió en el medio. */
  reemplazar(clave: string, valor: string, etag: string): Promise<boolean>
}

function almacenBlobs(): Almacen {
  const store = getStore({ name: 'punto-uso', consistency: 'strong' })
  return {
    async leer(clave) {
      const r = await store.getWithMetadata(clave, { type: 'text' })
      return r ? { valor: r.data, etag: r.etag ?? '' } : null
    },
    async crear(clave, valor) {
      return (await store.set(clave, valor, { onlyIfNew: true })).modified
    },
    async reemplazar(clave, valor, etag) {
      return (await store.set(clave, valor, { onlyIfMatch: etag })).modified
    },
  }
}

/** Día en horario de Argentina (UTC-3), así los contadores se reinician a la medianoche local. */
const diaActual = () => new Date(Date.now() - 3 * 3600 * 1000).toISOString().slice(0, 10)

/** Suma 1 al contador si no llegó al tope. 'tope' si ya estaba en el tope. */
async function incrementar(a: Almacen, clave: string, tope: number): Promise<'ok' | 'tope'> {
  for (let intento = 0; intento < 8; intento++) {
    const actual = await a.leer(clave)
    if (!actual) {
      if (await a.crear(clave, '1')) return 'ok'
      continue // alguien lo creó justo antes: se vuelve a leer
    }
    const n = Number(actual.valor) || 0
    if (n >= tope) return 'tope'
    if (await a.reemplazar(clave, String(n + 1), actual.etag)) return 'ok'
  }
  console.warn('[punto] contador con demasiada contención: se deja pasar')
  return 'ok'
}

/**
 * Intervalo mínimo entre mensajes aceptados de la misma IP. Guarda la hora del último mensaje aceptado con una escritura
 * condicional: si dos pedidos llegan a la vez, solo uno gana y el otro se rechaza (una ráfaga no lo esquiva).
 * Un pedido rechazado no renueva la hora, así quien reintenta cada 2,9 s no queda bloqueado para siempre.
 */
async function intervaloCumplido(a: Almacen, clave: string, minMs: number): Promise<boolean> {
  const ahora = Date.now()
  const previo = await a.leer(clave)
  if (!previo) return a.crear(clave, String(ahora))
  if (ahora - (Number(previo.valor) || 0) < minMs) return false
  return a.reemplazar(clave, String(ahora), previo.etag)
}

/** Revisa y registra el uso de un mensaje. El orden importa: un visitante pasado de su tope diario no gasta el tope global. */
export async function revisarLimites(ip: string, almacen?: Almacen): Promise<Resultado> {
  const topeIp = Number(process.env.PUNTO_LIMITE_DIA) || 30
  const topeGlobal = Number(process.env.PUNTO_TOPE_DIARIO) || 600
  const intervaloMs = process.env.PUNTO_INTERVALO_MS === undefined ? 3000 : Number(process.env.PUNTO_INTERVALO_MS) || 0
  const dia = diaActual()
  const sal = process.env.PUNTO_SALT ?? ''
  if (!sal) console.warn('[punto] PUNTO_SALT no definida: el hash de IP no lleva sal')
  const hash = createHash('sha256').update(`${sal}|${ip}|${dia}`).digest('hex').slice(0, 32)
  try {
    const a = almacen ?? almacenBlobs()
    if (intervaloMs > 0 && !(await intervaloCumplido(a, `${dia}/t/${hash}`, intervaloMs))) return 'intervalo'
    if ((await incrementar(a, `${dia}/${hash}`, topeIp)) === 'tope') return 'limite'
    if ((await incrementar(a, `${dia}/global`, topeGlobal)) === 'tope') return 'tope'
    return 'ok'
  } catch (e) {
    console.warn(`[punto] límite no disponible (${(e as Error).message}): se deja pasar`)
    return 'ok'
  }
}
