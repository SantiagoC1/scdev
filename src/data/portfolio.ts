export interface Proyecto {
  id: string
  nombre: string
  imagen: string
  /** Ancho en px del archivo `imagen`. Si está, la card usa srcset con las variantes -480.webp y -960.webp (scripts/optimizar-imagenes.mjs). */
  anchoImagen?: number
  tags: string[]
  url: string | null
  descripcion?: string
  categoria?: string
  repo?: string
  /** 'cliente' = trabajo real entregado; 'demo' = proyecto de muestra; 'propio' = un proyecto de SCdev. */
  tipo: 'cliente' | 'demo' | 'propio'
  /** Texto del chip sobre la imagen (por defecto "Demo" en los demos). */
  chip?: string
  /** Rubro, para el texto de la card. */
  rubro?: string
  /** false = no se renderiza. Por defecto visible. */
  visible?: boolean
}

export const PROYECTOS: Proyecto[] = [
  // Orden: Tábano, Florencia y después los que ya estaban. SGI (Deca) y Diputados siguen ocultos (visible: false).
  // Tábano y Florencia: sin chips de tecnología porque no conocemos su stack; los chips son del tipo de proyecto (máx. 3).
  {
    id: 'tabano',
    tipo: 'cliente',
    nombre: 'Tábano · Cultura y Vida Cristiana',
    rubro: 'Institucional, educación',
    descripcion: 'Sitio institucional de una asociación civil de educación y cultura. Mantenimiento mensual de contenido.',
    imagen: '/images/tabano-captura.webp',
    anchoImagen: 1600,
    tags: ['Sitio institucional', 'Mantenimiento mensual'],
    url: 'https://tabanocultura.org/',
  },
  {
    id: 'florencia-inveninato',
    tipo: 'cliente', // sin cartel "Demo" ni link: ya no se enlaza al sistema (https://demo-flor.vercel.app/pacientes)
    nombre: 'Florencia Inveninato',
    rubro: 'Salud, consultorio',
    descripcion: 'Sistema de gestión de pacientes y agenda para un consultorio de ortodoncia con dos sedes.',
    imagen: '/images/flor-captura.webp',
    anchoImagen: 1600,
    tags: ['Sistema a medida'],
    url: null,
  },
  {
    id: 'deca-sgi',
    // TODO(santi): pedir permiso a Juan Sequeira antes de mostrarlo. Hasta entonces no se renderiza.
    // Cuando se active: sin nombre ni logo de Deca, salvo que Santi lo autorice. Sin imagen por ahora.
    visible: false,
    tipo: 'demo',
    chip: 'Demo con datos de ejemplo',
    nombre: 'SGI · Sistema de gestión integral',
    rubro: 'Sistema a medida',
    descripcion: 'Demo de un módulo de seguridad e higiene: dashboard de cumplimiento, capacitaciones, vencimientos e inspecciones de equipos.',
    imagen: '',
    tags: [],
    url: 'https://demo-deca.vercel.app/dashboard',
  },
  {
    id: 'diputados-bonaerenses',
    // TODO(santi): confirmar con Juan Manuel Negri que podemos mostrar el sitio. Hasta entonces no se renderiza. Sin imagen por ahora.
    visible: false,
    tipo: 'cliente',
    nombre: 'Diputados Bonaerenses',
    rubro: 'Medio de noticias',
    descripcion: 'Portal de noticias sobre la Legislatura bonaerense. Mantenimiento y corrección de errores.',
    imagen: '',
    tags: [],
    url: 'https://diputadosbsas.com.ar/',
  },
  {
    id: 'unidos-construimos',
    tipo: 'cliente',
    nombre: 'Unidos Construimos',
    descripcion:
      'Plataforma de gestión de consultas ciudadanas para el equipo del Diputado Provincial José Corral (Santa Fe). Los vecinos registran pedidos y reclamos, el equipo los gestiona y el portal de transparencia muestra las estadísticas públicas sin datos personales. Cumple Ley 25.326.',
    tags: ['Next.js 16', 'Supabase', 'TypeScript', 'Tailwind CSS v4', 'Resend', 'Vercel'],
    url: 'https://www.unidosconstruimos.com.ar',
    repo: 'https://github.com/scdevok-sudo/Ticketera',
    imagen: '/images/UnidosConstruimos.webp',
    anchoImagen: 640,
    categoria: 'Plataforma / Sistema a medida',
  },
  {
    id: 'balance',
    tipo: 'cliente',
    nombre: 'Balance, agencia de marketing',
    imagen: '/images/balance.webp',
    anchoImagen: 1600,
    tags: ['React 19', 'TypeScript', 'Tailwind', 'Framer Motion', 'Vite'],
    url: 'https://somosbalance.com.ar',
  },
  {
    id: 'scdev',
    tipo: 'propio',
    nombre: 'Sitio de SCdev',
    imagen: '/images/Scdev.webp',
    anchoImagen: 1280,
    tags: ['React 19', 'TypeScript', 'Tailwind v4'],
    url: 'https://scdev.com.ar',
  },
  {
    id: 'adsumpater',
    tipo: 'cliente',
    nombre: 'Adsum Pater (Web App)',
    imagen: '/images/AdsumPater.webp',
    anchoImagen: 1600,
    tags: ['.NET 8', 'Blazor', 'Firebase', 'Clean Arch'],
    url: 'https://adsumpater.com.ar',
  },
  {
    id: 'centroEventos',
    tipo: 'demo',
    nombre: 'CentroEventos (CampusFit)',
    imagen: '/images/campusfit.webp',
    anchoImagen: 751,
    tags: ['.NET 8', 'Blazor', 'SQLite', 'EF Core'],
    url: null,
  },
]
