import { SERVICIOS } from '../../data/servicios'
import { PRICE_MAP } from '../../data/precios'
import { formatPrice } from '../../hooks/useSheetConfig'
import type { SheetConfig } from '../../hooks/useSheetConfig'

// Textos fijos de los 3 botones rápidos (no gastan IA). Los precios salen de la config, nunca copiados.
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

// Mensajes de Punto cuando algo falla. En los dos casos el botón "Hablar con el equipo" sigue a la vista.
export const MENSAJE_LIMITE = 'Por hoy ya charlamos un montón. Escribile al equipo por WhatsApp y te responden ahí.'
export const MENSAJE_DESACTIVADO = 'Por ahora no estoy disponible. Escribile al equipo por WhatsApp y te responden ahí.'
export const MENSAJE_RAPIDO = 'Escribís más rápido de lo que llego a contestar. Esperá unos segundos y probá de nuevo.'
export const MENSAJE_ERROR = 'Uy, se me cortó la conexión y no pude contestarte. Probá de nuevo en un rato o escribile al equipo por WhatsApp.'
