import { SERVICIOS } from '../../data/servicios'
import { CONDICION_PAGO } from '../../data/faq'

// Los cuatro pasos salen del proceso ya escrito en la página de Presencia Web Esencial.
const PASOS = SERVICIOS[0].proceso

export default function ComoTrabajamos() {
  return (
    <section id="como-trabajamos" className="py-24 bg-[#0a0a0a]">
      <div className="max-w-6xl mx-auto px-6">
        <h2 className="text-3xl md:text-5xl font-bold mb-12">Cómo trabajamos</h2>

        <ol className="grid gap-8 md:grid-cols-4 md:gap-6">
          {PASOS.map((p) => (
            <li key={p.num} className="border-t border-white/15 pt-5">
              <span className="block font-display font-bold text-white/60 text-sm mb-3">{p.num}</span>
              <h3 className="font-bold text-lg mb-2">{p.titulo}</h3>
              <p className="text-white/70 text-sm leading-relaxed">{p.desc}</p>
            </li>
          ))}
        </ol>

        <p className="mt-12 rounded-2xl border border-white/10 bg-white/[0.03] px-6 py-4 text-white/80">
          <span className="font-semibold text-white">Cómo se paga: </span>
          {CONDICION_PAGO}.
        </p>
      </div>
    </section>
  )
}
