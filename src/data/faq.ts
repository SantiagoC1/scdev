import { SERVICIOS } from './servicios'

// Condiciones de pago visibles en "Cómo trabajamos" y en las preguntas frecuentes.
export const CONDICION_PAGO = '50% para arrancar y 50% al entregar'

const esencial = SERVICIOS.find((s) => s.id === 'presencia-web-esencial')!
const faqEsencial = (inicio: string) => esencial.faq.find((f) => f.pregunta.includes(inicio))!.respuesta

const plazos = SERVICIOS.map((s) => `${s.nombre}: ${s.tiempo}`).join('. ')

// Mismo contenido que la tabla de mantenimiento (data/mantenimiento.ts), en forma acumulativa.
const MANTENIMIENTO =
  'Básico: hosting y SSL activos, actualizaciones de seguridad y soporte por WhatsApp. ' +
  'Estándar: todo lo del Básico, más 2 cambios de contenido por mes, reporte mensual de analytics y backup mensual. ' +
  'Pro: todo lo del Estándar, más cambios de contenido ilimitados, prioridad en soporte y auditoría SEO trimestral.'

export const FAQ: { pregunta: string; respuesta: string }[] = [
  {
    pregunta: '¿Cuánto tarda?',
    respuesta: `Depende del servicio. ${plazos}. Los plazos corren desde que tenemos los textos y fotos de tu parte.`,
  },
  {
    pregunta: '¿Cómo es el pago?',
    respuesta: `${CONDICION_PAGO[0].toUpperCase()}${CONDICION_PAGO.slice(1)}. En la reunión inicial te damos un precio fijo antes de arrancar.`,
  },
  { pregunta: '¿Necesito dominio?', respuesta: faqEsencial('dominio') },
  { pregunta: '¿Puedo pedir cambios después?', respuesta: faqEsencial('cambios después') },
  {
    pregunta: '¿Trabajan con clientes de todo el país?',
    respuesta: 'Sí. Estamos en La Plata y trabajamos con negocios de toda Argentina.',
  },
  { pregunta: '¿Qué incluye el mantenimiento?', respuesta: MANTENIMIENTO },
]
