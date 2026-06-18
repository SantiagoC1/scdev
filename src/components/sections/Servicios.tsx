import { motion } from 'framer-motion'
import ServiceCard from '../ui/ServiceCard'
import MantenimientoTier from '../ui/MantenimientoTier'
import { SERVICIOS } from '../../data/servicios'
import { useConfig } from '../../context/ConfigContext'
import { formatPrice, buildWALink } from '../../hooks/useSheetConfig'
import type { SheetConfig } from '../../hooks/useSheetConfig'

const MANT_MAP: Record<string, { min: keyof SheetConfig; max: keyof SheetConfig }> = {
  basico:   { min: 'price_mant_basico_min',   max: 'price_mant_basico_max' },
  estandar: { min: 'price_mant_estandar_min', max: 'price_mant_estandar_max' },
  pro:      { min: 'price_mant_pro_min',      max: 'price_mant_pro_max' },
}

const MANTENIMIENTO_TIERS = [
  {
    id: 'basico',
    nombre: 'Plan Básico',
    descripcion: 'Para sitios simples',
    incluye: [
      'Hosting y SSL activos',
      'Actualizaciones de seguridad',
      'Soporte por WhatsApp',
    ],
    popular: false,
  },
  {
    id: 'estandar',
    nombre: 'Plan Estándar',
    descripcion: 'Lo más elegido',
    incluye: [
      'Todo el Plan Básico',
      '2 cambios de contenido/mes',
      'Reporte mensual de analytics',
      'Backup mensual',
    ],
    popular: true,
  },
  {
    id: 'pro',
    nombre: 'Plan Pro',
    descripcion: 'Para negocios activos',
    incluye: [
      'Todo el Plan Estándar',
      'Cambios ilimitados de contenido',
      'Prioridad en soporte',
      'Auditoría SEO trimestral',
    ],
    popular: false,
  },
]

export default function Servicios() {
  const config = useConfig()
  const first4 = SERVICIOS.slice(0, 4)
  const last1 = SERVICIOS.slice(4)

  return (
    <section id="servicios" className="py-24 bg-[#0a0a0a]">
      <div className="max-w-6xl mx-auto px-6">
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
          className="mb-16"
        >
          <h2 className="text-3xl md:text-5xl font-bold mt-3">Servicios</h2>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          {first4.map((s, i) => (
            <motion.div
              key={s.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
            >
              <ServiceCard servicio={s} />
            </motion.div>
          ))}
        </div>

        <div className="flex justify-center">
          {last1.map((s) => (
            <motion.div
              key={s.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="w-full max-w-xl"
            >
              <ServiceCard servicio={s} />
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-24"
        >
          <div className="text-center mb-12">
            
            <h3 className="text-2xl md:text-4xl font-bold mb-3">Planes de Mantenimiento</h3>
            <p className="text-white/50 max-w-xl mx-auto">
              Mantenemos tu sitio activo, seguro y actualizado. Vos te enfocás en tu negocio.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {MANTENIMIENTO_TIERS.map((tier) => {
              const keys = MANT_MAP[tier.id]
              const precio = `${formatPrice(config[keys.min])} – ${formatPrice(config[keys.max])}/mes`
              return (
                <MantenimientoTier
                  key={tier.nombre}
                  nombre={tier.nombre}
                  descripcion={tier.descripcion}
                  incluye={tier.incluye}
                  popular={tier.popular}
                  precio={precio}
                />
              )
            })}
          </div>

          <div className="text-center mt-8">
            <a
              href={buildWALink(config.whatsapp_number, 'Hola Santi! Me interesa un plan de mantenimiento mensual.')}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block text-sm text-[#D32F2F] border border-[#D32F2F]/30 px-6 py-3 rounded-xl hover:bg-[#D32F2F]/10 transition-all duration-200"
            >
              Consultar planes →
            </a>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
