import { motion } from 'framer-motion'
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

// Variants compartidos: el contenedor va en la seccion que renderiza el grid
export const equipoGridVariants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.12 } },
}

export const equipoCardVariants = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5 } },
}

export default function EquipoCard({ integrante }: { integrante: Integrante }) {
  const enConstruccion = integrante.stack.length === 0
  const stackVisible = integrante.stack.slice(0, MAX_STACK_VISIBLE)
  const restantes = integrante.stack.length - stackVisible.length

  return (
    <motion.div
      variants={equipoCardVariants}
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
            {restantes > 0 && <span className="text-xs text-white/30">+{restantes}</span>}
          </div>
        )}
      </div>
    </motion.div>
  )
}
