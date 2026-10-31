import type { SheetConfig } from '../hooks/useSheetConfig'

// Claves de la config (Sheet) con el rango de precio de cada servicio.
export const PRICE_MAP: Record<string, { min: keyof SheetConfig; max: keyof SheetConfig }> = {
  'presencia-web-esencial':   { min: 'price_esencial_min',       max: 'price_esencial_max' },
  'landing-page-profesional': { min: 'price_landing_min',        max: 'price_landing_max' },
  'sitio-web-corporativo':    { min: 'price_corporativo_min',    max: 'price_corporativo_max' },
  'sistema-a-medida':         { min: 'price_sistema_min',        max: 'price_sistema_max' },
  'automatizacion-whatsapp':  { min: 'price_automatizacion_min', max: 'price_automatizacion_max' },
}
