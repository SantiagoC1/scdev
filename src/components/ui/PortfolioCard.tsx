import type { Proyecto } from '../../data/portfolio'

interface Props {
  proyecto: Proyecto
}

export default function PortfolioCard({ proyecto }: Props) {
  return (
    <div className="flex-none w-[85vw] sm:w-72 md:w-80 h-[380px] flex flex-col bg-white/[0.03] border border-white/[0.08] rounded-2xl overflow-hidden hover:border-white/20 transition-all duration-300 group">
      <div className="h-48 flex-shrink-0 overflow-hidden bg-black/20">
        <img
          src={proyecto.imagen}
          alt={proyecto.nombre}
          loading="lazy"
          decoding="async"
          className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-500"
        />
      </div>
      <div className="flex-1 flex flex-col p-5 gap-3">
        <h4 className="font-bold text-sm leading-tight">{proyecto.nombre}</h4>
        <div className="flex flex-wrap gap-1.5">
          {proyecto.tags.map((tag) => (
            <span
              key={tag}
              className="text-xs bg-white/5 border border-white/10 px-2 py-0.5 rounded text-white/50"
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
              className="text-xs text-[#D32F2F] hover:text-white transition-colors"
            >
              Ver más →
            </a>
          )}
        </div>
      </div>
    </div>
  )
}
