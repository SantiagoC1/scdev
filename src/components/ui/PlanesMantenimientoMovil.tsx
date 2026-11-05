import { useRef, useState } from 'react'
import { PLANES, BENEFICIOS, fraseBeneficio } from '../../data/mantenimiento'
import { MANT_MAP } from '../../data/precios'
import { useConfig } from '../../context/ConfigContext'
import { formatPrice, buildWALink } from '../../hooks/useSheetConfig'
import { track } from '../../utils/track'

/**
 * Planes de mantenimiento mensual en celular (menos de 768 px): pestañas y una tarjeta por plan. Es otra presentación de
 * los mismos datos de la tabla (PLANES, BENEFICIOS y los precios de la config): no hay contenido propio acá.
 * Las tres tarjetas se apilan en la misma celda de una grilla y solo la activa se ve: la altura es siempre la de la más
 * alta (no salta al cambiar de plan) y el cambio es un cross-fade de opacidad (150 ms, ver .mant-panel en index.css).
 */
export default function PlanesMantenimientoMovil() {
  const config = useConfig()
  const inicial = Math.max(0, PLANES.findIndex((p) => p.destacado)) // el recomendado (Estándar) viene preseleccionado
  const [activo, setActivo] = useState(inicial)
  const pestanas = useRef<(HTMLButtonElement | null)[]>([])

  // Patrón de pestañas WAI-ARIA con activación automática: las flechas mueven el foco y el plan; Inicio y Fin van a los extremos.
  const alTeclear = (e: React.KeyboardEvent) => {
    const n = PLANES.length
    let destino: number | null = null
    if (e.key === 'ArrowRight') destino = (activo + 1) % n
    else if (e.key === 'ArrowLeft') destino = (activo - 1 + n) % n
    else if (e.key === 'Home') destino = 0
    else if (e.key === 'End') destino = n - 1
    if (destino === null) return
    e.preventDefault()
    setActivo(destino)
    pestanas.current[destino]?.focus()
  }

  return (
    <div>
      <div
        role="tablist"
        aria-label="Planes de mantenimiento mensual"
        onKeyDown={alTeclear}
        className="grid grid-cols-3 gap-1 rounded-xl bg-[var(--s-head)] p-1"
      >
        {PLANES.map((p, i) => (
          <button
            key={p.id}
            ref={(el) => {
              pestanas.current[i] = el
            }}
            type="button"
            role="tab"
            id={`mant-tab-${p.id}`}
            aria-selected={i === activo}
            aria-controls={`mant-panel-${p.id}`}
            tabIndex={i === activo ? 0 : -1}
            onClick={() => setActivo(i)}
            className={`min-h-11 rounded-lg px-2 text-sm font-semibold transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--s-focus)] ${
              i === activo
                ? 'bg-[var(--s-card)] text-[var(--s-fg)] shadow-[inset_0_0_0_2px_var(--s-accent)]'
                : 'text-[var(--s-muted)] hover:text-[var(--s-fg)]'
            }`}
          >
            {p.nombre}
            {p.destacado && <span className="sr-only"> (recomendado)</span>}
          </button>
        ))}
      </div>

      <div className="mt-4 grid">
        {PLANES.map((p, i) => {
          const k = MANT_MAP[p.id]
          const incluidos = BENEFICIOS.filter((b) => b.valores[i] !== false)
          const noIncluidos = BENEFICIOS.filter((b) => b.valores[i] === false)
          const wa = buildWALink(config.whatsapp_number, `Hola Santi! Me interesa el plan de mantenimiento mensual ${p.nombre}.`)
          return (
            <div
              key={p.id}
              role="tabpanel"
              id={`mant-panel-${p.id}`}
              aria-labelledby={`mant-tab-${p.id}`}
              data-activo={i === activo}
              className="mant-panel flex min-w-0 flex-col rounded-2xl border border-[var(--s-border)] bg-[var(--s-card)] p-5"
            >
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                <h4 className="font-[family-name:var(--font-display)] text-xl font-bold">{p.nombre}</h4>
                {/* La etiqueta "Recomendado" es el "para" del plan destacado: se muestra como insignia, no como descripción. */}
                {p.destacado && (
                  <span className="rounded-md bg-[var(--s-btn)] px-2 py-0.5 text-xs font-semibold text-white">Recomendado</span>
                )}
              </div>
              {!p.destacado && <p className="mt-1 text-sm text-[var(--s-muted)]">{p.para}</p>}

              <p className="mt-4 font-bold text-[var(--s-price)] [overflow-wrap:anywhere]">
                {formatPrice(config[k.min])} – {formatPrice(config[k.max])}
              </p>
              <p className="text-xs text-[var(--s-muted)]">por mes</p>

              <ul className="mt-5 flex flex-col gap-2.5 text-sm">
                {incluidos.map((b) => {
                  const v = b.valores[i]
                  return (
                    <li key={b.texto} className="flex gap-2.5">
                      <span aria-hidden="true" className="font-bold text-[var(--s-price)]">✓</span>
                      <span className="min-w-0 [overflow-wrap:anywhere]">
                        <span className="sr-only">Incluye: </span>
                        {typeof v === 'string' ? fraseBeneficio(b.texto, v) : b.texto}
                      </span>
                    </li>
                  )
                })}
                {noIncluidos.map((b) => (
                  <li key={b.texto} className="flex gap-2.5 text-[var(--s-muted)]">
                    <span aria-hidden="true">—</span>
                    <span className="min-w-0 [overflow-wrap:anywhere]">
                      <span className="sr-only">No incluye: </span>
                      {b.texto}
                    </span>
                  </li>
                ))}
              </ul>

              <a
                href={wa}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => track({ event: 'cta_whatsapp_click', location: 'mantenimiento' })}
                className="mt-6 flex min-h-11 items-center justify-center rounded-lg bg-[var(--s-btn)] px-6 py-3 text-center font-semibold text-white transition-colors duration-200 hover:bg-[var(--s-btn-hover)]"
              >
                Consultar el plan {p.nombre} por WhatsApp
              </a>
            </div>
          )
        })}
      </div>
    </div>
  )
}
