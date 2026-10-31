/// <reference types="vite/client" />

interface Window {
  /** Config del Sheet que el prerender dejó en el HTML (los precios con los que se generó la página). */
  __SCDEV_CONFIG__?: import('./hooks/useSheetConfig').SheetConfig
}
