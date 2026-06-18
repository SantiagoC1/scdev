export interface Cliente {
  id: string
  nombre: string
  rubro: string
  logo?: string
  iniciales?: string
  url: string | null
  desc: string
}

export const CLIENTES: Cliente[] = [
  {
    id: 'balance',
    nombre: 'Balance Agency',
    rubro: 'Agencia de Marketing',
    logo: '/images/balanceLogo.png',
    url: 'https://somosbalance.com.ar',
    desc: 'Sitio web institucional con React, Vite y Framer Motion. Backend en Google Sheets para captura de leads.',
  },
  {
    id: 'padejimas',
    nombre: 'Consultorio Dr. Padejimas',
    logo: '/images/DrPadegimas.png',
    rubro: 'Medicina Estética · La Plata',
    iniciales: 'DP',
    url: null,
    desc: 'Implementación de WhatsApp Business con WATI y automatización de atención al paciente.',
  },
  {
    id: 'adsumpater',
    nombre: 'Adsum Pater',
    rubro: 'Comunidad Universitaria',
    logo: '/images/LogoAdsum-Claro.png',
    url: 'https://adsumpater.com.ar',
    desc: 'Web app con .NET 8, Blazor WebAssembly y Firebase. Muro de intenciones en tiempo real.',
  },
]
