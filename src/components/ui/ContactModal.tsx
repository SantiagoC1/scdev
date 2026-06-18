import { useState, useEffect } from 'react'
import { X } from 'lucide-react'
import { APPS_SCRIPT_URL } from '../../constants'
import { sanitizeInput, sanitizeEmail, sanitizeTel } from '../../utils/sanitize'
import { useConfig } from '../../context/ConfigContext'
import { buildWALink } from '../../hooks/useSheetConfig'

interface Props {
  isOpen: boolean
  onClose: () => void
  servicioPreseleccionado?: string
}

interface FormState {
  nombre: string
  email: string
  telefono: string
  empresa: string
  tiene_web: string
  servicio: string
  presupuesto: string
  urgencia: string
  mensaje: string
}

const EMPTY_FORM: FormState = {
  nombre: '', email: '', telefono: '', empresa: '',
  tiene_web: '', servicio: '', presupuesto: '', urgencia: '', mensaje: '',
}

const INPUT_CLASS =
  'w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-white text-sm placeholder-white/25 focus:outline-none focus:border-[#D32F2F]/50 transition-colors'

const SELECT_CLASS =
  'w-full bg-[#111] border border-white/10 rounded-lg px-4 py-2.5 text-white text-sm focus:outline-none focus:border-[#D32F2F]/50 transition-colors'

export default function ContactModal({ isOpen, onClose, servicioPreseleccionado = '' }: Props) {
  const config = useConfig()
  const waLink = buildWALink(config.whatsapp_number, config.whatsapp_default_text)

  const [form, setForm] = useState<FormState>({ ...EMPTY_FORM, servicio: servicioPreseleccionado })
  const [submitting, setSubmitting] = useState(false)
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle')

  useEffect(() => {
    if (servicioPreseleccionado) {
      setForm((prev) => ({ ...prev, servicio: servicioPreseleccionado }))
    }
  }, [servicioPreseleccionado])

  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [isOpen])

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [onClose])

  if (!isOpen) return null

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target
    let sanitized = value
    if (name === 'email') sanitized = sanitizeEmail(value)
    else if (name === 'telefono') sanitized = sanitizeTel(value)
    else if (name === 'mensaje') sanitized = sanitizeInput(value, 1000)
    else sanitized = sanitizeInput(value, 200)
    setForm((prev) => ({ ...prev, [name]: sanitized }))
  }

  const handleRadio = (name: string, value: string) => {
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const honey = (e.currentTarget.querySelector('[name="_honey"]') as HTMLInputElement)?.value
    if (honey) return

    setSubmitting(true)

    const payload = {
      nombre: form.nombre,
      email: form.email,
      telefono: form.telefono,
      empresa: form.empresa || '—',
      tiene_web: form.tiene_web || '—',
      servicio: form.servicio,
      presupuesto: form.presupuesto || '—',
      urgencia: form.urgencia || '—',
      mensaje: form.mensaje,
      origen: window.location.href,
    }

    console.log('[SCdev] Enviando lead a:', APPS_SCRIPT_URL)
    console.log('[SCdev] Payload:', payload)

    try {
      const formData = new FormData()
      Object.entries(payload).forEach(([key, value]) => {
        formData.append(key, String(value))
      })

      await fetch(APPS_SCRIPT_URL, {
        method: 'POST',
        mode: 'no-cors',
        body: formData,
      })

      console.log('[SCdev] Fetch completado (no-cors, asumimos éxito)')
      setStatus('success')
      setForm(EMPTY_FORM)
      setTimeout(onClose, 2500)
    } catch (err) {
      console.error('[SCdev] Error en fetch:', err)
      setStatus('error')
    } finally {
      setSubmitting(false)
      setTimeout(() => setStatus('idle'), 4000)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />

      <div className="relative w-full max-w-lg max-h-[95vh] overflow-y-auto bg-[#111] border border-white/10 rounded-2xl shadow-2xl">
        <div className="sticky top-0 z-10 flex items-center justify-between px-4 py-3 md:px-6 md:py-4 bg-[#111] border-b border-white/10">
          <div>
            
            <h2 className="font-display text-lg font-bold text-white">Empecemos tu proyecto</h2>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full border border-white/10 text-white/50 hover:text-white hover:border-white/30 transition-all"
          >
            <X size={16} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-4 py-4 md:px-6 md:py-5 flex flex-col gap-4">
          <input type="text" name="_honey" tabIndex={-1} autoComplete="off" style={{ display: 'none' }} onChange={() => {}} />

          <div>
            <label className="block text-xs text-white/50 mb-1.5">Nombre *</label>
            <input type="text" name="nombre" required placeholder="Tu nombre completo"
              value={form.nombre} onChange={handleChange} maxLength={100} className={INPUT_CLASS} />
          </div>

          <div>
            <label className="block text-xs text-white/50 mb-1.5">Email *</label>
            <input type="email" name="email" required placeholder="tu@email.com"
              value={form.email} onChange={handleChange} maxLength={254} className={INPUT_CLASS} />
          </div>

          <div>
            <label className="block text-xs text-white/50 mb-1.5">
              Teléfono / WhatsApp <span className="text-white/25">(opcional)</span>
            </label>
            <input type="tel" name="telefono" placeholder="+54 9 221 XXX-XXXX"
              value={form.telefono} onChange={handleChange} maxLength={20} className={INPUT_CLASS} />
          </div>

          <div>
            <label className="block text-xs text-white/50 mb-1.5">
              Empresa / Negocio <span className="text-white/25">(opcional)</span>
            </label>
            <input type="text" name="empresa" placeholder="Ej: Ferretería El Tornillo..."
              value={form.empresa} onChange={handleChange} maxLength={200} className={INPUT_CLASS} />
          </div>

          <div>
            <label className="block text-xs text-white/50 mb-1.5">¿Tenés sitio web actualmente?</label>
            <div className="flex gap-2">
              {[{ v: 'si', l: 'Sí' }, { v: 'no', l: 'No' }, { v: 'no_se', l: 'No sé' }].map((opt) => (
                <button
                  type="button"
                  key={opt.v}
                  onClick={() => handleRadio('tiene_web', opt.v)}
                  className={`flex-1 py-2 rounded-lg border text-xs font-medium transition-all ${
                    form.tiene_web === opt.v
                      ? 'border-[#D32F2F] bg-[#D32F2F]/15 text-white'
                      : 'border-white/10 text-white/40 hover:border-white/20'
                  }`}
                >
                  {opt.l}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs text-white/50 mb-1.5">Servicio de interés *</label>
            <select name="servicio" required value={form.servicio} onChange={handleChange} className={SELECT_CLASS}>
              <option value="">Seleccioná...</option>
              <option value="Presencia Web Esencial">Presencia Web Esencial ($80k–$100k)</option>
              <option value="Landing Page Profesional">Landing Page Profesional</option>
              <option value="Sitio Web Corporativo">Sitio Web Corporativo</option>
              <option value="Sistema a Medida">Sistema / Plataforma a Medida</option>
              <option value="Automatización WhatsApp">Automatización / WhatsApp Bot</option>
              <option value="Mantenimiento Mensual">Plan de Mantenimiento Mensual</option>
              <option value="Otro">Otro / Consulta general</option>
            </select>
          </div>

          <div>
            <label className="block text-xs text-white/50 mb-1.5">Presupuesto estimado</label>
            <select name="presupuesto" value={form.presupuesto} onChange={handleChange} className={SELECT_CLASS}>
              <option value="">Sin definir / no sé</option>
              <option value="menos_100k">Menos de $100.000 ARS</option>
              <option value="100k_500k">$100.000 – $500.000 ARS</option>
              <option value="500k_1m">$500.000 – $1.000.000 ARS</option>
              <option value="mas_1m">Más de $1.000.000 ARS</option>
            </select>
          </div>

          <div>
            <label className="block text-xs text-white/50 mb-1.5">¿Cuándo lo necesitás?</label>
            <select name="urgencia" value={form.urgencia} onChange={handleChange} className={SELECT_CLASS}>
              <option value="">Seleccioná...</option>
              <option value="urgente">Lo antes posible</option>
              <option value="1_mes">En el próximo mes</option>
              <option value="1_3_meses">En 1 a 3 meses</option>
              <option value="explorando">Estoy explorando opciones</option>
            </select>
          </div>

          <div>
            <label className="block text-xs text-white/50 mb-1.5">Mensaje *</label>
            <textarea name="mensaje" required rows={3} placeholder="Contame sobre tu proyecto..."
              value={form.mensaje} onChange={handleChange} maxLength={1000}
              className={`${INPUT_CLASS} resize-none`} />
          </div>

          {status === 'success' && (
            <div className="p-3 rounded-lg bg-green-500/10 border border-green-500/30 text-green-400 text-sm text-center">
              ✓ Mensaje enviado. Te respondo en menos de 24hs.
            </div>
          )}
          {status === 'error' && (
            <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-sm text-center">
              ✗ Error al enviar.{' '}
              <a href={waLink} target="_blank" rel="noopener noreferrer" className="underline">
                Escribime por WhatsApp
              </a>
            </div>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-[#D32F2F] text-white font-semibold py-3 rounded-lg hover:bg-[#B71C1C] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_4px_20px_rgba(211,47,47,0.3)]"
          >
            {submitting ? 'Enviando...' : 'Enviar mensaje →'}
          </button>
        </form>
      </div>
    </div>
  )
}
