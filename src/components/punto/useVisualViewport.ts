import { useEffect, useState } from 'react'

/**
 * Mientras el panel está abierto, publica en <html> dos variables CSS que el panel usa para no quedar tapado por el
 * teclado en pantalla:
 *  - --punto-vvh: alto visible (visual viewport), en px.
 *  - --punto-bottom: distancia entre el borde inferior del viewport de diseño y el del visual viewport (el teclado), en px.
 * En iOS el teclado achica el visual viewport sin cambiar el viewport de diseño (por eso 100dvh no alcanza); en Android
 * cambia el alto de la ventana y ambos valores coinciden. Solo se leen visualViewport.height/offsetTop e innerHeight
 * (no fuerzan layout) y se actualizan con requestAnimationFrame.
 */
export function useVisualViewport(activo: boolean) {
  useEffect(() => {
    if (!activo) return
    const vv = window.visualViewport
    const raiz = document.documentElement
    let raf = 0
    const aplicar = () => {
      raf = 0
      const alto = vv ? vv.height : window.innerHeight
      const arriba = vv ? vv.offsetTop : 0
      raiz.style.setProperty('--punto-vvh', `${Math.round(alto)}px`)
      raiz.style.setProperty('--punto-bottom', `${Math.max(0, Math.round(window.innerHeight - (arriba + alto)))}px`)
    }
    const pedir = () => {
      if (!raf) raf = requestAnimationFrame(aplicar)
    }
    aplicar()
    vv?.addEventListener('resize', pedir)
    vv?.addEventListener('scroll', pedir)
    window.addEventListener('resize', pedir)
    return () => {
      vv?.removeEventListener('resize', pedir)
      vv?.removeEventListener('scroll', pedir)
      window.removeEventListener('resize', pedir)
      if (raf) cancelAnimationFrame(raf)
      raiz.style.removeProperty('--punto-vvh')
      raiz.style.removeProperty('--punto-bottom')
    }
  }, [activo])
}

/** true mientras se cumple la media query (p. ej. '(max-height: 499px)'). */
export function useMediaQuery(consulta: string): boolean {
  const [coincide, setCoincide] = useState(() => (typeof window !== 'undefined' ? window.matchMedia(consulta).matches : false))
  useEffect(() => {
    const mq = window.matchMedia(consulta)
    const alCambiar = () => setCoincide(mq.matches)
    alCambiar()
    mq.addEventListener('change', alCambiar)
    return () => mq.removeEventListener('change', alCambiar)
  }, [consulta])
  return coincide
}
