import { useState } from 'react'
import { motion } from 'framer-motion'
import { APPS_SCRIPT_URL } from '../../constants'
import { useConfig } from '../../context/ConfigContext'
import { buildWALink } from '../../hooks/useSheetConfig'

const SERVICIOS_OPTIONS = [
  'Presencia Web Esencial',
  'Landing Page Profesional',
  'Sitio Web Corporativo',
  'Sistema / Plataforma a Medida',
  'Automatización e IA / WhatsApp',
  'Plan de Mantenimiento',
  'Otro',
]

const INPUT_CLASS =
  'w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-[#D32F2F]/50 transition-colors'

const SELECT_CLASS =
  'w-full bg-[#111] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#D32F2F]/50 transition-colors'

interface FormState {
  nombre: string
  email: string
  empresa: string
  servicio: string
  tiene_web: string
  presupuesto: string
  urgencia: string
  mensaje: string
  _honey: string
}

export default function Contacto() {
  const config = useConfig()
  const waLink = buildWALink(config.whatsapp_number, 'Hola Santi! Quiero cotizar una solución digital.')

  const [form, setForm] = useState<FormState>({
    nombre: '',
    email: '',
    empresa: '',
    servicio: '',
    tiene_web: '',
    presupuesto: '',
    urgencia: '',
    mensaje: '',
    _honey: '',
  })
  const [status, setStatus] = useState<'idle' | 'sending' | 'success' | 'error'>('idle')

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
  ) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (form._honey) return

    setStatus('sending')
    try {
      await fetch(APPS_SCRIPT_URL, {
        method: 'POST',
        mode: 'no-cors',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nombre: form.nombre,
          email: form.email,
          empresa: form.empresa || '—',
          servicio: form.servicio,
          tiene_web: form.tiene_web || '—',
          presupuesto: form.presupuesto || '—',
          urgencia: form.urgencia || '—',
          mensaje: form.mensaje,
        }),
      })
      setStatus('success')
      setForm({ nombre: '', email: '', empresa: '', servicio: '', tiene_web: '', presupuesto: '', urgencia: '', mensaje: '', _honey: '' })
    } catch {
      setStatus('error')
    }
  }

  return (
    <section id="contacto" className="py-24 bg-[#111111]">
      <div className="max-w-6xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-16"
        >
          <p className="font-mono text-[#D32F2F] text-sm mb-3">Contact.init() → Ready</p>
          <h2 className="text-3xl md:text-5xl font-bold">Empecemos tu proyecto</h2>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
          <motion.form
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            onSubmit={handleSubmit}
            className="space-y-5"
          >
            <input
              type="text"
              name="_honey"
              value={form._honey}
              onChange={handleChange}
              style={{ display: 'none' }}
              tabIndex={-1}
              autoComplete="off"
            />

            <div>
              <label className="text-sm text-white/50 block mb-2">Nombre *</label>
              <input
                type="text"
                name="nombre"
                value={form.nombre}
                onChange={handleChange}
                required
                placeholder="Tu nombre"
                className={INPUT_CLASS}
              />
            </div>

            <div>
              <label className="text-sm text-white/50 block mb-2">Email *</label>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                required
                placeholder="tu@email.com"
                className={INPUT_CLASS}
              />
            </div>

            <div>
              <label className="text-sm text-white/50 block mb-2">Empresa / Negocio</label>
              <input
                type="text"
                name="empresa"
                value={form.empresa}
                onChange={handleChange}
                placeholder="Ej: Ferretería El Tornillo, Consultorio Dra. García..."
                className={INPUT_CLASS}
              />
            </div>

            <div>
              <label className="text-sm text-white/50 block mb-2">Servicio de interés</label>
              <select
                name="servicio"
                value={form.servicio}
                onChange={handleChange}
                className={SELECT_CLASS}
              >
                <option value="">Seleccioná un servicio</option>
                {SERVICIOS_OPTIONS.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-sm text-white/50 block mb-2">¿Tenés web actualmente?</label>
              <div className="flex gap-3 flex-wrap">
                {[
                  { v: 'si', l: 'Sí, tengo' },
                  { v: 'no', l: 'No tengo' },
                  { v: 'no_se', l: 'No sé' },
                ].map((opt) => (
                  <label
                    key={opt.v}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg border cursor-pointer text-sm transition-all duration-200 ${
                      form.tiene_web === opt.v
                        ? 'border-[#D32F2F] bg-[#D32F2F]/10 text-white'
                        : 'border-white/10 text-white/50 hover:border-white/20'
                    }`}
                  >
                    <input
                      type="radio"
                      name="tiene_web"
                      value={opt.v}
                      checked={form.tiene_web === opt.v}
                      onChange={handleChange}
                      className="hidden"
                    />
                    {opt.l}
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label className="text-sm text-white/50 block mb-2">Presupuesto estimado</label>
              <select
                name="presupuesto"
                value={form.presupuesto}
                onChange={handleChange}
                className={SELECT_CLASS}
              >
                <option value="">Sin definir / no sé</option>
                <option value="menos_100k">Menos de $100.000 ARS</option>
                <option value="100k_500k">$100.000 – $500.000 ARS</option>
                <option value="500k_1m">$500.000 – $1.000.000 ARS</option>
                <option value="mas_1m">Más de $1.000.000 ARS</option>
              </select>
            </div>

            <div>
              <label className="text-sm text-white/50 block mb-2">¿Cuándo lo necesitás?</label>
              <select
                name="urgencia"
                value={form.urgencia}
                onChange={handleChange}
                className={SELECT_CLASS}
              >
                <option value="">Seleccioná...</option>
                <option value="urgente">Lo antes posible</option>
                <option value="1_mes">En el próximo mes</option>
                <option value="1_3_meses">En 1 a 3 meses</option>
                <option value="explorando">Estoy explorando opciones</option>
              </select>
            </div>

            <div>
              <label className="text-sm text-white/50 block mb-2">Mensaje *</label>
              <textarea
                name="mensaje"
                value={form.mensaje}
                onChange={handleChange}
                required
                rows={4}
                placeholder="Contanos sobre tu proyecto..."
                className={`${INPUT_CLASS} resize-none`}
              />
            </div>

            <button
              type="submit"
              disabled={status === 'sending'}
              className="w-full bg-[#D32F2F] text-white py-4 rounded-xl font-semibold hover:bg-[#B71C1C] transition-all duration-200 disabled:opacity-50 shadow-[0_4px_20px_rgba(211,47,47,0.3)]"
            >
              {status === 'sending' ? 'Enviando...' : 'Enviar mensaje'}
            </button>

            {status === 'success' && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-green-400 text-sm text-center"
              >
                ✓ Mensaje enviado. Te contactamos en menos de 24hs.
              </motion.p>
            )}
            {status === 'error' && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-red-400 text-sm text-center"
              >
                Hubo un error. Escribinos directo por WhatsApp.
              </motion.p>
            )}
          </motion.form>

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="space-y-8"
          >
            <div>
              <h3 className="text-xl font-bold mb-3">¿Preferís por WhatsApp?</h3>
              <p className="text-white/50 mb-4">
                Respondemos en menos de 2 horas en horario laboral.
              </p>
              <a
                href={waLink}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-3 bg-[#25D366]/10 border border-[#25D366]/30 text-[#25D366] px-6 py-4 rounded-xl hover:bg-[#25D366]/20 transition-all duration-200"
              >
                <span className="text-2xl">💬</span>
                <div>
                  <div className="font-semibold">Abrir WhatsApp</div>
                  <div className="text-xs opacity-70">Respuesta en menos de 2hs</div>
                </div>
              </a>
            </div>

            <div className="border-t border-white/10 pt-6">
              <h4 className="font-semibold mb-4">¿Por qué elegirnos?</h4>
              <ul className="space-y-3 text-white/60 text-sm">
                {[
                  'Entregas en tiempo y forma',
                  'Precios accesibles en pesos argentinos',
                  'Código limpio y bien documentado',
                  'Soporte post-entrega incluido',
                ].map((item) => (
                  <li key={item} className="flex items-center gap-2">
                    <span className="text-[#D32F2F]">→</span> {item}
                  </li>
                ))}
              </ul>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
