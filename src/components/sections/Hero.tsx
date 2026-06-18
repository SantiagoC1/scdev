import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import ParticlesBackground from '../ui/ParticlesBackground'
import { useConfig } from '../../context/ConfigContext'
import { buildWALink } from '../../hooks/useSheetConfig'

const TYPEWRITER_TEXTS = [
  'desarrollo web profesional',
  'automatización e IA',
  'sistemas a medida',
]

export default function Hero() {
  const [currentIdx, setCurrentIdx] = useState(0)
  const [displayText, setDisplayText] = useState('')
  const [isDeleting, setIsDeleting] = useState(false)
  const config = useConfig()
  const waLink = buildWALink(config.whatsapp_number, config.whatsapp_default_text)

  useEffect(() => {
    const target = TYPEWRITER_TEXTS[currentIdx]
    let timeout: ReturnType<typeof setTimeout>

    if (!isDeleting && displayText === target) {
      timeout = setTimeout(() => setIsDeleting(true), 2000)
    } else if (isDeleting && displayText === '') {
      setIsDeleting(false)
      setCurrentIdx((prev) => (prev + 1) % TYPEWRITER_TEXTS.length)
    } else {
      timeout = setTimeout(
        () => {
          setDisplayText(
            isDeleting
              ? target.slice(0, displayText.length - 1)
              : target.slice(0, displayText.length + 1),
          )
        },
        isDeleting ? 50 : 100,
      )
    }

    return () => clearTimeout(timeout)
  }, [displayText, isDeleting, currentIdx])

  return (
    <section
      id="hero"
      className="relative min-h-screen flex items-center justify-center overflow-hidden"
    >
      <ParticlesBackground />

      <div className="relative z-10 max-w-6xl mx-auto px-6 pt-24 pb-16">
        

        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="font-bold leading-tight mb-4"
          style={{ fontSize: 'clamp(2rem, 7vw, 5rem)' }}
        >
          Transformamos tu negocio en{' '}
          <span className="text-[#D32F2F]">presencia digital</span>
        </motion.h1>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-xl md:text-2xl text-white/60 font-mono mb-6 h-8"
        >
          <span className="text-[#D32F2F]">&gt;</span> {displayText}
          <span className="animate-pulse">|</span>
        </motion.div>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="text-white/60 text-lg max-w-2xl mb-10 leading-relaxed"
        >
          Somos <strong className="text-white">SCdev</strong>, agencia de desarrollo web en{' '}
          <strong className="text-white">La Plata</strong>. Diseñamos y programamos soluciones
          digitales para profesionales, comercios y empresas en Argentina.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="flex flex-col sm:flex-row gap-3"
        >
          <a
            href={waLink}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full sm:w-auto text-center bg-[#D32F2F] text-white px-8 py-4 rounded-xl font-semibold hover:bg-[#B71C1C] transition-all duration-200 shadow-[0_4px_30px_rgba(211,47,47,0.4)] hover:shadow-[0_4px_40px_rgba(211,47,47,0.5)]"
          >
            Cotizar por WhatsApp
          </a>
          <a
            href="#servicios"
            className="w-full sm:w-auto text-center border border-white/20 text-white px-8 py-4 rounded-xl font-semibold hover:bg-white/5 transition-all duration-200"
          >
            Ver Servicios
          </a>
          <a
            href="#portfolio"
            className="w-full sm:w-auto text-center border border-white/20 text-white px-8 py-4 rounded-xl font-semibold hover:bg-white/5 transition-all duration-200"
          >
            Ver Trabajos
          </a>
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-white/30"
      >
        <span className="text-xs font-mono">scroll</span>
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ repeat: Infinity, duration: 1.5 }}
          className="w-0.5 h-8 bg-gradient-to-b from-white/30 to-transparent"
        />
      </motion.div>
    </section>
  )
}
