import { SERVICIOS } from '../../data/servicios'
import type { Mensaje } from './usePuntoChat'

// Cómo se menciona cada servicio en una conversación. Los nombres salen de SERVICIOS; acá solo van las palabras clave.
const PALABRAS: Record<string, RegExp> = {
  'presencia-web-esencial': /presencia web|esencial/gi,
  'landing-page-profesional': /landing/gi,
  'sitio-web-corporativo': /corporativ/gi,
  'sistema-a-medida': /sistema|plataforma/gi,
  'automatizacion-whatsapp': /automatiz|bot de whatsapp|\bbot\b/gi,
}

/**
 * Servicio del que se habló, mirando la conversación de atrás para adelante: gana el último servicio mencionado.
 * Devuelve null si no se nombró ninguno (el mensaje de WhatsApp sale sin la parte "Me interesa").
 */
export function servicioDeConversacion(mensajes: Mensaje[]): { id: string; nombre: string } | null {
  for (let i = mensajes.length - 1; i >= 0; i--) {
    const m = mensajes[i]
    if (m.error) continue
    let mejor: { id: string; pos: number } | null = null
    for (const [id, re] of Object.entries(PALABRAS)) {
      re.lastIndex = 0
      let hit: RegExpExecArray | null
      while ((hit = re.exec(m.texto))) if (!mejor || hit.index > mejor.pos) mejor = { id, pos: hit.index }
    }
    if (mejor) {
      const s = SERVICIOS.find((x) => x.id === mejor!.id)
      if (s) return { id: s.id, nombre: s.nombre }
    }
  }
  return null
}

export function textoWhatsApp(servicio: { nombre: string } | null): string {
  const base = 'Hola, vengo de hablar con Punto en la web.'
  return servicio ? `${base} Me interesa: ${servicio.nombre}.` : base
}
