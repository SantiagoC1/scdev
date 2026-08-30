import { useEffect } from 'react'
import { motion } from 'framer-motion'
import { MessageSquare, FileText, Handshake, Code, CheckCircle } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import Navbar from '../components/layout/Navbar'
import Footer from '../components/layout/Footer'
import PageMeta from '../components/ui/PageMeta'
import EquipoCard, { equipoGridVariants } from '../components/ui/EquipoCard'
import { EQUIPO } from '../data/equipo'
import { SITE_URL } from '../constants'
import { useConfig } from '../context/ConfigContext'
import { useModal } from '../context/ModalContext'
import { buildWALink } from '../hooks/useSheetConfig'

const STATS = [
  { unidad: 'proyectos', valor: '10', label: 'de experiencia total' },
  { unidad: 'clientes', valor: '6', label: 'activos hoy' },
  { unidad: 'personas', valor: '4', label: 'en el equipo' },
]

const PROCESO: { icono: LucideIcon; titulo: string; desc: string }[] = [
  {
    icono: MessageSquare,
    titulo: 'Primera reunión',
    desc: 'Escuchamos qué necesitás y qué querés lograr. Sin apuro y sin tecnicismos.',
  },
  {
    icono: FileText,
    titulo: 'Demo y presupuesto',
    desc: 'Armamos un presupuesto claro y, cuando aplica, una demo funcional para que veas cómo quedaría tu producto antes de comprometerte. Nada de números de aire.',
  },
  {
    icono: Handshake,
    titulo: 'Segunda reunión',
    desc: 'Afinamos detalles, acordamos el alcance y arrancamos.',
  },
  {
    icono: Code,
    titulo: 'Desarrollo con avances',
    desc: 'Trabajamos por etapas y cada etapa tiene su reunión de revisión, así siempre sabés cómo viene tu proyecto.',
  },
  {
    icono: CheckCircle,
    titulo: 'Entrega',
    desc: 'Reunión final: te mostramos el resultado terminado y te entregamos el software.',
  },
]

const fadeInUp = {
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.5 },
}

export default function NosotrosPage() {
  const config = useConfig()
  const { openContact } = useModal()
  const waLink = buildWALink(config.whatsapp_number, config.whatsapp_default_text)

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' })
  }, [])

  return (
    <>
      <PageMeta
        title="Nosotros — SCdev"
        description="Conocé al equipo de SCdev: cuatro personas en La Plata que construyen sitios web y sistemas a medida para negocios argentinos, con un proceso claro de punta a punta."
        canonical={`${SITE_URL}/nosotros`}
      />
      <Navbar />
      <main className="pt-24 md:pt-26">
        {/* 1 — Hero */}
        <section className="bg-[#121212] py-24 md:py-32">
          <div className="max-w-4xl mx-auto px-6">
            <motion.div {...fadeInUp}>
              <p className="font-mono text-[#D32F2F] text-sm mb-4">Sobre nosotros</p>
              <h1
                className="font-bold leading-[1.05] mb-6"
                style={{ fontSize: 'clamp(2.4rem, 6vw, 4.5rem)' }}
              >
                Código que funciona.
                <span className="block text-[#D32F2F]">Equipo que responde.</span>
              </h1>
              <p className="text-white/60 text-lg max-w-2xl leading-relaxed">
                Somos una agencia chica de La Plata. Tomamos pocos proyectos a la vez porque
                preferimos hacer bien cada uno antes que entregar muchos a medias.
              </p>

              <div className="flex flex-wrap gap-10 md:gap-16 mt-14">
                {STATS.map((stat) => (
                  <div key={stat.unidad}>
                    <div className="font-display font-bold text-3xl md:text-4xl text-white">
                      {stat.valor} <span className="text-[#D32F2F]">{stat.unidad}</span>
                    </div>
                    <div className="text-white/40 text-sm mt-1">{stat.label}</div>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </section>

        {/* 2 — La historia */}
        <section className="bg-[#0a0a0a] py-24">
          <div className="max-w-3xl mx-auto px-6">
            <motion.h2 {...fadeInUp} className="text-3xl md:text-4xl font-bold mb-8">
              Por qué existe SCdev
            </motion.h2>
            <motion.div {...fadeInUp} className="flex flex-col gap-5 text-white/60 leading-relaxed">
              <p>
                SCdev nació por una idea bastante simple: que cada cliente reciba un servicio de
                calidad real y no un template con el logo cambiado. Suena obvio, pero es
                justamente lo que más cuesta encontrar cuando salís a buscar quién te haga la web.
              </p>
              <p>
                Arrancar costó. Había miedo, había incertidumbre y había mil razones para dejarlo
                para más adelante. Igual dimos el paso, y hoy podemos decir tranquilos que fue lo
                mejor que nos pasó.
              </p>
              <p>
                Hoy SCdev es donde ponemos en práctica todo lo que venimos aprendiendo y donde
                construimos experiencia de verdad. Una agencia chica que trabaja en serio, con
                clientes reales y proyectos andando en producción.
              </p>
            </motion.div>
          </div>
        </section>

        {/* 3 — El proceso */}
        <section className="bg-[#1a1a1a] py-24">
          <div className="max-w-4xl mx-auto px-6">
            <motion.div {...fadeInUp} className="mb-14">
              <h2 className="text-3xl md:text-4xl font-bold mb-3">El proceso</h2>
              <p className="text-white/50">Sin sorpresas. Así trabajamos con cada cliente.</p>
            </motion.div>

            <div className="flex flex-col gap-4">
              {PROCESO.map((paso, i) => {
                const Icono = paso.icono
                return (
                  <motion.div
                    key={paso.titulo}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: i * 0.08 }}
                    className="flex gap-5 bg-white/[0.03] border border-white/[0.08] rounded-2xl p-6"
                  >
                    <div className="flex-shrink-0 flex flex-col items-center gap-3">
                      <div className="w-11 h-11 rounded-xl bg-[#D32F2F]/10 border border-[#D32F2F]/20 flex items-center justify-center">
                        <Icono size={20} className="text-[#D32F2F]" strokeWidth={1.5} />
                      </div>
                      <span className="font-mono text-xs text-white/25">
                        {String(i + 1).padStart(2, '0')}
                      </span>
                    </div>
                    <div>
                      <h3 className="font-display font-bold text-white mb-2">{paso.titulo}</h3>
                      <p className="text-white/50 text-sm leading-relaxed">{paso.desc}</p>
                    </div>
                  </motion.div>
                )
              })}
            </div>
          </div>
        </section>

        {/* 4 — El equipo */}
        <section className="bg-[#121212] py-24">
          <div className="max-w-6xl mx-auto px-6">
            <motion.h2 {...fadeInUp} className="text-3xl md:text-4xl font-bold mb-14">
              El equipo
            </motion.h2>
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

        {/* 5 — CTA final */}
        <section className="bg-[#D32F2F] py-24">
          <div className="max-w-3xl mx-auto px-6 text-center">
            <motion.div {...fadeInUp}>
              <h2 className="text-3xl md:text-5xl font-bold mb-4 text-white">
                ¿Tenés un proyecto en mente?
              </h2>
              <p className="text-white/80 mb-10">
                Contanos qué necesitás. La primera reunión no tiene costo.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <a
                  href={waLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full sm:w-auto text-center bg-white text-[#B71C1C] px-8 py-4 rounded-xl font-semibold hover:bg-white/90 transition-all"
                >
                  Escribinos por WhatsApp
                </a>
                <button
                  onClick={() => openContact()}
                  className="w-full sm:w-auto border border-white/50 text-white px-8 py-4 rounded-xl font-semibold hover:bg-white/10 transition-all"
                >
                  Formulario de contacto
                </button>
              </div>
            </motion.div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}
