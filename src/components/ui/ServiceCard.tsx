import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Globe, Rocket, Building2, Settings, Bot } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import type { Servicio } from '../../data/servicios'
import { useConfig } from '../../context/ConfigContext'
import { formatPrice } from '../../hooks/useSheetConfig'
import type { SheetConfig } from '../../hooks/useSheetConfig'

const ICON_MAP: Record<string, LucideIcon> = {
  Globe, Rocket, Building2, Settings, Bot,
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

export default function ServiceCard({ servicio }: Props) {
  const config = useConfig()
  const CardIcon = ICON_MAP[servicio.iconName]
  const keys = PRICE_MAP[servicio.id]
  const precio = keys
    ? `${formatPrice(config[keys.min])} – ${formatPrice(config[keys.max])}`
    : servicio.precio

  return (
    <motion.div
      whileHover={{ y: -4 }}
      className="relative bg-white/[0.03] border border-white/[0.08] rounded-2xl p-6 hover:border-[#D32F2F]/30 transition-all duration-300 flex flex-col h-full"
    >
      {servicio.badge && (
        <span
          className={`absolute top-4 right-4 text-xs font-mono px-2 py-1 rounded ${
            servicio.badge.tipo === 'popular'
              ? 'bg-[#D32F2F] text-white'
              : 'bg-[#D32F2F]/10 text-[#D32F2F] border border-[#D32F2F]/30'
          }`}
        >
          {servicio.badge.texto}
        </span>
      )}

      {CardIcon && (
        <CardIcon size={28} className="text-[#D32F2F] mb-3" strokeWidth={1.5} />
      )}

      <h3 className="text-lg font-bold mb-2">{servicio.nombre}</h3>
      <p className="text-white/50 text-sm mb-4 flex-1">{servicio.descripcion}</p>

      <div className="mb-4">
        <div className="text-xl font-bold text-white">{precio}</div>
        <div className="text-xs text-white/40">{servicio.precioTipo}</div>
      </div>

      <div className="flex flex-wrap gap-1.5 mb-6">
        {servicio.pills.map((pill) => (
          <span
            key={pill}
            className="text-xs bg-white/5 border border-white/10 px-2 py-1 rounded text-white/60"
          >
            {pill}
          </span>
        ))}
      </div>

      <div className="flex items-center justify-between mt-auto">
        <span className="text-xs text-white/30">⏱ {servicio.tiempo}</span>
        <Link
          to={servicio.slug}
          className="text-sm text-[#D32F2F] hover:text-white border border-[#D32F2F]/30 hover:bg-[#D32F2F] px-4 py-2 rounded-lg transition-all duration-200"
        >
          Ver más →
        </Link>
      </div>
    </motion.div>
  )
}
