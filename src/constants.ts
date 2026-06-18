export const WA_NUMBER = '5492212029129'
export const WA_DEFAULT = `https://wa.me/${WA_NUMBER}?text=Hola%20Santi!%20Quiero%20cotizar%20una%20soluci%C3%B3n%20digital.`
export const APPS_SCRIPT_URL = import.meta.env.VITE_APPS_SCRIPT_URL as string

export const getWaLink = (text: string) =>
  `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(text)}`
