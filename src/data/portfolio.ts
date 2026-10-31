export interface Proyecto {
  id: string
  nombre: string
  imagen: string
  tags: string[]
  url: string | null
  descripcion?: string
  categoria?: string
  repo?: string
  /** 'cliente' = trabajo real entregado; 'demo' = proyecto de muestra. */
  tipo: 'cliente' | 'demo'
  /** false = no se renderiza. Por defecto visible. */
  visible?: boolean
}

export const PROYECTOS: Proyecto[] = [
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
    categoria: 'Plataforma / Sistema a medida',
  },
  {
    id: 'balance',
    tipo: 'cliente',
    nombre: 'Balance, agencia de marketing',
    imagen: '/images/balance.webp',
    tags: ['React 19', 'TypeScript', 'Tailwind', 'Framer Motion', 'Vite'],
    url: 'https://somosbalance.com.ar',
  },
  {
    id: 'scdev',
    tipo: 'demo',
    nombre: 'Portfolio Personal (scdev)',
    imagen: '/images/Scdev.webp',
    tags: ['HTML5', 'CSS3', 'JavaScript'],
    url: 'https://scdev.com.ar',
  },
  {
    id: 'adsumpater',
    tipo: 'cliente',
    nombre: 'Adsum Pater (Web App)',
    imagen: '/images/AdsumPater.webp',
    tags: ['.NET 8', 'Blazor', 'Firebase', 'Clean Arch'],
    url: 'https://adsumpater.com.ar',
  },
  {
    id: 'centroEventos',
    tipo: 'demo',
    nombre: 'CentroEventos (CampusFit)',
    imagen: '/images/campusfit.webp',
    tags: ['.NET 8', 'Blazor', 'SQLite', 'EF Core'],
    url: null,
  },
]
