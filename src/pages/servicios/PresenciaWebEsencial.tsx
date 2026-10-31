import ServicePage from './ServicePage'
import { SERVICIOS } from '../../data/servicios'

export default function PresenciaWebEsencial() {
  const servicio = SERVICIOS.find((s) => s.id === 'presencia-web-esencial')
  if (!servicio) return null
  return <ServicePage servicio={servicio} />
}
