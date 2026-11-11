import ServicePage from './ServicePage'
import { SERVICIOS } from '../../data/servicios'

export default function LandingPageProfesional() {
  const servicio = SERVICIOS.find((s) => s.id === 'landing-page-profesional')
  if (!servicio) return null
  return <ServicePage servicio={servicio} />
}
