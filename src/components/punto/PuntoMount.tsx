import { lazy, Suspense, useEffect, useState } from 'react'

// El widget vive en un chunk aparte y se monta cuando el navegador está ocioso (o a los 3 s):
// no compite con el LCP y no entra en el HTML prerenderizado.
const PuntoWidget = lazy(() => import('./PuntoWidget'))

export default function PuntoMount() {
  const [montar, setMontar] = useState(false)

  useEffect(() => {
    const listo = () => setMontar(true)
    if ('requestIdleCallback' in window) {
      const id = window.requestIdleCallback(listo, { timeout: 3000 })
      return () => window.cancelIdleCallback(id)
    }
    const t = setTimeout(listo, 3000)
    return () => clearTimeout(t)
  }, [])

  if (!montar) return null
  return (
    <Suspense fallback={null}>
      <PuntoWidget />
    </Suspense>
  )
}
