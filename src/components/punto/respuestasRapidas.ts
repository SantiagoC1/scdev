import { SERVICIOS } from '../../data/servicios'
import { PRICE_MAP } from '../../data/precios'
import { formatPrice } from '../../hooks/useSheetConfig'
import type { SheetConfig } from '../../hooks/useSheetConfig'

// Fase 1 (sin IA): textos fijos de los 3 botones rápidos. Los precios salen de la config, nunca copiados.
export interface RespuestaRapida {
  id: string
  boton: string
  respuesta: (config: SheetConfig) => string
}

export const SALUDO_INICIAL = '¡Hola! Soy Punto, el asistente de SCdev. ¿En qué te ayudo?'

export const RESPUESTAS_RAPIDAS: RespuestaRapida[] = [
  {
    id: 'web',
    boton: 'Quiero una web',
    respuesta: () =>
      'Para recomendarte bien necesito saber de qué es tu negocio. En el inicio de la página elegís tu rubro y ves qué te conviene, cuánto sale y cuánto tarda. Si querés, contame acá de qué se trata.',
  },
  {
    id: 'precios',
    boton: '¿Cuánto sale?',
    respuesta: (config) => {
      const lista = SERVICIOS.map((s) => {
        const keys = PRICE_MAP[s.id]
        const desde = keys ? formatPrice(config[keys.min]) : s.precio
        return `• ${s.nombre}: desde ${desde} (${s.tiempo})`
      }).join('\n')
      return `Estos son los precios de referencia:\n${lista}\nEl valor final depende de lo que necesite tu negocio. Eso lo confirma el equipo.`
    },
  },
  {
    id: 'mejorar',
    boton: 'Ya tengo web y quiero mejorarla',
    respuesta: () =>
      'Contanos cuál es tu web y qué te gustaría mejorar, y el equipo te dice qué se puede hacer. Podés escribirles por WhatsApp con el botón de abajo.',
  },
]

export const RESPUESTA_SIN_IA =
  'Por ahora solo puedo responder a los botones de arriba. Para otra consulta, escribile al equipo por WhatsApp con el botón de abajo.'
