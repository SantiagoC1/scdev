import { useState, useEffect, useRef } from 'react'
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

const FOCUSABLE =
  'button:not([disabled]), a[href], input:not([name="_honey"]):not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'

const LABEL_CLASS = 'block text-xs text-white/50 mb-1.5'

const TIENE_WEB_OPCIONES = [{ v: 'si', l: 'Sí' }, { v: 'no', l: 'No' }, { v: 'no_se', l: 'No sé' }]

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
  const timers = useRef<ReturnType<typeof setTimeout>[]>([])
  const nombreRef = useRef<HTMLInputElement>(null)

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

  // Timers de handleSubmit: se cancelan si el componente se desmonta antes
  useEffect(() => () => {
    timers.current.forEach(clearTimeout)
    timers.current = []
  }, [])

  // Al abrir, el foco va al primer campo y al cerrar vuelve al elemento que abrió el modal
  useEffect(() => {
    if (!isOpen) return
    const anterior = document.activeElement as HTMLElement | null
    nombreRef.current?.focus()
    return () => anterior?.focus?.()
  }, [isOpen])

  // Trampa de foco: Tab y Shift+Tab ciclan dentro del diálogo
  const handleDialogKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key !== 'Tab') return
    const items = Array.from(e.currentTarget.querySelectorAll<HTMLElement>(FOCUSABLE))
    if (items.length === 0) return
    const primero = items[0]
    const ultimo = items[items.length - 1]
    if (e.shiftKey && document.activeElement === primero) {
      e.preventDefault()
      ultimo.focus()
    } else if (!e.shiftKey && document.activeElement === ultimo) {
      e.preventDefault()
      primero.focus()
    }
  }

  if (!isOpen) return null

  const schedule = (fn: () => void, ms: number) => {
    timers.current.push(setTimeout(fn, ms))
  }

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

  // Flechas dentro del radiogroup: mueven la selección y el foco
  const handleRadioKeyDown = (e: React.KeyboardEvent<HTMLButtonElement>, i: number) => {
    const paso = e.key === 'ArrowRight' || e.key === 'ArrowDown' ? 1 : e.key === 'ArrowLeft' || e.key === 'ArrowUp' ? -1 : 0
    if (!paso) return
    e.preventDefault()
    const sig = (i + paso + TIENE_WEB_OPCIONES.length) % TIENE_WEB_OPCIONES.length
    handleRadio('tiene_web', TIENE_WEB_OPCIONES[sig].v)
    ;(e.currentTarget.parentElement?.children[sig] as HTMLElement | undefined)?.focus()
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

    let enviado = false

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

      enviado = true
    } catch (err) {
      console.error('[SCdev] Error al enviar el formulario', err instanceof Error ? err.name : 'desconocido')
      setStatus('error')
    } finally {
      setSubmitting(false)
      schedule(() => setStatus('idle'), 4000)
    }

    if (!enviado) return

    // GTM — evento de conversión
    if (typeof window !== 'undefined' && (window as any).dataLayer) {
      (window as any).dataLayer.push({
        event: 'form_submission',
        form_name: 'contacto_scdev',
        servicio: form.servicio,
      })
    }

    setStatus('success')
    setForm(EMPTY_FORM)
    schedule(onClose, 2500)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div aria-hidden="true" onClick={onClose} className="absolute inset-0 bg-black/80 backdrop-blur-sm" />

      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="contact-modal-title"
        onKeyDown={handleDialogKeyDown}
        className="relative w-full max-w-lg max-h-[95vh] overflow-y-auto bg-[#111] border border-white/10 rounded-2xl shadow-2xl"
      >
        <div className="sticky top-0 z-10 flex items-center justify-between px-4 py-3 md:px-6 md:py-4 bg-[#111] border-b border-white/10">
          <h2 id="contact-modal-title" className="font-display text-lg font-bold text-white">Empecemos tu proyecto</h2>
          <button
            onClick={onClose}
            aria-label="Cerrar"
            className="w-8 h-8 flex items-center justify-center rounded-full border border-white/10 text-white/50 hover:text-white hover:border-white/30 transition-all"
          >
            <X size={16} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-4 py-4 md:px-6 md:py-5 flex flex-col gap-4">
          <input type="text" name="_honey" tabIndex={-1} autoComplete="off" style={{ display: 'none' }} onChange={() => {}} />

          <div>
            <label htmlFor="cm-nombre" className={LABEL_CLASS}>Nombre *</label>
            <input ref={nombreRef} type="text" id="cm-nombre" name="nombre" required placeholder="Tu nombre completo"
              value={form.nombre} onChange={handleChange} maxLength={100} className={INPUT_CLASS} />
          </div>

          <div>
            <label htmlFor="cm-email" className={LABEL_CLASS}>Email *</label>
            <input type="email" id="cm-email" name="email" required placeholder="tu@email.com"
              value={form.email} onChange={handleChange} maxLength={254} className={INPUT_CLASS} />
          </div>

          <div>
            <label htmlFor="cm-telefono" className={LABEL_CLASS}>Teléfono / WhatsApp <span className="text-white/60">(opcional)</span>
            </label>
            <input type="tel" id="cm-telefono" name="telefono" placeholder="+54 9 221 XXX-XXXX"
              value={form.telefono} onChange={handleChange} maxLength={20} className={INPUT_CLASS} />
          </div>

          <div>
            <label htmlFor="cm-empresa" className={LABEL_CLASS}>Empresa / Negocio <span className="text-white/60">(opcional)</span>
            </label>
            <input type="text" id="cm-empresa" name="empresa" placeholder="Ej: Ferretería El Tornillo..."
              value={form.empresa} onChange={handleChange} maxLength={200} className={INPUT_CLASS} />
          </div>

          <div>
            <span id="cm-tiene-web-label" className={LABEL_CLASS}>¿Tenés sitio web actualmente?</span>
            <div role="radiogroup" aria-labelledby="cm-tiene-web-label" className="flex gap-2">
              {TIENE_WEB_OPCIONES.map((opt, i) => {
                const marcado = form.tiene_web === opt.v
                const tabStop = marcado || (!form.tiene_web && i === 0)
                return (
                  <button
                    type="button"
                    role="radio"
                    aria-checked={marcado}
                    aria-label={`¿Tenés sitio web actualmente? ${opt.l}`}
                    tabIndex={tabStop ? 0 : -1}
                    key={opt.v}
                    onClick={() => handleRadio('tiene_web', opt.v)}
                    onKeyDown={(e) => handleRadioKeyDown(e, i)}
                    className={`flex-1 py-2 rounded-lg border text-xs font-medium transition-all ${
                      marcado
                        ? 'border-[#D32F2F] bg-[#D32F2F]/15 text-white'
                        : 'border-white/10 text-white/60 hover:border-white/20'
                    }`}
                  >
                    {opt.l}
                  </button>
                )
              })}
            </div>
          </div>

          <div>
            <label htmlFor="cm-servicio" className={LABEL_CLASS}>Servicio de interés *</label>
            <select id="cm-servicio" name="servicio" required value={form.servicio} onChange={handleChange} className={SELECT_CLASS}>
              <option value="">Seleccioná...</option>
              <option value="Presencia Web Esencial">Presencia Web Esencial</option>
              <option value="Landing Page Profesional">Landing Page Profesional</option>
              <option value="Sitio Web Corporativo">Sitio Web Corporativo</option>
              <option value="Sistema a Medida">Sistema / Plataforma a Medida</option>
              <option value="Automatización WhatsApp">Automatización / WhatsApp Bot</option>
              <option value="Mantenimiento Mensual">Plan de Mantenimiento Mensual</option>
              <option value="Otro">Otro / Consulta general</option>
            </select>
          </div>

          <div>
            <label htmlFor="cm-presupuesto" className={LABEL_CLASS}>Presupuesto estimado</label>
            <select id="cm-presupuesto" name="presupuesto" value={form.presupuesto} onChange={handleChange} className={SELECT_CLASS}>
              <option value="">Sin definir / no sé</option>
              <option value="menos_100k">Menos de $100.000 ARS</option>
              <option value="100k_500k">$100.000 – $500.000 ARS</option>
              <option value="500k_1m">$500.000 – $1.000.000 ARS</option>
              <option value="mas_1m">Más de $1.000.000 ARS</option>
            </select>
          </div>

          <div>
            <label htmlFor="cm-urgencia" className={LABEL_CLASS}>¿Cuándo lo necesitás?</label>
            <select id="cm-urgencia" name="urgencia" value={form.urgencia} onChange={handleChange} className={SELECT_CLASS}>
              <option value="">Seleccioná...</option>
              <option value="urgente">Lo antes posible</option>
              <option value="1_mes">En el próximo mes</option>
              <option value="1_3_meses">En 1 a 3 meses</option>
              <option value="explorando">Estoy explorando opciones</option>
            </select>
          </div>

          <div>
            <label htmlFor="cm-mensaje" className={LABEL_CLASS}>Mensaje *</label>
            <textarea id="cm-mensaje" name="mensaje" required rows={3} placeholder="Contame sobre tu proyecto..."
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
