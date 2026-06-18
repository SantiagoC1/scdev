export interface Proyecto {
  id: string
  nombre: string
  imagen: string
  tags: string[]
  url: string | null
}

export const PROYECTOS: Proyecto[] = [
  {
    id: 'balance',
    nombre: 'Balance — Agencia de Marketing',
    imagen: '/images/balance.png',
    tags: ['React 19', 'TypeScript', 'Tailwind', 'Framer Motion', 'Vite'],
    url: 'https://somosbalance.com.ar',
  },
  {
    id: 'scdev',
    nombre: 'Portfolio Personal (scdev)',
    imagen: '/images/Scdev.png',
    tags: ['HTML5', 'CSS3', 'JavaScript'],
    url: 'https://scdev.com.ar',
  },
  {
    id: 'adsumpater',
    nombre: 'Adsum Pater (Web App)',
    imagen: '/images/AdsumPater.png',
    tags: ['.NET 8', 'Blazor', 'Firebase', 'Clean Arch'],
    url: 'https://adsumpater.com.ar',
  },
  {
    id: 'centroEventos',
    nombre: 'CentroEventos (CampusFit)',
    imagen: '/images/campusfit.png',
    tags: ['.NET 8', 'Blazor', 'SQLite', 'EF Core'],
    url: null,
  },
]
