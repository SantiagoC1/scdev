import { GTM_ID } from '../gtm.config'

type Ventana = Window & { dataLayer?: Record<string, unknown>[] }

function cargar() {
  const w = window as Ventana
  w.dataLayer = w.dataLayer || []
  w.dataLayer.push({ 'gtm.start': new Date().getTime(), event: 'gtm.js' })
  const s = document.createElement('script')
  s.async = true
  s.src = `https://www.googletagmanager.com/gtm.js?id=${GTM_ID}`
  document.head.appendChild(s)
}

/** Carga GTM después de `load` y, a partir de ahí, cuando el navegador esté ocioso (máximo 3 s de espera). */
export function cargarGtmDiferido() {
  const idle = () => {
    if ('requestIdleCallback' in window) window.requestIdleCallback(cargar, { timeout: 3000 })
    else setTimeout(cargar, 3000)
  }
  if (document.readyState === 'complete') idle()
  else window.addEventListener('load', idle, { once: true })
}
