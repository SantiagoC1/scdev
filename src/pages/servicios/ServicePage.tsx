import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  Palette, Smartphone, MessageCircle, FileText, Rocket, Zap,
  Sparkles, BarChart2, Search, TrendingUp, Database, Settings,
  Monitor, BookOpen, ClipboardList, File, RefreshCw, Mail, GraduationCap,
  Globe, Building2, Bot,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import Navbar from '../../components/layout/Navbar'
import Footer from '../../components/layout/Footer'
import type { Servicio } from '../../data/servicios'
import { useConfig } from '../../context/ConfigContext'
import { formatPrice, buildWALink } from '../../hooks/useSheetConfig'
import type { SheetConfig } from '../../hooks/useSheetConfig'
import { useModal } from '../../context/ModalContext'
const INCLUDE_ICON_MAP: Record<string, LucideIcon> = {
  Palette, Smartphone, MessageCircle, FileText, Rocket, Zap,
  Sparkles, BarChart2, Search, TrendingUp, Database, Settings,
  Monitor, BookOpen, ClipboardList, File, RefreshCw, Mail, GraduationCap,
  Globe, Building2, Bot,
}

const PRICE_MAP: Record<string, { min: keyof SheetConfig; max: keyof SheetConfig }> = {
  'presencia-web-esencial':   { min: 'price_esencial_min',       max: 'price_esencial_max' },
  'landing-page-profesional': { min: 'price_landing_min',        max: 'price_landing_max' },
  'sitio-web-corporativo':    { min: 'price_corporativo_min',    max: 'price_corporativo_max' },
  'sistema-a-medida':         { min: 'price_sistema_min',        max: 'price_sistema_max' },
  'automatizacion-whatsapp':  { min: 'price_automatizacion_min', max: 'price_automatizacion_max' },
}

interface Props {
  servicio: Servicio
}

export default function ServicePage({ servicio }: Props) {
  const config = useConfig()
  const { openContact } = useModal()
  const keys = PRICE_MAP[servicio.id]
  const precio = keys
    ? `${formatPrice(config[keys.min])} – ${formatPrice(config[keys.max])}`
    : servicio.precio
  const waLink = buildWALink(config.whatsapp_number, servicio.waText)

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' })
  }, [])

  return (
    <>
      <Navbar />
      <main className="pt-16 md:pt-20">
        {/* Hero */}
        <section className="pt-16 pb-16 md:pt-24 md:pb-24 bg-[#0a0a0a] relative overflow-hidden">
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background:
                'radial-gradient(ellipse at 30% 50%, rgba(211,47,47,0.06), transparent 60%)',
            }}
          />
          <div className="max-w-4xl mx-auto px-6 relative z-10">
            <Link
              to="/"
              className="inline-flex items-center gap-2 text-white/40 text-sm hover:text-white mb-8 transition-colors"
            >
              ← Volver al inicio
            </Link>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              {(() => {
                const HeroIcon = INCLUDE_ICON_MAP[servicio.iconName]
                return HeroIcon ? (
                  <div className="inline-flex items-center justify-center w-14 h-14 rounded-xl bg-[#D32F2F]/10 border border-[#D32F2F]/20 mb-6">
                    <HeroIcon size={28} className="text-[#D32F2F]" strokeWidth={1.5} />
                  </div>
                ) : null
              })()}
              <h1 className="text-4xl md:text-6xl font-bold mb-4">{servicio.nombre}</h1>
              <p className="text-white/60 text-xl mb-8">{servicio.descripcion}</p>

              <div className="inline-flex flex-col gap-1 bg-[#D32F2F]/10 border border-[#D32F2F]/30 px-6 py-4 rounded-2xl mb-8">
                <span className="text-2xl font-bold">{precio}</span>
                <span className="text-white/40 text-sm">{servicio.precioTipo}</span>
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <a
                  href={waLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full sm:w-auto text-center bg-[#D32F2F] text-white px-8 py-4 rounded-xl font-semibold hover:bg-[#B71C1C] transition-all shadow-[0_4px_20px_rgba(211,47,47,0.3)]"
                >
                  Empezar este proyecto
                </a>
                <button
                  onClick={() => openContact(servicio.nombre)}
                  className="w-full sm:w-auto border border-white/20 text-white px-8 py-4 rounded-xl font-semibold hover:bg-white/5 transition-all"
                >
                  Formulario de contacto
                </button>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Incluye */}
        <section className="py-24 bg-[#111111]">
          <div className="max-w-6xl mx-auto px-6">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-3xl font-bold mb-12"
            >
              ¿Qué incluye?
            </motion.h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {servicio.incluye.map((item, i) => (
                <motion.div
                  key={item.titulo}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.05 }}
                  className="bg-white/[0.03] border border-white/[0.08] rounded-2xl p-6"
                >
                  {(() => {
                    const IncludeIcon = INCLUDE_ICON_MAP[item.iconName]
                    return IncludeIcon ? (
                      <IncludeIcon size={24} className="text-[#D32F2F] mb-3" strokeWidth={1.5} />
                    ) : null
                  })()}
                  <h3 className="font-bold mb-2">{item.titulo}</h3>
                  <p className="text-white/50 text-sm">{item.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Para quién / No incluye */}
        <section className="py-24 bg-[#0a0a0a]">
          <div className="max-w-6xl mx-auto px-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
              >
                <h2 className="text-3xl font-bold mb-8">¿Para quién es?</h2>
                <ul className="space-y-3">
                  {servicio.paraQuien.map((item) => (
                    <li key={item} className="flex items-start gap-3 text-white/60">
                      <span className="text-[#D32F2F] mt-1 flex-shrink-0">✓</span>
                      {item}
                    </li>
                  ))}
                </ul>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
              >
                <h2 className="text-3xl font-bold mb-8">No incluye</h2>
                <div className="bg-white/[0.03] border border-white/[0.08] rounded-2xl p-6">
                  <ul className="space-y-3">
                    {servicio.noIncluye.map((item) => (
                      <li key={item} className="flex items-start gap-3 text-white/50 text-sm">
                        <span className="text-white/30 mt-1 flex-shrink-0">✕</span>
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Proceso */}
        <section className="py-24 bg-[#111111]">
          <div className="max-w-6xl mx-auto px-6">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-3xl font-bold mb-12"
            >
              Cómo trabajamos
            </motion.h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {servicio.proceso.map((paso, i) => (
                <motion.div
                  key={paso.num}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                >
                  <div className="text-5xl font-mono font-bold text-[#D32F2F]/20 mb-3">
                    {paso.num}
                  </div>
                  <h3 className="font-bold mb-2">{paso.titulo}</h3>
                  <p className="text-white/50 text-sm">{paso.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Stack */}
        <section className="py-24 bg-[#0a0a0a]">
          <div className="max-w-6xl mx-auto px-6">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-3xl font-bold mb-12"
            >
              Tecnologías
            </motion.h2>
            <div className="flex flex-wrap gap-8">
              {servicio.stack.map((tech, i) => (
                <motion.div
                  key={tech.nombre}
                  initial={{ opacity: 0, scale: 0.8 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.06 }}
                  whileHover={{ scale: 1.1 }}
                  className="flex flex-col items-center gap-2"
                >
                  <div className="w-16 h-16 bg-white/5 rounded-2xl p-3 flex items-center justify-center">
                    <img src={tech.icono} alt={tech.nombre} loading="lazy" decoding="async" width={40} height={40} className="w-full h-full object-contain" />
                  </div>
                  <span className="text-xs text-white/40">{tech.nombre}</span>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className="py-24 bg-[#111111]">
          <div className="max-w-4xl mx-auto px-6">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-3xl font-bold mb-12"
            >
              Preguntas frecuentes
            </motion.h2>
            <div className="space-y-4">
              {servicio.faq.map((item, i) => (
                <motion.details
                  key={i}
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.05 }}
                  className="group bg-white/[0.03] border border-white/[0.08] rounded-2xl overflow-hidden"
                >
                  <summary className="px-6 py-4 cursor-pointer font-semibold text-sm list-none flex items-center justify-between hover:bg-white/5 transition-colors">
                    {item.pregunta}
                    <span className="text-[#D32F2F] ml-4 flex-shrink-0">↓</span>
                  </summary>
                  <div className="px-6 pb-4 text-white/60 text-sm leading-relaxed">
                    {item.respuesta}
                  </div>
                </motion.details>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Final */}
        <section className="py-24 bg-[#0a0a0a]">
          <div className="max-w-4xl mx-auto px-6 text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="text-3xl md:text-5xl font-bold mb-4">¿Listo para arrancar?</h2>
              <p className="text-white/50 mb-8">
                Contanos tu proyecto y te respondemos en menos de 24hs.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <a
                  href={waLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full sm:w-auto text-center bg-[#D32F2F] text-white px-8 py-4 rounded-xl font-semibold hover:bg-[#B71C1C] transition-all shadow-[0_4px_20px_rgba(211,47,47,0.3)]"
                >
                  Cotizar por WhatsApp
                </a>
                <button
                  onClick={() => openContact(servicio.nombre)}
                  className="w-full sm:w-auto border border-white/20 text-white px-8 py-4 rounded-xl font-semibold hover:bg-white/5 transition-all"
                >
                  Ir al formulario
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

