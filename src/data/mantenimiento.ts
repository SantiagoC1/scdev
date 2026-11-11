export const PLANES = [
  { id: 'basico', nombre: 'Básico', para: 'Para sitios simples' },
  { id: 'estandar', nombre: 'Estándar', para: 'Recomendado', destacado: true },
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
