import { SERVICIOS } from '../../../src/data/servicios.ts'
import { PRICE_MAP } from '../../../src/data/precios.ts'

// Base de conocimiento de Punto: solo información pública y confirmada. Los precios NO se escriben acá:
// salen de la config en vivo (config.ts) y los textos y plazos, de src/data/servicios.ts.
// Los hechos sin confirmar (hosting incluido, 50% de anticipo, validez de 30 días, redes sociales,
// Bot de WhatsApp y Diagnóstico digital) tampoco van: ver "Punto (Parte A)" en docs/pendientes.md.

const pesos = (v: string) => '$' + Number(v).toLocaleString('es-AR')

const PLANES_MANTENIMIENTO = [
  { nombre: 'Básico', clave: 'price_mant_basico_min' },
  { nombre: 'Estándar', clave: 'price_mant_estandar_min' },
  { nombre: 'Pro', clave: 'price_mant_pro_min' },
]

export function armarConocimiento(precios: Record<string, string>): string {
  const servicios = SERVICIOS.map((s) => {
    const keys = PRICE_MAP[s.id]
    const desde = keys ? pesos(precios[keys.min]) : s.precio
    return `- ${s.nombre}: desde ${desde}, ${s.tiempo}. ${s.descripcion}`
  }).join('\n')
  const mantenimiento = PLANES_MANTENIMIENTO.map((p) => `${p.nombre} desde ${pesos(precios[p.clave])}/mes`).join(', ')

  return `Sobre SCdev
- Equipo de desarrollo web de La Plata y Ensenada. Trabaja con PyMEs, comercios y profesionales.
- Precios fijos en pesos, no en dólares.
- Las condiciones de pago y de hosting las confirma el equipo: si preguntan, derivá a WhatsApp.

Servicios y precios de referencia (desde)
${servicios}
- Mantenimiento mensual: ${mantenimiento}.
Son precios de referencia; el valor final depende de lo que necesite cada negocio.`
}
