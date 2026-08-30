import { motion } from 'framer-motion'
import { EQUIPO } from '../../data/equipo'
import EquipoCard, { equipoGridVariants } from '../ui/EquipoCard'

export default function Nosotros() {
  return (
    <section id="nosotros" className="py-24 bg-[#111111]">
      <div className="max-w-6xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-16"
        >
          <p className="font-mono text-[#D32F2F] text-sm mb-3">El equipo</p>
          <h2 className="text-3xl md:text-5xl font-bold">Las personas detrás del código</h2>
          <p className="text-white/50 mt-4 max-w-xl">
            Un equipo de La Plata construyendo soluciones reales para negocios reales.
          </p>
        </motion.div>

        <motion.div
          variants={equipoGridVariants}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          className="grid grid-cols-1 md:grid-cols-2 gap-6"
        >
          {EQUIPO.map((integrante) => (
            <EquipoCard key={integrante.id} integrante={integrante} />
          ))}
        </motion.div>
      </div>
    </section>
  )
}
