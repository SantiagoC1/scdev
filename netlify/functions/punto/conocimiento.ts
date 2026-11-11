import { SERVICIOS } from '../../../src/data/servicios.ts'
import { PRICE_MAP } from '../../../src/data/precios.ts'
import { PLANES, BENEFICIOS } from '../../../src/data/mantenimiento.ts'

// Base de conocimiento de Punto: solo información pública y confirmada. Los precios NO se escriben acá:
// salen de la config en vivo (config.ts) y los textos y plazos, de src/data/servicios.ts.
// Los hechos sin confirmar (hosting incluido, 50% de anticipo, validez de 30 días, redes sociales,
// Bot de WhatsApp y Diagnóstico digital) tampoco van: ver "Punto (Parte A)" en docs/pendientes.md.

const pesos = (v: string) => '$' + Number(v).toLocaleString('es-AR')

// Precio mínimo de cada plan de mantenimiento (clave del Sheet), en el orden de PLANES.
const CLAVE_PLAN: Record<string, string> = {
  basico: 'price_mant_basico_min',
  estandar: 'price_mant_estandar_min',
  pro: 'price_mant_pro_min',
}

/** Un plan por línea, con su precio en vivo y exactamente los beneficios de src/data/mantenimiento.ts. */
function planesDeMantenimiento(precios: Record<string, string>): string {
  return PLANES.map((p, i) => {
    const incluye = BENEFICIOS.filter((b) => b.valores[i]).map((b) => (typeof b.valores[i] === 'string' ? `${b.texto} (${b.valores[i]})` : b.texto))
    const noIncluye = BENEFICIOS.filter((b) => !b.valores[i]).map((b) => b.texto)
    return `  - ${p.nombre} (${p.para}): desde ${pesos(precios[CLAVE_PLAN[p.id]])}/mes. Incluye: ${incluye.join(', ')}.${noIncluye.length ? ` No incluye: ${noIncluye.join(', ')}.` : ''}`
  }).join('\n')
}

export function armarConocimiento(precios: Record<string, string>): string {
  const servicios = SERVICIOS.map((s) => {
    const keys = PRICE_MAP[s.id]
    const desde = keys ? pesos(precios[keys.min]) : s.precio
    return `- ${s.nombre}: desde ${desde}, ${s.tiempo}. ${s.descripcion}`
  }).join('\n')

  return `Sobre SCdev
- Equipo de desarrollo web de La Plata y Ensenada. Trabaja con PyMEs, comercios y profesionales.
- Precios fijos en pesos, no en dólares.
- Las condiciones de pago y de hosting las confirma el equipo: si preguntan, derivá a WhatsApp.

Servicios y precios de referencia (desde)
${servicios}
- Mantenimiento mensual (los beneficios de cada plan son exactamente estos; no agregues otros):
${planesDeMantenimiento(precios)}
Son precios de referencia; el valor final depende de lo que necesite cada negocio.`
}
