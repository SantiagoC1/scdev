import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { ChevronRight, Globe, Rocket, Building2, Settings, Bot } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { SERVICIOS } from '../../data/servicios'
import type { Servicio } from '../../data/servicios'
import { PRICE_MAP } from '../../data/precios'
import { PLANES, BENEFICIOS } from '../../data/mantenimiento'
import { useConfig } from '../../context/ConfigContext'
import { formatPrice, buildWALink } from '../../hooks/useSheetConfig'
import type { SheetConfig } from '../../hooks/useSheetConfig'

const ICONOS: Record<string, LucideIcon> = { Globe, Rocket, Building2, Settings, Bot }

const MANT_MAP: Record<string, { min: keyof SheetConfig; max: keyof SheetConfig }> = {
  basico:   { min: 'price_mant_basico_min',   max: 'price_mant_basico_max' },
  estandar: { min: 'price_mant_estandar_min', max: 'price_mant_estandar_max' },
  pro:      { min: 'price_mant_pro_min',      max: 'price_mant_pro_max' },
}

function useDesde(s: Servicio) {
  const config = useConfig()
  const keys = PRICE_MAP[s.id]
  return keys ? formatPrice(config[keys.min]) : s.precio
}

const focoBoton = 'bg-[#D32F2F] text-white hover:bg-[#B71C1C] transition-colors duration-200'

function Puerta({ servicio }: { servicio: Servicio }) {
  const desde = useDesde(servicio)
  const Icono = ICONOS[servicio.iconName]
  return (
    <article
      className={`relative flex flex-col rounded-2xl border bg-white p-6 md:p-8 ${
        servicio.badge?.tipo === 'popular' ? 'border-[#D32F2F]' : 'border-black/15'
      }`}
    >
      {servicio.badge && (
        <span className="absolute top-5 right-5 text-xs font-medium px-2 py-1 rounded-lg border border-black/15 text-[#4b5563]">
          {servicio.badge.texto}
        </span>
      )}
      {Icono && <Icono size={28} className="text-[#4b5563] mb-4" strokeWidth={1.5} aria-hidden="true" />}
      <h3 className="text-xl md:text-2xl font-bold mb-2">{servicio.nombre}</h3>
      <p className="text-[#4b5563] text-sm mb-5">{servicio.descripcion}</p>
      <p className="mb-1">
        <span className="text-3xl font-bold text-[#B71C1C]">Desde {desde}</span>
      </p>
      <p className="text-sm text-[#4b5563] mb-5">{servicio.precioTipo} · {servicio.tiempo}</p>
      <ul className="flex flex-wrap gap-1.5 mb-7">
        {servicio.beneficios.map((p) => (
          <li key={p} className="text-xs border border-black/15 px-2 py-1 rounded-lg text-[#4b5563]">{p}</li>
        ))}
      </ul>
      <Link to={servicio.slug} className={`mt-auto self-start px-5 py-3 rounded-lg font-semibold ${focoBoton}`}>
        Ver qué incluye →
      </Link>
    </article>
  )
}

function Fila({ servicio }: { servicio: Servicio }) {
  const desde = useDesde(servicio)
  return (
    <li>
      <Link
        to={servicio.slug}
        className="group flex items-center gap-4 rounded-2xl border border-black/15 bg-white px-5 py-4 hover:border-[#0a0a0a] transition-colors duration-200"
      >
        <div className="flex-1 min-w-0 grid md:grid-cols-[1.2fr_1.4fr_0.7fr_1fr] md:items-center gap-x-6 gap-y-1">
          <span className="font-bold font-[family-name:var(--font-display)]">{servicio.nombre}</span>
          <span className="text-sm text-[#4b5563]">Para {servicio.para}</span>
          <span className="text-sm text-[#4b5563]">{servicio.tiempo}</span>
          <span className="block text-right whitespace-nowrap mt-1 md:mt-0">
            <span className="block font-bold text-[#B71C1C]">Desde {desde}</span>
            <span className="block text-xs text-[#4b5563]">{servicio.precioTipo}</span>
          </span>
        </div>
        <ChevronRight size={20} aria-hidden="true" className="flex-none text-[#4b5563] group-hover:translate-x-0.5 transition-transform" />
      </Link>
    </li>
  )
}

function TablaMantenimiento() {
  const config = useConfig()
  const cont = useRef<HTMLDivElement>(null)
  const [hayMas, setHayMas] = useState(false)

  const actualizar = () => {
    const c = cont.current
    if (c) setHayMas(c.scrollLeft + c.clientWidth < c.scrollWidth - 4)
  }

  // En móvil la tabla desborda: al cargar, deja Estándar pegada a la columna fija de etiquetas.
  useEffect(() => {
    const c = cont.current
    if (!c) return
    const est = c.querySelector<HTMLElement>('[data-destacado]')
    const etiquetas = c.querySelector<HTMLElement>('[data-etiquetas]')
    if (est && etiquetas && c.scrollWidth > c.clientWidth) c.scrollLeft = est.offsetLeft - etiquetas.offsetWidth
    actualizar()
    window.addEventListener('resize', actualizar)
    return () => window.removeEventListener('resize', actualizar)
  }, [])

  return (
    <div className="relative">
    <div ref={cont} onScroll={actualizar} role="region" aria-label="Planes de mantenimiento, desplazable" tabIndex={0} className="relative overflow-x-auto rounded-2xl">
      <table className="w-full min-w-[34rem] border-separate border-spacing-0 text-sm">
        <caption className="sr-only">Comparación de planes de mantenimiento mensual</caption>
        <thead>
          <tr>
            <td data-etiquetas className="sticky left-0 z-10 bg-[#F3F4F6] w-[8.5rem] md:w-[34%]" />
            {PLANES.map((p) => {
              const k = MANT_MAP[p.id]
              return (
                <th
                  key={p.id}
                  scope="col"
                  data-destacado={p.destacado ? '' : undefined}
                  className={`text-left align-bottom px-4 pt-6 pb-4 font-normal border-t border-x rounded-t-2xl ${
                    p.destacado ? 'border-[#D32F2F]' : 'border-transparent'
                  }`}
                >
                  <span className="block font-bold font-[family-name:var(--font-display)] text-base">{p.nombre}</span>
                  <span className="block text-xs text-[#4b5563] mb-2">{p.para}</span>
                  <span className="block font-bold text-[#B71C1C]">{formatPrice(config[k.min])} – {formatPrice(config[k.max])}</span>
                  <span className="block text-xs text-[#4b5563]">por mes</span>
                </th>
              )
            })}
          </tr>
        </thead>
        <tbody>
          {BENEFICIOS.map((b, r) => (
            <tr key={b.texto}>
              <th scope="row" className="sticky left-0 z-10 bg-[#F3F4F6] text-left font-normal py-3 pr-4 border-t border-black/15 text-[#4b5563]">
                {b.texto}
              </th>
              {b.valores.map((v, i) => {
                const ultima = r === BENEFICIOS.length - 1
                const dest = PLANES[i].destacado
                return (
                  <td
                    key={i}
                    className={`px-4 py-3 border-t ${dest ? 'border-x border-t-black/15 border-x-[#D32F2F]' : 'border-black/15'} ${
                      dest && ultima ? 'border-b border-b-[#D32F2F] rounded-b-2xl' : ''
                    }`}
                  >
                    {v === true ? (
                      <><span aria-hidden="true" className="text-[#D32F2F] font-bold">✓</span><span className="sr-only">Incluido</span></>
                    ) : v === false ? (
                      <><span aria-hidden="true" className="text-[#4b5563]">—</span><span className="sr-only">No incluido</span></>
                    ) : (
                      <span>{v}</span>
                    )}
                  </td>
                )
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
      {hayMas && (
        <div aria-hidden="true" className="md:hidden pointer-events-none absolute inset-y-0 right-0 w-12 rounded-r-2xl bg-gradient-to-l from-[#F3F4F6] to-transparent" />
      )}
    </div>
  )
}

export default function Servicios() {
  const config = useConfig()
  const puertas = SERVICIOS.filter((s) => s.id === 'presencia-web-esencial' || s.id === 'landing-page-profesional')
  const filas = SERVICIOS.filter((s) => !puertas.includes(s))

  return (
    <section id="servicios" className="seccion-clara py-24 bg-[#F3F4F6] text-[#0a0a0a]">
      <div className="max-w-6xl mx-auto px-6">
        <h2 className="text-3xl md:text-5xl font-bold mb-3">Servicios</h2>
        <p className="text-[#4b5563] mb-10 max-w-xl">Precios publicados. Empezá por el que más se parece a tu negocio.</p>

        <div className="grid md:grid-cols-2 gap-6 mb-6">
          {puertas.map((s) => <Puerta key={s.id} servicio={s} />)}
        </div>

        <ul className="flex flex-col gap-3">
          {filas.map((s) => <Fila key={s.id} servicio={s} />)}
        </ul>

        <div className="mt-20">
          <h3 className="text-2xl md:text-3xl font-bold mb-2">Mantenimiento mensual</h3>
          <p className="text-[#4b5563] mb-8 max-w-xl">
            Mantenemos tu sitio activo, seguro y actualizado. Vos te enfocás en tu negocio.
          </p>
          <TablaMantenimiento />
          <div className="mt-8">
            <a
              href={buildWALink(config.whatsapp_number, 'Hola Santi! Me interesa un plan de mantenimiento mensual.')}
              target="_blank"
              rel="noopener noreferrer"
              className={`inline-block px-6 py-3 rounded-lg font-semibold ${focoBoton}`}
            >
              Consultar planes
            </a>
          </div>
        </div>
      </div>
    </section>
  )
}
