import { useRef } from 'react'
import PortfolioCard from '../ui/PortfolioCard'
import { PROYECTOS } from '../../data/portfolio'
import { CLIENTES } from '../../data/clientes'
import type { Cliente } from '../../data/clientes'

const UMBRAL_ARRASTRE = 5

const VISIBLES = PROYECTOS.filter((p) => p.visible !== false)
// Clientes sin tarjeta en el carrusel: van en la franja de abajo.
const SIN_TARJETA = CLIENTES.filter((c) => !VISIBLES.some((p) => p.id === c.id))

function ClienteLogo({ cliente }: { cliente: Cliente }) {
  return (
    <li className="flex items-center gap-3 group">
      <div className="w-12 h-12 flex-none rounded-lg bg-white/5 border border-white/10 flex items-center justify-center overflow-hidden">
        {cliente.logo ? (
          <img
            src={cliente.logo}
            alt=""
            width={48}
            height={48}
            loading="lazy"
            decoding="async"
            className="w-full h-full object-contain p-1 grayscale group-hover:grayscale-0 transition-[filter] duration-300"
          />
        ) : (
          <span className="font-bold text-sm text-white/70">{cliente.iniciales ?? ''}</span>
        )}
      </div>
      <div>
        <p className="text-sm font-semibold leading-tight">{cliente.nombre}</p>
        <p className="text-xs text-white/60">{cliente.rubro}</p>
      </div>
    </li>
  )
}

export default function Trabajos() {
  const carrilRef = useRef<HTMLDivElement>(null)
  const arrastre = useRef({ activo: false, x: 0, scroll: 0, movido: false })

  // Arrastrar con el mouse mueve el scroll; con touch y teclado se usa el scroll nativo.
  const onPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.pointerType !== 'mouse' || !carrilRef.current) return
    arrastre.current = { activo: true, x: e.clientX, scroll: carrilRef.current.scrollLeft, movido: false }
    carrilRef.current.style.scrollSnapType = 'none' // el snap pelea con el scroll manual mientras se arrastra
  }
  const onPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const a = arrastre.current
    if (!a.activo || !carrilRef.current) return
    const dx = e.clientX - a.x
    if (Math.abs(dx) > UMBRAL_ARRASTRE) a.movido = true
    carrilRef.current.scrollLeft = a.scroll - dx
  }
  const terminar = () => {
    if (!arrastre.current.activo) return
    arrastre.current.activo = false
    if (carrilRef.current) carrilRef.current.style.scrollSnapType = ''
  }
  // Si hubo arrastre, el click final no debe abrir el link de la card.
  const onClickCapture = (e: React.MouseEvent<HTMLDivElement>) => {
    if (arrastre.current.movido) {
      e.preventDefault()
      e.stopPropagation()
      arrastre.current.movido = false
    }
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
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={terminar}
        onPointerLeave={terminar}
        onClickCapture={onClickCapture}
        onDragStart={(e) => e.preventDefault()}
        className="flex gap-6 px-6 md:px-12 pb-4 overflow-x-auto snap-x snap-mandatory scroll-pl-6 md:scroll-pl-12 cursor-grab active:cursor-grabbing select-none"
      >
        {VISIBLES.map((proyecto) => (
          <div key={proyecto.id} className="snap-start flex-none">
            <PortfolioCard proyecto={proyecto} />
          </div>
        ))}
      </div>

      <div className="max-w-6xl mx-auto px-6 mt-4">
        <p className="text-white/60 text-xs">Arrastrá o deslizá para ver más</p>
      </div>

      {SIN_TARJETA.length > 0 && (
        <div className="max-w-6xl mx-auto px-6 mt-14">
          <h3 className="text-sm text-white/70 mb-5">También confían en SCdev</h3>
          <ul className="flex flex-wrap gap-x-10 gap-y-5">
            {SIN_TARJETA.map((c) => (
              <ClienteLogo key={c.id} cliente={c} />
            ))}
          </ul>
        </div>
      )}
    </section>
  )
}
