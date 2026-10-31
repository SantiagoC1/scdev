// Rubros del selector del hero. Editable: cada rubro apunta a un servicio de servicios.ts.
export interface Rubro {
  id: string
  label: string
  servicioId: string
  /** Aviso opcional bajo el resultado; enlaza a otro servicio. */
  nota?: { texto: string; servicioId: string }
}

export const RUBROS: Rubro[] = [
  { id: 'oficios', label: 'Oficios', servicioId: 'presencia-web-esencial' },
  {
    id: 'salud',
    label: 'Salud y consultorios',
    servicioId: 'landing-page-profesional',
    nota: { texto: 'Sumá turnos por WhatsApp', servicioId: 'automatizacion-whatsapp' },
  },
  { id: 'comercio', label: 'Comercio y gastronomía', servicioId: 'landing-page-profesional' },
  { id: 'estudio', label: 'Estudio o empresa', servicioId: 'sitio-web-corporativo' },
  { id: 'startup', label: 'Startup o sistema', servicioId: 'sistema-a-medida' },
]
