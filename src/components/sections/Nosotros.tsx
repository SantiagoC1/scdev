import { Link } from 'react-router-dom'

const STATS = [
  { valor: 10, label: 'proyectos entregados' },
  { valor: 6, label: 'clientes activos' },
  { valor: 4, label: 'personas en el equipo' },
]

function StatCard({ valor, label }: { valor: number; label: string }) {
  return (
    <div className="bg-[#1e1e1e] border border-white/[0.08] rounded-2xl px-6 py-5">
      <div className="font-display font-bold text-4xl text-white leading-none">{valor}</div>
      <div className="text-white/60 text-sm mt-2">{label}</div>
    </div>
  )
}

export default function Nosotros() {
  return (
    <section id="nosotros" className="py-24 bg-[#111111]">
      <div className="max-w-6xl mx-auto px-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          <div>
            <p className="text-sm text-white/60 mb-3">Nosotros</p>
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
              className="inline-block mt-8 text-sm text-accent-text border border-[#D32F2F]/30 px-6 py-3 rounded-lg hover:bg-[#D32F2F]/10 transition-all duration-200"
            >
              Conocé al equipo →
            </Link>
          </div>

          <div className="flex flex-col gap-4">
            {STATS.map((stat) => (
              <StatCard
                key={stat.label}
                valor={stat.valor}
                label={stat.label}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
