import type { Cliente } from '../../data/clientes'

interface Props {
  cliente: Cliente
}

export default function ClienteCard({ cliente }: Props) {
  return (
    <div className="bg-white/[0.03] border border-white/[0.08] rounded-2xl p-6 hover:border-white/20 transition-all duration-300">
      <div className="flex items-center gap-4 mb-4">
        {cliente.logo ? (
          <div className="w-12 h-12 bg-white/5 rounded-xl flex items-center justify-center overflow-hidden">
            <img
              src={cliente.logo}
              alt={cliente.nombre}
              className="w-10 h-10 object-contain"
            />
          </div>
        ) : (
          <div className="w-12 h-12 bg-[#D32F2F] rounded-xl flex items-center justify-center flex-shrink-0">
            <span className="text-white font-bold text-sm">{cliente.iniciales}</span>
          </div>
        )}
        <div>
          <h4 className="font-bold text-sm">{cliente.nombre}</h4>
          <p className="text-white/40 text-xs">{cliente.rubro}</p>
        </div>
      </div>
      <p className="text-white/60 text-sm leading-relaxed mb-4">{cliente.desc}</p>
      {cliente.url && (
        <a
          href={cliente.url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs text-[#D32F2F] hover:text-white transition-colors"
        >
          Ver proyecto →
        </a>
      )}
    </div>
  )
}
