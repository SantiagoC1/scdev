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

      <div className="relative z-10 max-w-6xl mx-auto w-full px-6 pt-24 pb-10 md:pt-32 md:pb-16 grid lg:grid-cols-2 lg:grid-rows-[auto_auto_auto] gap-x-14 gap-y-4 lg:content-center">
        {/* Móvil: H1, sub, selector, resto. Escritorio: texto a la izquierda, selector a la derecha. */}
        <h1
          className="hero-in font-bold leading-tight lg:mb-0 lg:self-end"
          style={{ fontSize: 'clamp(1.75rem, 5.5vw, 3.75rem)', ...delay(0) }}
        >
          Webs para negocios de La Plata, con el precio a la vista
        </h1>
        <p className="hero-in text-white/70 text-base md:text-lg max-w-xl leading-relaxed" style={delay(1)}>
          Elegí tu rubro y mirá qué te conviene, cuánto sale y cuánto tarda.
        </p>

        <div className="hero-in lg:col-start-2 lg:row-start-1 lg:row-span-3 lg:self-center" style={delay(4)}>
          <HeroSelector />
        </div>

        <div className="lg:self-start">
          <p className="hero-in text-white/60 text-sm md:mb-6" style={delay(2)}>
            Respondemos en menos de 24 horas hábiles.
          </p>
          <div className="hero-in hidden md:flex flex-row gap-3" style={delay(3)}>
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
      </div>
    </section>
  )
}
