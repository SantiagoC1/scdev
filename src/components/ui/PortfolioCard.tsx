import { useState } from 'react'
import type { Proyecto } from '../../data/portfolio'

interface Props {
  proyecto: Proyecto
}

export default function PortfolioCard({ proyecto }: Props) {
  const [imgError, setImgError] = useState(false)
  const sinImagen = !proyecto.imagen || imgError

  return (
    <div className="flex-none w-[85vw] sm:w-72 md:w-80 h-[380px] flex flex-col bg-white/[0.03] border border-white/[0.08] rounded-2xl overflow-hidden hover:border-white/20 transition-all duration-300 group">
      <div className="relative h-48 flex-shrink-0 overflow-hidden bg-black/20">
        {proyecto.tipo === 'demo' && (
          <span className="absolute top-3 left-3 z-10 text-xs font-medium px-2 py-1 rounded-lg bg-black/70 text-white border border-white/20">
            Demo
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
            src={proyecto.imagen}
            alt={proyecto.nombre}
            width={320}
            height={192}
            loading="lazy"
            decoding="async"
            onError={() => setImgError(true)}
            className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-500"
          />
        )}
      </div>
      <div className="flex-1 flex flex-col p-5 gap-3">
        <h4 className="font-bold text-sm leading-tight">{proyecto.nombre}</h4>
        <div className="flex flex-wrap gap-1.5">
          {proyecto.tags.map((tag) => (
            <span
              key={tag}
              className="text-xs bg-white/5 border border-white/10 px-2 py-0.5 rounded-lg text-white/60"
            >
              {tag}
            </span>
          ))}
        </div>
        <div className="mt-auto">
          {proyecto.url && (
            <a
              href={proyecto.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-accent-text hover:text-white transition-colors"
            >
              {proyecto.tipo === 'demo' ? 'Ver demo' : 'Ver más'} →
            </a>
          )}
        </div>
      </div>
    </div>
  )
}
