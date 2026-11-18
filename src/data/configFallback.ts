// Precios de respaldo (los mismos que el Sheet). Módulo puro, sin React ni import.meta.env:
// lo usan useSheetConfig (cliente) y la función /api/punto (servidor).
export const PRECIOS_FALLBACK = {
  price_esencial_min: '80000',
  price_esencial_max: '100000',
  price_landing_min: '400000',
  price_landing_max: '700000',
  price_corporativo_min: '800000',
  price_corporativo_max: '1500000',
  price_sistema_min: '1500000',
  price_sistema_max: '4000000',
  price_automatizacion_min: '300000',
  price_automatizacion_max: '900000',
  price_mant_basico_min: '80000',
  price_mant_basico_max: '120000',
  price_mant_estandar_min: '180000',
  price_mant_estandar_max: '250000',
  price_mant_pro_min: '350000',
  price_mant_pro_max: '500000',
}
