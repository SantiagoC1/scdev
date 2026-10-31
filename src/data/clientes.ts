export interface Cliente {
  id: string
  nombre: string
  rubro: string
  logo?: string
  /** Tamaño natural del logo (ancho, alto), para reservar espacio sin CLS. */
  logoSize?: [number, number]
  iniciales?: string
  url: string | null
  desc: string
  /** Solo 'cliente' entra a la franja "Confían en SCdev". */
  tipo: 'cliente' | 'demo' | 'propio'
  /** false = no se renderiza. Por defecto visible. */
  visible?: boolean
}

export const CLIENTES: Cliente[] = [
  {
    id: 'balance',
    nombre: 'Balance Agency',
    rubro: 'Agencia de Marketing',
    logo: '/images/BalanceLogo.webp',
    logoSize: [512, 512],
    tipo: 'cliente',
    url: 'https://somosbalance.com.ar',
    desc: 'Sitio web institucional con React, Vite y Framer Motion. Backend en Google Sheets para captura de leads.',
  },
  {
    id: 'padejimas',
    nombre: 'Consultorio Dr. Padejimas',
    // TODO(santi): /images/DrPadegimas.webp es una textura azul sin transparencia, no un logo. Cargar el logo real y volver a poner `logo`.
    tipo: 'cliente',
    rubro: 'Medicina Estética · La Plata',
    iniciales: 'DP',
    url: null,
    desc: 'Implementación de WhatsApp Business con WATI y automatización de atención al paciente.',
  },
  {
    id: 'adsumpater',
    nombre: 'Adsum Pater',
    rubro: 'Comunidad Universitaria',
    logo: '/images/LogoAdsum-Claro.webp',
    logoSize: [512, 777],
    tipo: 'cliente',
    url: 'https://adsumpater.com.ar',
    desc: 'Web app con .NET 8, Blazor WebAssembly y Firebase. Muro de intenciones en tiempo real.',
  },
  {
    id: 'unidos-construimos',
    nombre: 'Unidos Construimos',
    rubro: 'Gestión Ciudadana',
    logo: '/images/UnidosLogoCliente.webp',
    logoSize: [200, 200],
    tipo: 'cliente',
    url: 'https://www.unidosconstruimos.com.ar',
    desc: 'Sistema para la gestión de pedidos de los ciudadanos de Santa Fe. El vecino crea un pedido en minutos y lo sigue en tiempo real. El equipo del Diputado José Corral tiene todo unificado en un solo panel.',
  },
  {
    id: 'tabano',
    nombre: 'Tábano · Cultura y Vida Cristiana',
    rubro: 'Institucional, educación',
    iniciales: 'TB',
    tipo: 'cliente',
    url: 'https://tabanocultura.org/',
    desc: 'Sitio institucional de una asociación civil de educación y cultura. Mantenimiento mensual de contenido.',
  },
  {
    id: 'diputados-bonaerenses',
    // TODO(santi): confirmar con Juan Manuel Negri que podemos mostrar el sitio.
    visible: false,
    nombre: 'Diputados Bonaerenses',
    rubro: 'Medio de noticias',
    iniciales: 'DB',
    tipo: 'cliente',
    url: 'https://diputadosbsas.com.ar/',
    desc: 'Portal de noticias sobre la Legislatura bonaerense. Mantenimiento y corrección de errores.',
  },
]
