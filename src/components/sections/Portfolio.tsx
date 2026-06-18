import { useRef } from 'react'
import { motion } from 'framer-motion'
import PortfolioCard from '../ui/PortfolioCard'
import { PROYECTOS } from '../../data/portfolio'

export default function Portfolio() {
  const constraintsRef = useRef<HTMLDivElement>(null)

  return (
    <section id="portfolio" className="py-24 bg-[#0a0a0a] overflow-hidden">
      <div className="max-w-6xl mx-auto px-6 mb-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <h2 className="text-3xl md:text-5xl font-bold">Proyectos</h2>
        </motion.div>
      </div>

      <div
        ref={constraintsRef}
        className="overflow-hidden cursor-grab active:cursor-grabbing"
      >
        <motion.div
          drag="x"
          dragConstraints={constraintsRef}
          dragElastic={0.1}
          className="flex gap-6 px-6 md:px-12 w-max pb-4"
        >
          {PROYECTOS.map((proyecto, i) => (
            <motion.div
              key={proyecto.id}
              initial={{ opacity: 0, x: 40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
            >
              <PortfolioCard proyecto={proyecto} />
            </motion.div>
          ))}
        </motion.div>
      </div>

      <div className="max-w-6xl mx-auto px-6 mt-4">
        <p className="text-white/20 text-xs font-mono">← arrastrá para ver más</p>
      </div>
    </section>
  )
}
