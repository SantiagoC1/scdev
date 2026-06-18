import { motion } from 'framer-motion'
import { CLIENTES } from '../../data/clientes'
import type { Cliente } from '../../data/clientes'

const CLIENTES_LOOP = [...CLIENTES, ...CLIENTES]

export default function Clientes() {
  return (
    <section id="clientes" className="py-24 bg-[#0a0a0a] overflow-hidden">
      <div className="max-w-6xl mx-auto px-6 mb-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          
          <h2 className="text-3xl md:text-5xl font-bold">Nuestros Clientes</h2>
          <p className="text-white/50 mt-3 text-sm">
            Trabajamos con negocios reales que hoy están en producción.
          </p>
        </motion.div>
      </div>

      <div className="relative">
        <div className="absolute left-0 top-0 bottom-0 w-24 bg-gradient-to-r from-[#0a0a0a] to-transparent z-10 pointer-events-none" />
        <div className="absolute right-0 top-0 bottom-0 w-24 bg-gradient-to-l from-[#0a0a0a] to-transparent z-10 pointer-events-none" />

        <div
          className="flex gap-5 animate-marquee"
          style={{ width: 'max-content' }}
        >
          {CLIENTES_LOOP.map((cliente, i) => (
            <ClienteMarqueeCard key={`${cliente.id}-${i}`} cliente={cliente} />
          ))}
        </div>
      </div>
    </section>
  )
}

function ClienteMarqueeCard({ cliente }: { cliente: Cliente }) {
  return (
    <div className="flex-shrink-0 w-56 bg-white/[0.03] border border-white/[0.08] rounded-xl p-5 hover:border-[#D32F2F]/30 transition-all duration-300 hover:-translate-y-1">
      <div className="w-12 h-12 rounded-lg overflow-hidden mb-4 flex items-center justify-center">
        {cliente.logo ? (
          <div className="w-full h-full bg-white/5 flex items-center justify-center p-1">
            <img
              src={cliente.logo}
              alt={cliente.nombre}
              loading="lazy"
              decoding="async"
              className="w-full h-full object-contain"
            />
          </div>
        ) : (
          <div className="w-full h-full bg-[#D32F2F] flex items-center justify-center">
            <span className="font-bold text-sm text-white">{cliente.iniciales ?? ''}</span>
          </div>
        )}
      </div>

      <h3 className="font-bold text-sm text-white mb-1 leading-tight">{cliente.nombre}</h3>
      <span className="inline-block text-[10px] font-medium text-[#D32F2F] bg-[#D32F2F]/10 border border-[#D32F2F]/20 rounded-full px-2 py-0.5 mb-3">
        {cliente.rubro}
      </span>
      <p className="text-[11px] text-white/40 leading-relaxed line-clamp-3">{cliente.desc}</p>
    </div>
  )
}
