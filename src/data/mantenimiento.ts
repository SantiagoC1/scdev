export const PLANES: { id: string; nombre: string; para: string; destacado?: boolean; descripcion?: string }[] = [
  { id: 'basico', nombre: 'Básico', para: 'Para sitios simples' },
  // `para` ("Recomendado") es el rótulo de la tabla de escritorio. `descripcion` la usa solo la vista de celular, que
  // muestra "Recomendado" como etiqueta aparte. Sale de los beneficios del plan (ver BENEFICIOS).
  {
    id: 'estandar',
    nombre: 'Estándar',
    para: 'Recomendado',
    destacado: true,
    descripcion: 'Para sitios que se actualizan seguido: 2 cambios de contenido por mes, reporte de analytics y backup.',
  },
  { id: 'pro', nombre: 'Pro', para: 'Para negocios activos' },
]

// true = incluido, false = no incluido, string = valor puntual. Un valor por plan, en el orden de PLANES.
export const BENEFICIOS: { texto: string; valores: (boolean | string)[] }[] = [
  { texto: 'Hosting y SSL activos', valores: [true, true, true] },
  { texto: 'Actualizaciones de seguridad', valores: [true, true, true] },
  { texto: 'Soporte por WhatsApp', valores: [true, true, true] },
  { texto: 'Cambios de contenido', valores: [false, '2 por mes', 'Ilimitados'] },
  { texto: 'Reporte mensual de analytics', valores: [false, true, true] },
  { texto: 'Backup mensual', valores: [false, true, true] },
  { texto: 'Prioridad en soporte', valores: [false, false, true] },
  { texto: 'Auditoría SEO trimestral', valores: [false, false, true] },
]

/**
 * Un beneficio no booleano como frase, para la presentación en celular: "Cambios de contenido" + "2 por mes" da
 * "2 cambios de contenido por mes" y + "Ilimitados" da "Cambios de contenido ilimitados". Sale de los mismos datos de arriba.
 */
export function fraseBeneficio(texto: string, valor: string): string {
  const conNumero = valor.match(/^(\d+)\s+(.*)$/)
  return conNumero ? `${conNumero[1]} ${texto.toLowerCase()} ${conNumero[2]}` : `${texto} ${valor.toLowerCase()}`
}
