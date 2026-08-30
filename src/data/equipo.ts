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
    descripcion: 'Desarrollador full-stack y fundador de SCdev. Especializado en React, FastAPI y automatizaciones para PyMEs locales.',
    stack: ['react', 'python', 'fastapi', 'typescript', 'postgresql', 'supabase'],
    foto: '/images/SantaigoCaceres.webp',
    github: 'https://github.com/scdevok-sudo',
  },
  {
    id: 'agustin',
    nombre: 'Agustín Mazzoni',
    rol: 'Full-Stack Developer',
    descripcion: 'Estudiante de Licenciatura en Sistemas en UNLP. Trabaja con Python, FastAPI, Java y bases de datos SQL. Interesado en análisis de requerimientos, incorporación de IA al desarrollo y automatización de tareas.',
    stack: ['python', 'fastapi', 'java', 'javascript', 'html5', 'css3', 'supabase'],
    foto: '/images/AgustinMazzoni.webp',
    email: 'mazzoni.agustine@gmail.com',
  },
  {
    id: 'lucas',
    nombre: 'Lucas Fernández',
    rol: 'Developer',
    descripcion: 'Colaborador de SCdev. Estudiante de Informática en UNLP.',
    stack: [],
    // foto: se agrega cuando esté disponible
  },
  {
    id: 'ezequiel',
    nombre: 'Ezequiel Weber',
    rol: 'Developer',
    descripcion: 'Colaborador de SCdev. Estudiante de Informática en UNLP.',
    stack: [],
    // foto: se agrega cuando esté disponible
  },
]
