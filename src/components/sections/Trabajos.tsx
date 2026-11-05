import { useRef } from 'react'
import PortfolioCard from '../ui/PortfolioCard'
import { PROYECTOS } from '../../data/portfolio'
import { CLIENTES } from '../../data/clientes'
import type { Cliente } from '../../data/clientes'

const UMBRAL_ARRASTRE = 5

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
        className="flex gap-6 pl-[max(1.5rem,calc((100%_-_72rem)/2_+_1.5rem))] pr-6 scroll-pl-[max(1.5rem,calc((100%_-_72rem)/2_+_1.5rem))] pb-4 overflow-x-auto snap-x snap-mandatory cursor-grab active:cursor-grabbing select-none"
      >
        {VISIBLES.map((proyecto) => (
          <div key={proyecto.id} className="snap-start flex-none flex">
            <PortfolioCard proyecto={proyecto} />
          </div>
        ))}
      </div>

      <div className="max-w-6xl mx-auto px-6 mt-4">
        <p className="text-white/60 text-xs">Arrastrá o deslizá para ver más</p>
      </div>

      <FranjaClientes />
    </section>
  )
}
