import { Link } from 'react-router-dom'

const DATOS = ['Lic. en Sistemas, UNLP', 'La Plata y Ensenada', 'Proyectos en producción']

// Una sola fila, máximo 8 íconos.
const STACK = [
  ['react', 'React'],
  ['typescript', 'TypeScript'],
  ['python', 'Python'],
  ['fastapi', 'FastAPI'],
  ['javascript', 'JavaScript'],
  ['postgresql', 'PostgreSQL'],
  ['supabase', 'Supabase'],
  ['tailwindcss', 'Tailwind CSS'],
] as const

const icono = (n: string) => `https://cdn.jsdelivr.net/gh/devicons/devicon/icons/${n}/${n}-original.svg`

export default function Nosotros() {
  return (
    <section id="nosotros" className="py-24 bg-[#0a0a0a]">
      <div className="max-w-6xl mx-auto px-6 grid lg:grid-cols-[1fr_20rem] gap-12 lg:gap-20 items-center">
        <div>
          <h2 className="text-3xl md:text-5xl font-bold leading-tight mb-6">
            Una agencia que arrancó con ganas y no paró.
          </h2>
          <div className="flex flex-col gap-4 text-white/70 leading-relaxed max-w-xl">
            <p>
              SCdev nació para que cada cliente reciba un servicio de calidad real y no un
              template genérico. Arrancar costó, porque había miedo e incertidumbre, pero fue
              lo mejor que nos pasó.
            </p>
            <p>
              Hoy somos cuatro personas en La Plata con un proceso claro de punta a punta.
              Trabajamos por etapas y con reuniones de avance, así siempre sabés cómo viene
              tu proyecto.
            </p>
          </div>

          <ul className="flex flex-wrap gap-2 mt-8">
            {DATOS.map((d) => (
              <li key={d} className="text-sm text-white/80 border border-white/15 rounded-lg px-3 py-1.5">{d}</li>
            ))}
          </ul>

          <ul className="flex items-center gap-3 sm:gap-4 mt-8" aria-label="Tecnologías que usamos">
            {STACK.map(([n, label]) => (
              <li key={n}>
                <img src={icono(n)} alt={label} title={label} width={28} height={28} loading="lazy" decoding="async" className="w-7 h-7 flex-none object-contain" />
              </li>
            ))}
          </ul>

          <Link to="/nosotros" className="inline-block mt-8 text-white underline underline-offset-4 hover:text-white/80">
            Conocer al equipo →
          </Link>
        </div>

        <img
          src="/images/SantaigoCaceres.webp"
          alt="Santiago Cáceres, fundador de SCdev"
          width={480}
          height={640}
          loading="lazy"
          decoding="async"
          className="w-full max-w-xs mx-auto lg:mx-0 h-auto grayscale hover:grayscale-0 transition-[filter] duration-[400ms] ease-out"
        />
      </div>
    </section>
  )
}
