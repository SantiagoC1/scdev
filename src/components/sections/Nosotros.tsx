import { motion } from 'framer-motion'
import { EQUIPO } from '../../data/equipo'
import type { Integrante } from '../../data/equipo'

const DEVICON_LABELS: Record<string, string> = {
  react: 'React',
  python: 'Python',
  fastapi: 'FastAPI',
  typescript: 'TypeScript',
  postgresql: 'PostgreSQL',
  supabase: 'Supabase',
  java: 'Java',
  javascript: 'JavaScript',
  html5: 'HTML5',
  css3: 'CSS3',
}

const MAX_STACK_VISIBLE = 6

const deviconUrl = (nombre: string) =>
  `https://cdn.jsdelivr.net/gh/devicons/devicon/icons/${nombre}/${nombre}-original.svg`

const iniciales = (nombre: string) =>
  nombre
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((parte) => parte[0])
    .join('')
    .toUpperCase()

const contenedor = {
  hidden: {},
  show: { transition: { staggerChildren: 0.12 } },
}

const tarjeta = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5 } },
}

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
          variants={contenedor}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          className="grid grid-cols-1 md:grid-cols-2 gap-6"
        >
          {EQUIPO.map((integrante) => (
            <IntegranteCard key={integrante.id} integrante={integrante} />
          ))}
        </motion.div>
      </div>
    </section>
  )
}

function IntegranteCard({ integrante }: { integrante: Integrante }) {
  const enConstruccion = integrante.stack.length === 0
  const stackVisible = integrante.stack.slice(0, MAX_STACK_VISIBLE)
  const restantes = integrante.stack.length - stackVisible.length

  return (
    <motion.div
      variants={tarjeta}
      className="flex gap-5 bg-white/[0.03] border border-white/[0.08] rounded-2xl p-6 hover:border-[#D32F2F]/30 transition-all duration-300"
    >
      <div className="flex-shrink-0">
        {integrante.foto ? (
          <img
            src={integrante.foto}
            alt={integrante.nombre}
            loading="lazy"
            decoding="async"
            width={80}
            height={80}
            className="w-20 h-20 rounded-full object-cover object-top bg-[#2D2D2D]"
          />
        ) : (
          <div className="w-20 h-20 rounded-full bg-[#2D2D2D] flex items-center justify-center">
            <span className="font-display font-bold text-lg text-white">
              {iniciales(integrante.nombre)}
            </span>
          </div>
        )}
      </div>

      <div className="flex flex-col gap-2 min-w-0">
        <div>
          <h3 className="font-display font-bold text-white leading-tight">{integrante.nombre}</h3>
          <p className="text-sm text-[#D32F2F]">{integrante.rol}</p>
        </div>

        {enConstruccion ? (
          <span className="text-xs text-white/30">Perfil en construcción</span>
        ) : (
          <p className="text-white/50 text-sm leading-relaxed">{integrante.descripcion}</p>
        )}

        {stackVisible.length > 0 && (
          <div className="flex flex-wrap items-center gap-2 mt-1">
            {stackVisible.map((tech) => (
              <div
                key={tech}
                title={DEVICON_LABELS[tech] ?? tech}
                className="w-8 h-8 flex items-center justify-center bg-white/5 rounded-lg p-1.5"
              >
                <img
                  src={deviconUrl(tech)}
                  alt={DEVICON_LABELS[tech] ?? tech}
                  loading="lazy"
                  decoding="async"
                  width={20}
                  height={20}
                  className="w-full h-full object-contain"
                />
              </div>
            ))}
            {restantes > 0 && (
              <span className="text-xs text-white/30">+{restantes}</span>
            )}
          </div>
        )}
      </div>
    </motion.div>
  )
}
