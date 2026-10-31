import { useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { RUBROS } from '../../data/rubros'
import { SERVICIOS } from '../../data/servicios'
import { useConfig } from '../../context/ConfigContext'
import { buildWALink, formatPrice } from '../../hooks/useSheetConfig'
import { PRICE_MAP } from './ServiceCard'
import { track } from '../../utils/track'

export default function HeroSelector() {
  const config = useConfig()
  const [idx, setIdx] = useState(0)
  const chips = useRef<(HTMLButtonElement | null)[]>([])

  const rubro = RUBROS[idx]
  const servicio = SERVICIOS.find((s) => s.id === rubro.servicioId)!
  const notaServicio = rubro.nota ? SERVICIOS.find((s) => s.id === rubro.nota!.servicioId) : undefined
  const keys = PRICE_MAP[servicio.id]
  const desde = keys ? formatPrice(config[keys.min]) : servicio.precio

  const waLink = buildWALink(
    config.whatsapp_number,
    `Hola, soy de ${rubro.label} y me interesa ${servicio.nombre}`,
  )

  const elegir = (i: number, foco = false) => {
    const n = (i + RUBROS.length) % RUBROS.length
    setIdx(n)
    track({ event: 'hero_selector', rubro: RUBROS[n].id, servicio: RUBROS[n].servicioId })
    if (foco) chips.current[n]?.focus()
  }

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') { e.preventDefault(); elegir(idx + 1, true) }
    else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') { e.preventDefault(); elegir(idx - 1, true) }
    else if (e.key === 'Home') { e.preventDefault(); elegir(0, true) }
    else if (e.key === 'End') { e.preventDefault(); elegir(RUBROS.length - 1, true) }
  }

  return (
    <div className="rounded-2xl border border-white/10 bg-[#111111]/90 p-4 md:p-6">
      <p id="rubro-label" className="text-sm text-white/70 mb-2 md:mb-3">Mi negocio es de…</p>
      <div role="radiogroup" aria-labelledby="rubro-label" onKeyDown={onKeyDown} className="flex flex-wrap gap-1.5 md:gap-2 mb-3 md:mb-5">
        {RUBROS.map((r, i) => {
          const activo = i === idx
          return (
            <button
              key={r.id}
              ref={(el) => { chips.current[i] = el }}
              type="button"
              role="radio"
              aria-checked={activo}
              tabIndex={activo ? 0 : -1}
              onClick={() => elegir(i)}
              className={`px-3 py-1.5 md:px-3.5 md:py-2 rounded-lg text-sm border transition-colors duration-200 ${
                activo
                  ? 'bg-white text-[#0a0a0a] border-white font-medium'
                  : 'text-white/80 border-white/15 hover:border-white/40'
              }`}
            >
              {r.label}
            </button>
          )
        })}
      </div>

      {/* Alto mínimo fijo: cambiar de rubro no mueve el resto de la página. */}
      <div aria-live="polite" className="min-h-[13rem] sm:min-h-[19rem]">
        <div key={rubro.id} className="hero-fade">
          <p className="text-xl font-bold font-[family-name:var(--font-display)] mb-1">{servicio.nombre}</p>
          <p className="mb-4">
            <span className="text-2xl font-bold text-accent-text">Desde {desde}</span>
            <span className="block sm:inline text-sm text-white/60 sm:ml-2">{servicio.precioTipo} · {servicio.tiempo}</span>
          </p>
          <ul className="hidden sm:block space-y-1.5 mb-4 text-sm text-white/80">
            {servicio.incluye.slice(0, 3).map((it) => (
              <li key={it.titulo} className="flex gap-2">
                <span aria-hidden="true" className="text-white/70">✓</span>
                {it.titulo}
              </li>
            ))}
          </ul>
          <p className="text-sm text-white/70 mb-4 min-h-5">
            {rubro.nota && notaServicio && (
              <Link to={notaServicio.slug} className="underline underline-offset-2 hover:text-white">
                {rubro.nota.texto}
              </Link>
            )}
          </p>
          <div className="flex flex-col sm:flex-row sm:items-center gap-3">
            <a
              href={waLink}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => track({ event: 'cta_whatsapp_click', location: 'hero' })}
              className="text-center bg-[#D32F2F] text-white px-5 py-3 rounded-lg font-semibold hover:bg-[#B71C1C] transition-colors duration-200"
            >
              Pedir esta web por WhatsApp
            </a>
            <Link to={servicio.slug} className="text-sm text-white/80 hover:text-white underline underline-offset-2 text-center">
              Ver qué incluye →
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
