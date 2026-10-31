import { prerender } from 'react-dom/static'
import { StaticRouter } from 'react-router-dom/server'
import { AppShell, Rutas, RUTAS_VALIDAS } from './App'
import { CONFIG_FALLBACK } from './hooks/useSheetConfig'
import type { SheetConfig } from './hooks/useSheetConfig'

export { CONFIG_FALLBACK }

/** Rutas que se prerenderizan. */
export const RUTAS = RUTAS_VALIDAS

/** Ruta cualquiera que no existe: el router cae en la página 404. */
export const RUTA_404 = '/__404__'

// react-helmet-async 3 usa el hoisting de metadatos de React 19: title, meta y link salen al
// principio del HTML renderizado. Esos van al <head>; el resto es el contenido del root.
const ETIQUETA_HEAD = /^(<title[^>]*>[\s\S]*?<\/title>|<(?:meta|link|base)\b[^>]*>)/

export async function render(url: string, config: SheetConfig = CONFIG_FALLBACK) {
  const { prelude } = await prerender(
    <AppShell
      config={config}
      router={
        <StaticRouter location={url}>
          <Rutas />
        </StaticRouter>
      }
    />,
  )
  let html = await new Response(prelude).text()
  let head = ''
  for (let m = ETIQUETA_HEAD.exec(html); m; m = ETIQUETA_HEAD.exec(html)) {
    head += m[0] + '\n'
    html = html.slice(m[0].length)
  }
  return { html, head }
}
