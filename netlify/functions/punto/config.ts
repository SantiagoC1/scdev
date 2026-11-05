import { PRECIOS_FALLBACK } from '../../../src/data/configFallback.ts'

type Precios = Record<string, string>

const TTL_MS = 10 * 60 * 1000
const TIMEOUT_MS = 3000

let cache: { precios: Precios; vence: number } | null = null

/**
 * Precios en vivo desde el Apps Script (el mismo Sheet que usa el sitio), con caché de 10 min por instancia.
 * Si el Sheet no responde: usa el último valor bueno (aunque esté vencido) y, si no hay, PRECIOS_FALLBACK.
 * Solo se aceptan claves de precio con valor numérico, así nada del Sheet llega al prompt como texto libre.
 */
export async function obtenerPrecios(): Promise<Precios> {
  if (cache && cache.vence > Date.now()) return cache.precios
  const url = process.env.APPS_SCRIPT_URL || process.env.VITE_APPS_SCRIPT_URL
  if (url) {
    try {
      const r = await fetch(url, { signal: AbortSignal.timeout(TIMEOUT_MS), redirect: 'follow' })
      if (!r.ok) throw new Error(`HTTP ${r.status}`)
      const data = (await r.json()) as { ok?: boolean; config?: Record<string, unknown> }
      if (!data.ok || !data.config) throw new Error('respuesta sin config')
      const precios: Precios = { ...PRECIOS_FALLBACK }
      for (const k of Object.keys(PRECIOS_FALLBACK)) {
        const v = String(data.config[k] ?? '').replace(/\D/g, '')
        if (v) precios[k] = v
      }
      cache = { precios, vence: Date.now() + TTL_MS }
      return precios
    } catch (e) {
      console.warn(`[punto] config en vivo no disponible (${(e as Error).message})`)
    }
  } else {
    console.warn('[punto] APPS_SCRIPT_URL no definida: se usan los precios de respaldo')
  }
  // Fallo: se reintenta en 1 min (no en cada mensaje) con lo último bueno o el respaldo.
  const precios = cache?.precios ?? { ...PRECIOS_FALLBACK }
  cache = { precios, vence: Date.now() + 60_000 }
  return precios
}
