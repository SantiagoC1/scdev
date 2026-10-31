import { useEffect, useRef } from 'react'

const SCRIPT_SRC = 'https://cdn.jsdelivr.net/npm/particles.js@2.0.0/particles.min.js'
const MAX_PARTICULAS = 40

interface PJS {
  fn: {
    drawAnimFrame: number
    vendors: { destroypJS: () => void; draw: () => void }
  }
}

declare global {
  interface Window {
    particlesJS?: (id: string, config: object) => void
    pJSDom?: { pJS: PJS }[]
  }
}

function cargarScript(): Promise<void> {
  if (window.particlesJS) return Promise.resolve()
  return new Promise((resolve, reject) => {
    const existente = document.querySelector<HTMLScriptElement>(`script[src="${SCRIPT_SRC}"]`)
    const s = existente ?? document.createElement('script')
    s.addEventListener('load', () => resolve(), { once: true })
    s.addEventListener('error', () => reject(new Error('particles.js no cargó')), { once: true })
    if (!existente) {
      s.src = SCRIPT_SRC
      s.async = true
      document.head.appendChild(s)
    }
  })
}

const config = {
  particles: {
    number: { value: MAX_PARTICULAS, density: { enable: true, value_area: 800 } },
    color: { value: '#D32F2F' },
    shape: { type: 'circle' },
    opacity: { value: 0.5, random: false, anim: { enable: false } },
    size: { value: 3, random: true, anim: { enable: false } },
    line_linked: { enable: true, distance: 150, color: '#D32F2F', opacity: 0.2, width: 1 },
    move: { enable: true, speed: 2, direction: 'none', random: false, straight: false, out_mode: 'out', bounce: false },
  },
  interactivity: {
    detect_on: 'canvas',
    events: { onhover: { enable: true, mode: 'grab' }, onclick: { enable: true, mode: 'push' }, resize: true },
    modes: { grab: { distance: 140, line_linked: { opacity: 0.5 } }, push: { particles_nb: 2 } },
  },
  retina_detect: false,
}

export default function ParticlesBackground() {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    if (window.innerWidth < 768) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    let cancelado = false
    let observer: IntersectionObserver | undefined
    let idleId: number | undefined
    let timeoutId: number | undefined

    const iniciar = async () => {
      try {
        await cargarScript()
      } catch {
        return
      }
      if (cancelado || !window.particlesJS) return
      window.particlesJS(el.id, config)

      // Pausa el loop de dibujo cuando el hero sale de pantalla.
      observer = new IntersectionObserver(([entry]) => {
        const pjs = window.pJSDom?.[0]?.pJS
        if (!pjs) return
        if (entry.isIntersecting) pjs.fn.vendors.draw()
        else cancelAnimationFrame(pjs.fn.drawAnimFrame)
      })
      observer.observe(el)
    }

    if ('requestIdleCallback' in window) idleId = window.requestIdleCallback(iniciar, { timeout: 3000 })
    else timeoutId = window.setTimeout(iniciar, 1500)

    return () => {
      cancelado = true
      observer?.disconnect()
      if (idleId !== undefined) window.cancelIdleCallback(idleId)
      if (timeoutId !== undefined) window.clearTimeout(timeoutId)
      if (window.pJSDom && window.pJSDom.length > 0) {
        window.pJSDom[0].pJS.fn.vendors.destroypJS()
        window.pJSDom = []
      }
    }
  }, [])

  return <div ref={ref} id="particles-js" aria-hidden="true" className="absolute inset-0 w-full h-full -z-10" />
}
