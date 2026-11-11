import ServicePage from './ServicePage'
import { SERVICIOS } from '../../data/servicios'

export default function AutomatizacionWhatsApp() {
  const servicio = SERVICIOS.find((s) => s.id === 'automatizacion-whatsapp')
  if (!servicio) return null
  return <ServicePage servicio={servicio} />
}
