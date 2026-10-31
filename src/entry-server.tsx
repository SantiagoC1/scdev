import { prerender } from 'react-dom/static'
import { StaticRouter } from 'react-router-dom/server'
import { AppShell, Rutas } from './App'
import { CONFIG_FALLBACK } from './hooks/useSheetConfig'
import { SERVICIOS } from './data/servicios'

/** Rutas que se prerenderizan. */
export const RUTAS = ['/', '/nosotros', ...SERVICIOS.map((s) => s.slug)]

// react-helmet-async 3 usa el hoisting de metadatos de React 19: title, meta y link salen al
// principio del HTML renderizado. Esos van al <head>; el resto es el contenido del root.
const ETIQUETA_HEAD = /^(<title[^>]*>[\s\S]*?<\/title>|<(?:meta|link|base)\b[^>]*>)/

export async function render(url: string) {
  const { prelude } = await prerender(
    <AppShell
      config={CONFIG_FALLBACK}
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
