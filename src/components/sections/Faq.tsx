import { ChevronDown } from 'lucide-react'
import { FAQ } from '../../data/faq'

export default function Faq() {
  return (
    <section id="preguntas" className="py-24 bg-[#111111]">
      <div className="max-w-3xl mx-auto px-6">
        <h2 className="text-3xl md:text-5xl font-bold mb-10">Preguntas frecuentes</h2>
        <div className="divide-y divide-white/10 border-y border-white/10">
          {FAQ.map((f) => (
            <details key={f.pregunta} className="group py-5">
              <summary className="flex items-center justify-between gap-4 cursor-pointer list-none font-semibold [&::-webkit-details-marker]:hidden">
                {f.pregunta}
                <ChevronDown size={20} aria-hidden="true" className="flex-none text-white/70 transition-transform duration-200 group-open:rotate-180" />
              </summary>
              <p className="mt-3 text-white/70 leading-relaxed">{f.respuesta}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  )
}
