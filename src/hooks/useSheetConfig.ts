import { useState, useEffect } from 'react'
import { APPS_SCRIPT_URL, WA_NUMBER } from '../constants'
import { PRECIOS_FALLBACK } from '../data/configFallback'

export interface SheetConfig {
  whatsapp_number: string
  whatsapp_default_text: string
  linkedin_url: string
  github_url: string
  instagram_url: string
  email: string
  price_esencial_min: string
  price_esencial_max: string
  price_landing_min: string
  price_landing_max: string
  price_corporativo_min: string
  price_corporativo_max: string
  price_sistema_min: string
  price_sistema_max: string
  price_automatizacion_min: string
  price_automatizacion_max: string
  price_mant_basico_min: string
  price_mant_basico_max: string
  price_mant_estandar_min: string
  price_mant_estandar_max: string
  price_mant_pro_min: string
  price_mant_pro_max: string
}

export const CONFIG_FALLBACK: SheetConfig = {
  whatsapp_number: WA_NUMBER,
  whatsapp_default_text: 'Hola Santi! Quiero cotizar una solución digital.',
  linkedin_url: 'https://www.linkedin.com/in/santiago-caceres01/',
  github_url: 'https://github.com/SantiagoC1',
  instagram_url: 'https://www.instagram.com/scdev.ar/',
  email: 'scdev.ok@gmail.com',
  ...PRECIOS_FALLBACK,
}

export function useSheetConfig() {
  // Si hay HTML prerenderizado, arranca con la config con que se generó (sin desajuste al hidratar); después actualiza en vivo.
  const [config, setConfig] = useState<SheetConfig>(
    () => (typeof window !== 'undefined' && window.__SCDEV_CONFIG__) || CONFIG_FALLBACK,
  )
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 6000)

    fetch(APPS_SCRIPT_URL, { method: 'GET', signal: controller.signal })
      .then((r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`)
        return r.json() as Promise<{ ok: boolean; config: Record<string, string> }>
      })
      .then((data) => {
        clearTimeout(timeout)
        if (data.ok && data.config) {
          if (import.meta.env.DEV) console.log('[SCdev] Config cargada desde Sheets:', data.config)
          setConfig({ ...CONFIG_FALLBACK, ...data.config } as SheetConfig)
        }
      })
      .catch((err: Error) => {
        clearTimeout(timeout)
        console.warn('[SCdev] Sheets no disponible, usando fallback:', err.message)
      })
      .finally(() => setLoading(false))

    return () => { clearTimeout(timeout); controller.abort() }
  }, [])

  return { config, loading }
}

export function formatPrice(value: string): string {
  const n = parseInt(value.replace(/\D/g, ''), 10)
  return isNaN(n) ? value : '$' + n.toLocaleString('es-AR')
}

export function buildWALink(number: string, text: string): string {
  return `https://wa.me/${number}?text=${encodeURIComponent(text)}`
}
