import { motion } from 'framer-motion'
import { useModal } from '../../context/ModalContext'
import { useConfig } from '../../context/ConfigContext'
import { buildWALink } from '../../hooks/useSheetConfig'

export default function CtaFinal() {
  const { openContact } = useModal()
  const config = useConfig()
  const waLink = buildWALink(config.whatsapp_number, config.whatsapp_default_text)

  return (
    <section id="cta" className="relative overflow-hidden py-32">
      <div className="absolute inset-0 bg-[#080808]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_50%,rgba(211,47,47,0.12),transparent_70%)]" />

      <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none overflow-hidden">
        <span
          className="font-display font-black leading-none text-white/[0.03] whitespace-nowrap"
          style={{ fontSize: 'clamp(80px, 18vw, 220px)' }}
        >
          scdev
        </span>
      </div>

      <div className="relative max-w-4xl mx-auto px-6 text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <p className="font-mono text-[#D32F2F] text-xs tracking-widest uppercase mb-8">
            — Hablemos
          </p>

          <h2
            className="font-display font-black leading-[0.95] mb-10 text-white"
            style={{ fontSize: 'clamp(2.8rem, 8vw, 6rem)' }}
          >
            ¿Listo para{' '}
            <span className="block text-[#D32F2F]">digitalizar tu negocio?</span>
          </h2>

          <p className="text-white/40 text-base mb-12 max-w-md mx-auto">
            Respondemos en menos de 24 horas hábiles.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => openContact()}
              className="w-full sm:w-auto px-10 py-4 bg-[#D32F2F] text-white font-display font-bold text-lg rounded-full shadow-[0_0_40px_rgba(211,47,47,0.4)] hover:shadow-[0_0_60px_rgba(211,47,47,0.6)] transition-all duration-300"
            >
              Empezar proyecto →
            </motion.button>

            <motion.a
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              href={waLink}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto text-center px-10 py-4 border border-white/15 text-white/70 font-display font-semibold text-lg rounded-full hover:border-white/30 hover:text-white transition-all duration-300"
            >
              Escribir por WhatsApp
            </motion.a>
          </div>

          <div className="mt-16 flex flex-col sm:flex-row items-center justify-center gap-6 text-sm text-white/30">
            {config.email && (
              <a
                href={`mailto:${config.email}`}
                className="hover:text-white/60 transition-colors flex items-center gap-2"
              >
                <span className="w-1 h-1 rounded-full bg-[#D32F2F]" />
                {config.email}
              </a>
            )}
            {config.instagram_url && (
              <a
                href={config.instagram_url}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-white/60 transition-colors flex items-center gap-2"
              >
                <span className="w-1 h-1 rounded-full bg-[#D32F2F]" />
                @scdev.ar
              </a>
            )}
          </div>
        </motion.div>
      </div>
    </section>
  )
}
