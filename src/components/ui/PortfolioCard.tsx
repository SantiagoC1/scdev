import { useState } from 'react'
import type { Proyecto } from '../../data/portfolio'

interface Props {
  proyecto: Proyecto
  /** Las dos primeras cards cargan enseguida; el resto, lazy. */
  prioridad?: boolean
}

const VARIANTES = [480, 960]

/** srcset con las variantes más chicas que el original, o null si el proyecto no declara el ancho del archivo. */
function armarSrcSet(imagen: string, ancho?: number): { src: string; srcSet: string } | null {
  if (!ancho) return null
  const base = imagen.replace(/\.webp$/, '')
  const chicas = VARIANTES.filter((v) => v < ancho)
  const srcSet = [...chicas.map((v) => `${base}-${v}.webp ${v}w`), `${imagen} ${ancho}w`].join(', ')
  return { src: chicas.length ? `${base}-${chicas[chicas.length - 1]}.webp` : imagen, srcSet }
}

export default function PortfolioCard({ proyecto, prioridad = false }: Props) {
  const [imgError, setImgError] = useState(false)
  const sinImagen = !proyecto.imagen || imgError
  const responsiva = armarSrcSet(proyecto.imagen, proyecto.anchoImagen)

  return (
    <div className="flex-none w-[85vw] max-w-[30rem] sm:w-[26rem] md:w-[30rem] h-full flex flex-col bg-white/[0.03] border border-white/[0.08] rounded-2xl overflow-hidden hover:border-white/20 transition-colors duration-200 group carrusel-card">
      <div className="relative aspect-[16/10] flex-shrink-0 overflow-hidden bg-black/20">
        {proyecto.tipo === 'demo' && (
          <span className="absolute top-3 left-3 z-10 text-xs font-medium px-2 py-1 rounded-lg bg-black/70 text-white border border-white/20">
            {proyecto.chip ?? 'Demo'}
          </span>
        )}
        {sinImagen ? (
          <div className="w-full h-full flex items-center justify-center bg-[#2D2D2D] px-5">
            <span className="font-display font-bold text-sm text-white/70 text-center leading-tight">
              {proyecto.nombre}
            </span>
          </div>
        ) : (
          <img
            src={responsiva?.src ?? proyecto.imagen}
            srcSet={responsiva?.srcSet}
            sizes={responsiva ? '(max-width: 639px) 85vw, 480px' : undefined}
            alt={proyecto.nombre}
            width={480}
            height={300}
            loading={prioridad ? 'eager' : 'lazy'}
            decoding="async"
            onError={() => setImgError(true)}
            className="carrusel-img w-full h-full object-cover object-top"
          />
        )}
      </div>
      <div className="flex-1 flex flex-col p-5 gap-3">
        <div>
          <h4 className="font-bold text-sm leading-tight">{proyecto.nombre}</h4>
          {proyecto.rubro && <p className="text-xs text-white/60 mt-1">{proyecto.rubro}</p>}
        </div>
        {proyecto.descripcion && (
          <p className="text-sm text-white/70 leading-relaxed line-clamp-3">{proyecto.descripcion}</p>
        )}
        <div className="flex flex-wrap gap-1.5 empty:hidden">
          {proyecto.tags.slice(0, 3).map((tag) => (
            <span
              key={tag}
              className="text-xs bg-white/5 border border-white/10 px-2 py-0.5 rounded-lg text-white/60"
            >
              {tag}
            </span>
          ))}
        </div>
        <div className="mt-2">
          {proyecto.url && (
            <a
              href={proyecto.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-accent-text hover:text-white transition-colors"
            >
              {proyecto.tipo === 'demo' ? 'Ver demo' : 'Ver sitio'} →
            </a>
          )}
        </div>
      </div>
    </div>
  )
}
