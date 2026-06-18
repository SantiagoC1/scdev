import { motion } from 'framer-motion'

const DEVICONS = [
  { name: 'React', icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/react/react-original.svg' },
  { name: 'TypeScript', icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/typescript/typescript-original.svg' },
  { name: 'Python', icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/python/python-original.svg' },
  { name: 'FastAPI', icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/fastapi/fastapi-original.svg' },
  { name: 'C#', icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/csharp/csharp-original.svg' },
  { name: 'Java', icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/java/java-original.svg' },
  { name: 'PostgreSQL', icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/postgresql/postgresql-original.svg' },
  { name: 'JavaScript', icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/javascript/javascript-original.svg' },
  { name: 'Tailwind', icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/tailwindcss/tailwindcss-original.svg' },
  { name: 'Git', icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/git/git-original.svg' },
  { name: 'Figma', icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/figma/figma-original.svg' },
  { name: 'Supabase', icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/supabase/supabase-original.svg' },
]

const BADGES = [
  'UNLP — Lic. en Sistemas',
  'La Plata / Ensenada',
  'Proyectos en producción',
  'Alianza con Balance Agency',
]

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
          <h2 className="text-3xl md:text-5xl font-bold">Nosotros</h2>
        </motion.div>

       <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
  <motion.div
    initial={{ opacity: 0, x: -30 }}
    whileInView={{ opacity: 1, x: 0 }}
    viewport={{ once: true }}
    transition={{ duration: 0.6 }}
  >
    <div className="flex flex-col md:flex-row items-start gap-10">
      {/* Foto suelta — sin card ni recuadro */}
      <div className="relative flex-shrink-0 group mx-auto md:mx-0">
        <img
          src="/images/SantaigoCaceres.png"
          alt="Santiago Cáceres — Fundador SCdev"
          className="w-48 md:w-56 object-contain object-bottom grayscale mix-blend-luminosity transition-all duration-500 group-hover:grayscale-0 group-hover:mix-blend-normal drop-shadow-[0_20px_40px_rgba(211,47,47,0.15)] group-hover:drop-shadow-[0_20px_60px_rgba(211,47,47,0.35)] [-webkit-mask-image:linear-gradient(to_bottom,black_70%,transparent_100%)] [mask-image:linear-gradient(to_bottom,black_70%,transparent_100%)]"
        />
      </div>

      {/* Texto */}
      <div className="flex flex-col gap-5">
        <div>
          <h3 className="text-xl font-bold text-white mb-1">Santiago Cáceres</h3>
          <p className="text-sm text-[#D32F2F] font-mono">Founder & Dev Lead · SCdev</p>
        </div>
        <p className="text-white/60 text-sm leading-relaxed">
          Desarrollador web y estudiante avanzado de Licenciatura en Sistemas en la{' '}
          <strong className="text-white">UNLP</strong>. Construyo soluciones digitales para
          negocios argentinos desde La Plata.
        </p>
        <p className="text-white/60 text-sm leading-relaxed">
          Especializado en React, TypeScript y Python. Trabajo tanto en el frontend como en
          el backend, desde landing pages hasta sistemas complejos con lógica de negocio.
        </p>
        <div className="flex flex-wrap gap-2 mt-2">
          {BADGES.map((b) => (
            <span
              key={b}
              className="text-xs px-3 py-1 rounded-full border border-[#D32F2F]/25 text-[#D32F2F]"
              style={{ background: 'rgba(211, 47, 47, 0.08)' }}
            >
              {b}
            </span>
          ))}
        </div>
      </div>
    </div>
  </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <div className="grid grid-cols-3 md:grid-cols-4 gap-6">
              {DEVICONS.map((dev, i) => (
                <motion.div
                  key={dev.name}
                  initial={{ opacity: 0, scale: 0.8 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.04 }}
                  whileHover={{ scale: 1.15 }}
                  className="flex flex-col items-center gap-2"
                >
                  <div className="w-12 h-12 flex items-center justify-center bg-white/5 rounded-xl p-2.5">
                    <img
                      src={dev.icon}
                      alt={dev.name}
                      loading="lazy"
                      decoding="async"
                      width={32}
                      height={32}
                      className="w-full h-full object-contain"
                    />
                  </div>
                  <span className="text-xs text-white/40">{dev.name}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
