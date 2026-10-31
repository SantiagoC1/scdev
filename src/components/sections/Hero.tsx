import ParticlesBackground from '../ui/ParticlesBackground'
import HeroSelector from '../ui/HeroSelector'
import { useConfig } from '../../context/ConfigContext'
import { buildWALink } from '../../hooks/useSheetConfig'
import { track } from '../../utils/track'

const delay = (i: number) => ({ '--i': i }) as React.CSSProperties

// Entrada solo con keyframes de CSS (.hero-in): sin estado, sin timers, sin Framer.
export default function Hero() {
  const config = useConfig()
  const waLink = buildWALink(config.whatsapp_number, config.whatsapp_default_text)

  return (
    <section id="hero" className="relative flex items-center overflow-hidden min-h-svh">
      <div className="absolute inset-0 opacity-40" aria-hidden="true">
        <ParticlesBackground />
      </div>

      <div className="relative z-10 max-w-6xl mx-auto w-full px-6 pt-32 pb-16 grid lg:grid-cols-2 gap-10 lg:gap-14 items-center">
        <div>
          <h1
            className="hero-in font-bold leading-tight mb-4"
            style={{ fontSize: 'clamp(2rem, 5.5vw, 3.75rem)', ...delay(0) }}
          >
            Webs para negocios de La Plata, con el precio a la vista
          </h1>
          <p className="hero-in text-white/70 text-lg max-w-xl mb-3 leading-relaxed" style={delay(1)}>
            Elegí tu rubro y mirá qué te conviene, cuánto sale y cuánto tarda.
          </p>
          <p className="hero-in text-white/60 text-sm mb-8" style={delay(2)}>
            Respondemos en menos de 24 horas hábiles.
          </p>
          <div className="hero-in flex flex-col sm:flex-row gap-3" style={delay(3)}>
            <a
              href={waLink}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => track({ event: 'cta_whatsapp_click', location: 'hero' })}
              className="text-center bg-[#D32F2F] text-white px-8 py-4 rounded-lg font-semibold hover:bg-[#B71C1C] transition-colors duration-200"
            >
              Cotizar por WhatsApp
            </a>
            <a
              href="#servicios"
              className="text-center border border-white/20 text-white px-8 py-4 rounded-lg font-semibold hover:bg-white/5 transition-colors duration-200"
            >
              Ver servicios
            </a>
          </div>
        </div>

        <div className="hero-in" style={delay(4)}>
          <HeroSelector />
        </div>
      </div>
    </section>
  )
}
