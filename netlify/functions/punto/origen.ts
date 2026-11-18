/**
 * Verificación de origen de /api/punto: solo responde a pedidos que vienen de este sitio. Sirve contra el uso de la
 * función desde páginas ajenas o scripts de navegador; no frena a quien arma el pedido a mano (un script puede mandar
 * cualquier Origin), para eso están los límites por IP y el tope global.
 *
 * Se acepta, mirando Origin y, si no hay, Referer:
 *  - https://scdev.com.ar y https://www.scdev.com.ar
 *  - Los Deploy Previews de este sitio en Netlify: https://deploy-preview-<N>--<sitio>.netlify.app
 *  - localhost y 127.0.0.1, solo en desarrollo (netlify dev define NETLIFY_DEV=true)
 *  - Lo que se agregue en PUNTO_ORIGENES_EXTRA (orígenes completos separados por coma, p. ej. https://staging.scdev.com.ar)
 * Un pedido sin Origin ni Referer se rechaza (los navegadores siempre mandan Origin en un POST con fetch).
 */

const PRODUCCION = new Set(['scdev.com.ar', 'www.scdev.com.ar'])

/** Nombre del sitio en Netlify (el <sitio> de <sitio>.netlify.app). Sin él, los Deploy Previews se rechazan. */
function nombreSitio(): string | null {
  const e = process.env
  if (e.PUNTO_NETLIFY_SITE) return e.PUNTO_NETLIFY_SITE.toLowerCase()
  if (e.SITE_NAME) return e.SITE_NAME.toLowerCase()
  for (const v of [e.DEPLOY_PRIME_URL, e.DEPLOY_URL, e.URL]) {
    if (!v) continue
    try {
      const host = new URL(v).hostname.toLowerCase()
      if (host.endsWith('.netlify.app')) {
        const sub = host.slice(0, -'.netlify.app'.length)
        return sub.includes('--') ? sub.split('--').pop()! : sub
      }
    } catch {
      /* variable con otro formato: se sigue con la próxima */
    }
  }
  return null
}

const escapar = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

function hostPermitido(u: URL): boolean {
  const e = process.env
  if (u.protocol === 'https:' && PRODUCCION.has(u.hostname)) return true
  if (u.protocol === 'https:') {
    const sitio = nombreSitio()
    if (sitio && new RegExp(`^deploy-preview-\\d+--${escapar(sitio)}\\.netlify\\.app$`).test(u.hostname)) return true
  }
  if (e.NETLIFY_DEV === 'true' && (u.hostname === 'localhost' || u.hostname === '127.0.0.1')) return true
  const extra = (e.PUNTO_ORIGENES_EXTRA ?? '').split(',').map((x) => x.trim().replace(/\/$/, '')).filter(Boolean)
  return extra.includes(u.origin)
}

export function origenPermitido(req: Request): boolean {
  const origin = req.headers.get('origin')
  const candidato = origin && origin !== 'null' ? origin : req.headers.get('referer')
  if (!candidato) return false
  try {
    return hostPermitido(new URL(candidato))
  } catch {
    return false
  }
}
