import { createHash } from 'node:crypto'
import { getStore } from '@netlify/blobs'

/**
 * Límite diario por IP con Netlify Blobs. No se guarda la IP: solo un hash (SHA-256 con sal PUNTO_SALT + día),
 * así que el mismo visitante no se puede reconocer de un día para el otro.
 * El tope sale de PUNTO_LIMITE_DIA (por defecto 30). Si Blobs falla, se deja pasar (mejor un mensaje de más que
 * dejar a un cliente sin respuesta por un problema nuestro).
 *
 * Nota: Blobs no tiene incremento atómico; con mensajes simultáneos de la misma IP el conteo puede quedar 1 o 2 abajo.
 * Para un tope de cortesía es suficiente.
 */
export async function registrarUso(ip: string): Promise<boolean> {
  const tope = Number(process.env.PUNTO_LIMITE_DIA) || 30
  // Día en horario de Argentina (UTC-3), así el contador se reinicia a la medianoche local.
  const dia = new Date(Date.now() - 3 * 3600 * 1000).toISOString().slice(0, 10)
  const sal = process.env.PUNTO_SALT ?? ''
  if (!sal) console.warn('[punto] PUNTO_SALT no definida: el hash de IP no lleva sal')
  const hash = createHash('sha256').update(`${sal}|${ip}|${dia}`).digest('hex').slice(0, 32)
  try {
    const store = getStore({ name: 'punto-uso', consistency: 'strong' })
    const clave = `${dia}/${hash}`
    const actual = Number(await store.get(clave)) || 0
    if (actual >= tope) return false
    await store.set(clave, String(actual + 1))
    return true
  } catch (e) {
    console.warn(`[punto] límite no disponible (${(e as Error).message}): se deja pasar`)
    return true
  }
}
