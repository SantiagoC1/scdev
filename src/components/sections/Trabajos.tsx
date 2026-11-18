import { useEffect, useRef, useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import PortfolioCard from '../ui/PortfolioCard'
import { PROYECTOS } from '../../data/portfolio'
import { CLIENTES } from '../../data/clientes'
import type { Cliente } from '../../data/clientes'

const UMBRAL_ARRASTRE = 5
const GAP_PX = 24 // gap-6 entre cards
const VIDA_INERCIA_MS = 325 // distancia de la inercia al soltar = velocidad (px/ms) x este tiempo
const FIN_INERCIA_MS = 900 // el scroll suave termina antes de esto; recién entonces las cards vuelven a recibir el puntero
const reducirMovimiento = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches

const VISIBLES = PROYECTOS.filter((p) => p.visible !== false)
// Franja "Confían en SCdev": solo clientes reales y visibles, nunca demos ni proyectos propios.
const CONFIAN = CLIENTES.filter((c) => c.tipo === 'cliente' && c.visible !== false)
const MARQUEE_DESDE = 6

function Logo({ cliente }: { cliente: Cliente }) {
  // Los logos apaisados (más de 2,5 veces más anchos que altos, como el de Tábano) llevan letra fina: con 32 px de alto
  // no se leen, así que se muestran un poco más altos. Los cuadrados y verticales siguen en 32 px.
  const [ancho, alto] = cliente.logoSize ?? [1, 1]
  const altura = ancho / alto > 2.5 ? 'h-11' : 'h-8'
  return cliente.logo ? (
    <img
      src={cliente.logo}
      alt={cliente.nombre}
      width={cliente.logoSize?.[0] ?? 32}
      height={cliente.logoSize?.[1] ?? 32}
      loading="lazy"
      decoding="async"
      className={`${altura} w-auto flex-none grayscale opacity-60 hover:grayscale-0 hover:opacity-100 transition duration-300`}
    />
  ) : (
    // Sin logo cargado: el nombre en texto, al mismo alto y con el mismo tratamiento.
    <span className="flex h-8 flex-none items-center font-display font-bold text-white opacity-60 hover:opacity-100 transition duration-300 whitespace-nowrap">
      {cliente.nombre}
    </span>
  )
}

function FranjaClientes() {
  if (CONFIAN.length === 0) return null
  const marquee = CONFIAN.length >= MARQUEE_DESDE
  return (
    <div className="max-w-6xl mx-auto px-6 mt-16">
      <h3 className="text-sm text-white/70 mb-5 text-center">Confían en SCdev</h3>
      {marquee ? (
        <div
          tabIndex={0}
          role="group"
          aria-label="Clientes de SCdev"
          className="marquee-pausable overflow-hidden"
        >
          <div className="flex w-max animate-marquee">
            <ul className="flex items-center gap-12 pr-12">
              {CONFIAN.map((c) => <li key={c.id}><Logo cliente={c} /></li>)}
            </ul>
            <ul aria-hidden="true" className="flex items-center gap-12 pr-12">
              {CONFIAN.map((c) => <li key={c.id}><Logo cliente={c} /></li>)}
            </ul>
          </div>
        </div>
      ) : (
        <ul className="flex flex-wrap items-center justify-center gap-x-12 gap-y-5">
          {CONFIAN.map((c) => <li key={c.id}><Logo cliente={c} /></li>)}
        </ul>
      )}
    </div>
  )
}

export default function Trabajos() {
  const carrilRef = useRef<HTMLDivElement>(null)
  const [alInicio, setAlInicio] = useState(true)
  const [alFinal, setAlFinal] = useState(false)
  // Estado del arrastre con mouse. Todo vive en una ref: durante el arrastre no hay renders de React ni lecturas de layout.
  const a = useRef({ activo: false, movido: false, x: 0, scroll: 0, ultimoX: 0, ultimoT: 0, v: 0, pendiente: 0, raf: 0, inercia: 0 })

  const cancelarInercia = () => {
    if (a.current.inercia) clearTimeout(a.current.inercia)
    a.current.inercia = 0
  }

  // El touch y el teclado usan el scroll nativo (sin JS en el camino); el mouse arrastra con rAF e inercia.
  const alBajar = (e: React.PointerEvent<HTMLDivElement>) => {
    const c = carrilRef.current
    if (e.pointerType !== 'mouse' || e.button !== 0 || !c) return
    cancelarInercia()
    Object.assign(a.current, { activo: true, movido: false, x: e.clientX, scroll: c.scrollLeft, ultimoX: e.clientX, ultimoT: e.timeStamp, v: 0 })
    c.style.scrollSnapType = 'none' // el snap pelea con el scroll manual mientras se arrastra
    window.addEventListener('pointermove', alMover, { passive: true })
    window.addEventListener('pointerup', alSoltar, { passive: true })
    window.addEventListener('pointercancel', alSoltar, { passive: true })
  }
  const aplicar = () => {
    a.current.raf = 0
    if (carrilRef.current) carrilRef.current.scrollLeft = a.current.pendiente // solo escritura
  }
  const alMover = (e: PointerEvent) => {
    const s = a.current
    const c = carrilRef.current
    if (!s.activo || !c) return
    const dx = e.clientX - s.x
    if (!s.movido && Math.abs(dx) > UMBRAL_ARRASTRE) {
      s.movido = true
      c.dataset.arrastrando = 'true' // las cards dejan de recibir el puntero (ver index.css)
    }
    const dt = e.timeStamp - s.ultimoT
    if (dt > 0) s.v = 0.8 * s.v + 0.2 * ((s.ultimoX - e.clientX) / dt) // px/ms en el sentido del scroll
    s.ultimoX = e.clientX
    s.ultimoT = e.timeStamp
    s.pendiente = s.scroll - dx
    if (!s.raf) s.raf = requestAnimationFrame(aplicar)
  }
  const alSoltar = () => {
    const s = a.current
    const c = carrilRef.current
    window.removeEventListener('pointermove', alMover)
    window.removeEventListener('pointerup', alSoltar)
    window.removeEventListener('pointercancel', alSoltar)
    if (!s.activo || !c) return
    s.activo = false
    if (s.raf) {
      cancelAnimationFrame(s.raf)
      aplicar()
    }
    const terminar = () => {
      s.inercia = 0
      c.style.scrollSnapType = '' // con proximity, el snap acomoda la tarjeta suavemente al final
      delete c.dataset.arrastrando
    }
    if (!s.movido || reducirMovimiento() || Math.abs(s.v) < 0.05) return terminar()
    // Inercia: el destino se calcula una vez (velocidad de suelta x constante de tiempo) y el movimiento lo anima el navegador
    // con scrollTo smooth, que corre en el compositor: sin escrituras de scrollLeft por cuadro. Con proximity, el snap acomoda al final.
    const max = c.scrollWidth - c.clientWidth
    const destino = Math.min(max, Math.max(0, c.scrollLeft + s.v * VIDA_INERCIA_MS))
    c.style.scrollSnapType = ''
    c.scrollTo({ left: destino, behavior: 'smooth' })
    s.inercia = window.setTimeout(terminar, FIN_INERCIA_MS)
  }
  // Si hubo arrastre, el click final no debe abrir el link de la card.
  const alClickear = (e: React.MouseEvent<HTMLDivElement>) => {
    if (a.current.movido) {
      e.preventDefault()
      e.stopPropagation()
      a.current.movido = false
    }
  }

  // Un gesto nuevo (rueda, toque, teclado) corta la inercia en curso.
  useEffect(() => {
    const c = carrilRef.current
    if (!c) return
    const cortar = () => cancelarInercia()
    c.addEventListener('wheel', cortar, { passive: true })
    c.addEventListener('touchstart', cortar, { passive: true })
    c.addEventListener('keydown', cortar)
    return () => {
      c.removeEventListener('wheel', cortar)
      c.removeEventListener('touchstart', cortar)
      c.removeEventListener('keydown', cortar)
      cancelarInercia()
      window.removeEventListener('pointermove', alMover)
      window.removeEventListener('pointerup', alSoltar)
      window.removeEventListener('pointercancel', alSoltar)
    }
    // Los handlers son estables en la práctica (solo leen refs): se registran una vez.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Flechas: se desactivan en los extremos. Se detectan con IntersectionObserver (sin listener de scroll).
  useEffect(() => {
    const c = carrilRef.current
    if (!c || typeof IntersectionObserver === 'undefined') return
    const primera = c.firstElementChild
    const ultima = c.lastElementChild
    if (!primera || !ultima) return
    const io = new IntersectionObserver(
      (entradas) => {
        for (const e of entradas) {
          if (e.target === primera) setAlInicio(e.intersectionRatio > 0.98)
          if (e.target === ultima) setAlFinal(e.intersectionRatio > 0.98)
        }
      },
      { root: c, threshold: [0, 0.98, 1] },
    )
    io.observe(primera)
    io.observe(ultima)
    return () => io.disconnect()
  }, [])

  const mover = (dir: 1 | -1) => {
    const c = carrilRef.current
    if (!c) return
    cancelarInercia()
    const tarjeta = c.firstElementChild as HTMLElement | null
    c.scrollBy({ left: dir * ((tarjeta?.offsetWidth ?? 480) + GAP_PX), behavior: reducirMovimiento() ? 'auto' : 'smooth' })
  }

  return (
    <section id="trabajos" className="py-24 bg-[#111111] overflow-hidden">
      <div className="max-w-6xl mx-auto px-6 mb-12">
        <h2 className="text-3xl md:text-5xl font-bold">Trabajos</h2>
      </div>

      <div
        ref={carrilRef}
        tabIndex={0}
        role="region"
        aria-label="Trabajos"
        onPointerDown={alBajar}
        onClickCapture={alClickear}
        onDragStart={(e) => e.preventDefault()}
        className="flex gap-6 pl-[max(1.5rem,calc((100%_-_72rem)/2_+_1.5rem))] pr-6 scroll-pl-[max(1.5rem,calc((100%_-_72rem)/2_+_1.5rem))] pb-4 overflow-x-auto snap-x snap-proximity overscroll-x-contain cursor-grab active:cursor-grabbing select-none"
      >
        {VISIBLES.map((proyecto, i) => (
          <div key={proyecto.id} className="snap-start snap-normal flex-none flex">
            <PortfolioCard proyecto={proyecto} prioridad={i < 2} />
          </div>
        ))}
      </div>

      <div className="max-w-6xl mx-auto px-6 mt-4 flex items-center justify-between gap-4">
        <p className="text-white/60 text-xs">Arrastrá o deslizá para ver más</p>
        <div className="hidden md:flex gap-2">
          <button
            type="button"
            onClick={() => mover(-1)}
            disabled={alInicio}
            aria-label="Ver trabajos anteriores"
            className="flex h-11 w-11 items-center justify-center rounded-lg border border-white/20 text-white hover:bg-white/5 disabled:opacity-40 disabled:hover:bg-transparent transition-colors"
          >
            <ChevronLeft size={20} aria-hidden="true" />
          </button>
          <button
            type="button"
            onClick={() => mover(1)}
            disabled={alFinal}
            aria-label="Ver trabajos siguientes"
            className="flex h-11 w-11 items-center justify-center rounded-lg border border-white/20 text-white hover:bg-white/5 disabled:opacity-40 disabled:hover:bg-transparent transition-colors"
          >
            <ChevronRight size={20} aria-hidden="true" />
          </button>
        </div>
      </div>

      <FranjaClientes />
    </section>
  )
}
