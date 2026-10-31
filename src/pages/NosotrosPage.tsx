import { useEffect } from 'react'
import { track } from '../utils/track'
import { MessageCircle, FileText, Handshake, Code2, PackageCheck } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import Navbar from '../components/layout/Navbar'
import Footer from '../components/layout/Footer'
import PageMeta from '../components/ui/PageMeta'
import EquipoCard from '../components/ui/EquipoCard'
import { EQUIPO } from '../data/equipo'
import { SITE_URL } from '../constants'
import { useConfig } from '../context/ConfigContext'
import { useModal } from '../context/ModalContext'
import { buildWALink } from '../hooks/useSheetConfig'

const PROCESO: { icono: LucideIcon; titulo: string; desc: string }[] = [
  {
    icono: MessageCircle,
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
    icono: Code2,
    titulo: 'Desarrollo con avances',
    desc: 'Trabajamos por etapas y cada etapa tiene su reunión de revisión, así siempre sabés cómo viene tu proyecto.',
  },
  {
    icono: PackageCheck,
    titulo: 'Entrega',
    desc: 'Reunión final: te mostramos el resultado terminado y te entregamos el software.',
  },
]

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
        title="Nosotros | SCdev"
        description="Conocé al equipo de SCdev: cuatro personas en La Plata que construyen sitios web y sistemas a medida para negocios argentinos, con un proceso claro de punta a punta."
        canonical={`${SITE_URL}/nosotros`}
      />
      <Navbar />
      <main id="contenido" tabIndex={-1} className="pt-24 md:pt-26">
        {/* 1 — Hero */}
        <section className="bg-[#121212] pt-12 pb-10 md:pt-14 md:pb-12">
          <div className="max-w-6xl mx-auto px-6">
            <div>
              <p className="text-sm text-white/60 mb-3">Sobre nosotros</p>
              <h1
                className="font-bold leading-[1.1] mb-4"
                style={{ fontSize: 'clamp(1.9rem, 4.2vw, 3rem)' }}
              >
                Código que funciona.
                <span className="block">Equipo que responde.</span>
              </h1>
              <p className="text-white/70 text-base md:text-lg max-w-2xl leading-relaxed">
                Somos una agencia chica de La Plata. Tomamos pocos proyectos a la vez porque
                preferimos hacer bien cada uno antes que entregar muchos a medias.
              </p>
            </div>
          </div>
        </section>

        {/* 2 — El equipo */}
        <section className="bg-[#121212] pb-16 md:pb-20">
          <div className="max-w-6xl mx-auto px-6">
            <h2 className="text-2xl md:text-3xl font-bold mb-6 md:mb-8">
              El equipo
            </h2>
            <div
              className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6"
            >
              {EQUIPO.map((integrante) => (
                <EquipoCard key={integrante.id} integrante={integrante} />
              ))}
            </div>
          </div>
        </section>

        {/* 3 — La historia */}
        <section className="bg-[#0a0a0a] py-24">
          <div className="max-w-3xl mx-auto px-6">
            <h2 className="text-3xl md:text-4xl font-bold mb-8">
              Por qué existe SCdev
            </h2>
            <div className="flex flex-col gap-5 text-white/60 leading-relaxed">
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
            </div>
          </div>
        </section>

        {/* 4 — El proceso */}
        <section className="bg-[#1a1a1a] py-24">
          <div className="max-w-6xl mx-auto px-6">
            <div className="mb-14">
              <h2 className="text-3xl md:text-4xl font-bold mb-3">El proceso</h2>
              <p className="text-white/50">Sin sorpresas. Así trabajamos con cada cliente.</p>
            </div>

            {/* Mobile: fila con scroll snap · Desktop: grilla 3+2 sobre 6 columnas */}
            <div tabIndex={0} role="region" aria-label="Pasos del proceso" className="flex gap-4 overflow-x-auto snap-x snap-mandatory pb-4 -mx-6 px-6 lg:mx-0 lg:px-0 lg:pb-0 lg:overflow-visible lg:grid lg:grid-cols-6 lg:gap-6">
              {PROCESO.map((paso, i) => {
                const Icono = paso.icono
                // en la grilla de 6 columnas cada card ocupa 2: 3 arriba, 2 centradas abajo
                const colSpan = i === 3 ? 'lg:col-span-2 lg:col-start-2' : 'lg:col-span-2'
                // conector solo entre cards de la misma fila
                const conector = i === 0 || i === 1 || i === 3

                return (
                  <div
                    key={paso.titulo}
                    className={`relative snap-start shrink-0 w-[270px] lg:w-auto lg:shrink ${colSpan}`}
                  >
                    <div className="group relative h-full overflow-hidden rounded-2xl bg-[#111111] border border-white/[0.08] p-6 text-center transition-colors duration-300 hover:border-[#D32F2F]/25">
                      {/* Numero watermark */}
                      <span
                        className="pointer-events-none select-none absolute -top-2 right-2 font-display font-black leading-none text-white/[0.03]"
                        style={{ fontSize: '5rem' }}
                      >
                        {i + 1}
                      </span>

                      <div className="relative flex flex-col items-center gap-3">
                        <Icono size={28} className="text-white/70" strokeWidth={1.5} />
                        <h3 className="font-display font-bold text-white">{paso.titulo}</h3>
                        <p className="text-white/50 text-sm leading-relaxed">{paso.desc}</p>
                      </div>
                    </div>

                    {conector && (
                      <span
                        aria-hidden
                        className="hidden lg:block absolute top-1/2 left-full w-6 border-t border-dashed border-white/15"
                      />
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        </section>

        {/* 5 — CTA final */}
        <section className="bg-[#D32F2F] py-24">
          <div className="max-w-3xl mx-auto px-6 text-center">
            <div>
              <h2 className="text-3xl md:text-5xl font-bold mb-4 text-white">
                ¿Tenés un proyecto en mente?
              </h2>
              <p className="text-white mb-10">
                Contanos qué necesitás. La primera reunión no tiene costo.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <a
                  href={waLink}
                  onClick={() => track({ event: 'cta_whatsapp_click', location: 'nosotros' })}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full sm:w-auto text-center bg-white text-[#B71C1C] px-8 py-4 rounded-lg font-semibold hover:bg-white/90 transition-all"
                >
                  Escribinos por WhatsApp
                </a>
                <button
                  onClick={() => openContact()}
                  className="w-full sm:w-auto border border-white/50 text-white px-8 py-4 rounded-lg font-semibold hover:bg-white/10 transition-all"
                >
                  Formulario de contacto
                </button>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}
