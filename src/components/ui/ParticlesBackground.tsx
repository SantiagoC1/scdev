import { useEffect } from 'react'

declare global {
  interface Window {
    particlesJS: (id: string, config: object) => void
    pJSDom: { pJS: { fn: { vendors: { destroypJS: () => void } } } }[]
  }
}

export default function ParticlesBackground() {
  useEffect(() => {
    if (typeof window.particlesJS === 'undefined') return

    window.particlesJS('particles-js', {
      particles: {
        number: {
          value: window.innerWidth < 768 ? 40 : 80,
          density: { enable: true, value_area: 800 },
        },
        color: { value: '#D32F2F' },
        shape: { type: 'circle' },
        opacity: {
          value: 0.5,
          random: false,
          anim: { enable: false },
        },
        size: {
          value: 3,
          random: true,
          anim: { enable: false },
        },
        line_linked: {
          enable: true,
          distance: 150,
          color: '#D32F2F',
          opacity: 0.2,
          width: 1,
        },
        move: {
          enable: true,
          speed: 2,
          direction: 'none',
          random: false,
          straight: false,
          out_mode: 'out',
          bounce: false,
        },
      },
      interactivity: {
        detect_on: 'canvas',
        events: {
          onhover: { enable: true, mode: 'grab' },
          onclick: { enable: true, mode: 'push' },
          resize: true,
        },
        modes: {
          grab: { distance: 140, line_linked: { opacity: 0.5 } },
          push: { particles_nb: 4 },
        },
      },
      retina_detect: true,
    })

    return () => {
      if (window.pJSDom && window.pJSDom.length > 0) {
        window.pJSDom[0].pJS.fn.vendors.destroypJS()
        window.pJSDom = []
      }
    }
  }, [])

  return <div id="particles-js" className="absolute inset-0 w-full h-full -z-10" />
}
