import ServicePage from './ServicePage'
import { SERVICIOS } from '../../data/servicios'

export default function SitioWebCorporativo() {
  const servicio = SERVICIOS.find((s) => s.id === 'sitio-web-corporativo')
  if (!servicio) return null
  return <ServicePage servicio={servicio} />
}
