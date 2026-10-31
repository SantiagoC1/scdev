import { useRef } from 'react'
import PortfolioCard from '../ui/PortfolioCard'
import { PROYECTOS } from '../../data/portfolio'

const UMBRAL_ARRASTRE = 5

export default function Portfolio() {
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
    <section id="portfolio" className="py-24 bg-[#0a0a0a] overflow-hidden">
      <div className="max-w-6xl mx-auto px-6 mb-12">
        <h2 className="text-3xl md:text-5xl font-bold">Proyectos</h2>
      </div>

      <div
        ref={carrilRef}
        tabIndex={0}
        role="region"
        aria-label="Proyectos"
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={terminar}
        onPointerLeave={terminar}
        onClickCapture={onClickCapture}
        onDragStart={(e) => e.preventDefault()}
        className="flex gap-6 px-6 md:px-12 pb-4 overflow-x-auto snap-x snap-mandatory scroll-pl-6 md:scroll-pl-12 cursor-grab active:cursor-grabbing select-none"
      >
        {PROYECTOS.map((proyecto) => (
          <div key={proyecto.id} className="snap-start flex-none">
            <PortfolioCard proyecto={proyecto} />
          </div>
        ))}
      </div>

      <div className="max-w-6xl mx-auto px-6 mt-4">
        <p className="text-white/60 text-xs">Arrastrá o deslizá para ver más</p>
      </div>
    </section>
  )
}
