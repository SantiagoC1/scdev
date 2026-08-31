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
  tailwindcss: 'Tailwind CSS',
  docker: 'Docker',
  nextjs: 'Next.js',
  git: 'Git',
  n8n: 'n8n',
  node: 'nodejs'
}

// n8n no tiene devicon oficial: usamos el avatar del org en GitHub
const N8N_ICON = 'https://avatars.githubusercontent.com/u/45487711?s=200&v=4'

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

function StackIcon({ tech }: { tech: string }) {
  const label = DEVICON_LABELS[tech] ?? tech
  return (
    <div
      title={label}
      className="w-7 h-7 flex items-center justify-center"
    >
      <img
        src={tech === 'n8n' ? N8N_ICON : deviconUrl(tech)}
        alt={label}
        loading="lazy"
        decoding="async"
        width={28}
        height={28}
        className={`w-full h-full object-contain${tech === 'n8n' ? ' rounded' : ''}`}
      />
    </div>
  )
}

export default function EquipoCard({ integrante }: { integrante: Integrante }) {
  const { foto, linkedin, nombre, rol, stack } = integrante

  const contenido = (
    <>
      {foto ? (
        <img
          src={foto}
          alt={nombre}
          loading="lazy"
          decoding="async"
          className="absolute inset-0 w-full h-full object-cover object-top grayscale group-hover:grayscale-0 transition-[filter] duration-[400ms] ease-out"
        />
      ) : (
        <>
          <div className="absolute inset-0 bg-gradient-to-br from-[#1e1e1e] to-[#2d2d2d]" />
          <div className="absolute inset-0 flex items-center justify-center">
            <span
              className="font-display font-bold text-white/25 leading-none"
              style={{ fontSize: '3rem' }}
            >
              {iniciales(nombre)}
            </span>
          </div>
          <span className="absolute top-3 right-3 rounded-full bg-[#D32F2F] text-white text-[10px] font-medium px-2.5 py-1 leading-none">
            Próximamente
          </span>
        </>
      )}

      {/* Overlay para legibilidad del texto */}
      <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-[#000000e6] via-[#00000090] to-transparent" />

      <div className="absolute inset-x-0 bottom-0 p-4">
        <h3 className="font-display font-bold text-white leading-tight">{nombre}</h3>
        <p className="text-xs text-[#D32F2F] mt-0.5">{rol}</p>
      </div>
    </>
  )

  const claseCard =
    'group relative block aspect-[3/4] w-full overflow-hidden rounded-2xl bg-[#1e1e1e] border border-white/[0.08]'

  return (
    <motion.div variants={equipoCardVariants} className="flex flex-col gap-3">
      {linkedin ? (
        <a
          href={linkedin}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={`LinkedIn de ${nombre}`}
          className={`${claseCard} cursor-pointer`}
        >
          {contenido}
        </a>
      ) : (
        <div className={claseCard}>{contenido}</div>
      )}

      {stack.length > 0 && (
        <div className="flex flex-wrap items-center gap-2.5 px-1">
          {stack.map((tech) => (
            <StackIcon key={tech} tech={tech} />
          ))}
        </div>
      )}
    </motion.div>
  )
}
