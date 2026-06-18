import ServicePage from './ServicePage'
import { SERVICIOS } from '../../data/servicios'

export default function SistemaAMedida() {
  const servicio = SERVICIOS.find((s) => s.id === 'sistema-a-medida')
  if (!servicio) return null
  return <ServicePage servicio={servicio} />
}
