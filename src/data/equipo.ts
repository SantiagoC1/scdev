export interface Integrante {
  id: string
  nombre: string
  rol: string
  descripcion: string
  stack: string[]        // nombres de devicon (igual que en Nosotros.tsx)
  foto?: string          // path a /images/, opcional
  email?: string
  github?: string
  linkedin?: string
}

export const EQUIPO: Integrante[] = [
  {
    id: 'santi',
    nombre: 'Santiago Cáceres',
    rol: 'Founder & Dev Lead',
    descripcion:
      'Desarrollador full-stack y fundador de SCdev. Construyo soluciones digitales para negocios argentinos desde La Plata.',
    stack: [
      'react',
      'typescript',
      'python',
      'fastapi',
      'javascript',
      'postgresql',
      'supabase',
      'tailwindcss',
      'java',
      'docker',
      'nextjs',
      'n8n',
      'git',
    ],
    foto: '/images/SantaigoCaceres.webp',
    linkedin: 'https://www.linkedin.com/in/santiago-caceres01/',
  },
  {
    id: 'agustin',
    nombre: 'Agustín Mazzoni',
    rol: 'Full-Stack Developer',
    descripcion: 'Estudiante de Licenciatura en Sistemas en UNLP. Trabaja con Python, FastAPI, Java y bases de datos SQL. Interesado en análisis de requerimientos, incorporación de IA al desarrollo y automatización de tareas.',
    stack: ['python', 'fastapi', 'java', 'javascript', 'html5', 'css3', 'supabase','postgresql','nextjs','n8n','git','nodejs'],
    foto: '/images/AgustinMazzoni.webp',
    email: 'mazzoni.agustine@gmail.com',
    linkedin: 'https://www.linkedin.com/in/agustin-mazzoni-48044b30b/',
  },
  {
    id: 'lucas',
    nombre: 'Lucas Fernández',
    rol: 'Developer',
    descripcion: 'Colaborador de SCdev. Estudiante de Informática en UNLP.',
    stack: ['python', 'fastapi', 'java', 'javascript', 'html5', 'css3', 'supabase','git',],
    foto: '/images/lucasFernandez.webp',
    linkedin: 'https://www.linkedin.com/in/lucas-fern%C3%A1ndez-121292210/',
  },
  {
    id: 'ezequiel',
    nombre: 'Ezequiel Weber',
    rol: 'Developer',
    descripcion: 'Colaborador de SCdev. Estudiante de Informática en UNLP.',
    stack: ['python', 'fastapi', 'java', 'javascript', 'html5', 'css3', 'supabase','postgresql','git',],
    foto: '/images/EzequielWeber.webp',
    linkedin: 'https://www.linkedin.com/in/ezequiel-weber-2b621a415/',
  },
]
