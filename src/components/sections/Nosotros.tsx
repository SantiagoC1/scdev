import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { m, useInView } from 'framer-motion'

const STATS = [
  { valor: 10, label: 'proyectos entregados' },
  { valor: 6, label: 'clientes activos' },
  { valor: 4, label: 'personas en el equipo' },
]

const DURACION_CONTADOR = 1500

const columnaIzq = {
  hidden: { opacity: 0, x: -30 },
  show: { opacity: 1, x: 0, transition: { duration: 0.6 } },
}

const columnaDer = {
  hidden: {},
  show: { transition: { staggerChildren: 0.15 } },
}

const statCard = {
  hidden: { opacity: 0, x: 30 },
  show: { opacity: 1, x: 0, transition: { duration: 0.5 } },
}

// Cuenta de 0 a `objetivo` con ease-out cubica, sin librerias externas
function useContador(objetivo: number, activo: boolean) {
  const [valor, setValor] = useState(0)

  useEffect(() => {
    if (!activo) return
    let frame = 0
    const inicio = performance.now()

    const tick = (ahora: number) => {
      const avance = Math.min((ahora - inicio) / DURACION_CONTADOR, 1)
      const suavizado = 1 - Math.pow(1 - avance, 3)
      setValor(Math.round(objetivo * suavizado))
      if (avance < 1) frame = requestAnimationFrame(tick)
    }

    frame = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frame)
  }, [objetivo, activo])

  return valor
}

function StatCard({ valor, label, activo }: { valor: number; label: string; activo: boolean }) {
  const actual = useContador(valor, activo)

  return (
    <m.div
      variants={statCard}
      className="bg-[#1e1e1e] border border-white/[0.08] rounded-2xl px-6 py-5"
    >
      <div className="font-display font-bold text-4xl text-accent-text leading-none">{actual}</div>
      <div className="text-white/60 text-sm mt-2">{label}</div>
    </m.div>
  )
}

export default function Nosotros() {
  const statsRef = useRef<HTMLDivElement>(null)
  const statsVisible = useInView(statsRef, { once: true, amount: 0.4 })

  return (
    <section id="nosotros" className="py-24 bg-[#111111]">
      <div className="max-w-6xl mx-auto px-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          <m.div
            variants={columnaIzq}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
          >
            <p className="font-mono text-accent-text text-sm mb-3">Nosotros</p>
            <h2 className="text-3xl md:text-5xl font-bold leading-tight mb-6">
              Una agencia que arrancó con ganas y no paró.
            </h2>

            <div className="flex flex-col gap-4 text-white/60 leading-relaxed">
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

            <Link
              to="/nosotros"
              className="inline-block mt-8 text-sm text-accent-text border border-[#D32F2F]/30 px-6 py-3 rounded-xl hover:bg-[#D32F2F]/10 transition-all duration-200"
            >
              Conocé al equipo →
            </Link>
          </m.div>

          <m.div
            ref={statsRef}
            variants={columnaDer}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            className="flex flex-col gap-4"
          >
            {STATS.map((stat) => (
              <StatCard
                key={stat.label}
                valor={stat.valor}
                label={stat.label}
                activo={statsVisible}
              />
            ))}
          </m.div>
        </div>
      </div>
    </section>
  )
}
