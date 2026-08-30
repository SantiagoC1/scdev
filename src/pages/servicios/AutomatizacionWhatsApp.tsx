import ServicePage from './ServicePage'
import PageMeta from '../../components/ui/PageMeta'
import { SERVICIOS } from '../../data/servicios'
import { SITE_URL } from '../../constants'

export default function AutomatizacionWhatsApp() {
  const servicio = SERVICIOS.find((s) => s.id === 'automatizacion-whatsapp')
  if (!servicio) return null
  return (
    <>
      <PageMeta
        title={`${servicio.nombre} — SCdev`}
        description={servicio.descripcion}
        canonical={`${SITE_URL}${servicio.slug}`}
      />
      <ServicePage servicio={servicio} />
    </>
  )
}
