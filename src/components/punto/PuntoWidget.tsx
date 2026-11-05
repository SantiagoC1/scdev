import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, m } from 'framer-motion'
import { X, Send } from 'lucide-react'
import { Link } from 'react-router-dom'
import PuntoAvatar, { PuntoDefs } from './PuntoAvatar'
import { usePuntoChat } from './usePuntoChat'
import { useVisualViewport, useMediaQuery } from './useVisualViewport'
import { RESPUESTAS_RAPIDAS, MENSAJE_DESACTIVADO } from './respuestasRapidas'
import { servicioDeConversacion, textoWhatsApp } from './servicioWhatsapp'
import { useConfig } from '../../context/ConfigContext'
import { useModal } from '../../context/ModalContext'
import { buildWALink } from '../../hooks/useSheetConfig'
import { track } from '../../utils/track'

const GLOBITO_CLAVE = 'punto-globito'
const GLOBITO_MS = 6000

const leerSesion = () => {
  try { return sessionStorage.getItem(GLOBITO_CLAVE) === '1' } catch { return false }
}
const marcarSesion = () => {
  try { sessionStorage.setItem(GLOBITO_CLAVE, '1') } catch { /* sin storage: el globito puede repetirse */ }
}

export default function PuntoWidget() {
  const config = useConfig()
  const { isOpen: modalAbierto, menuMovilAbierto } = useModal()
  const chat = usePuntoChat(config)
  const [abierto, setAbierto] = useState(false)
  const [globito, setGlobito] = useState(false)
  const [texto, setTexto] = useState('')
  const boton = useRef<HTMLButtonElement>(null)
  const panel = useRef<HTMLDivElement>(null)
  const titulo = useRef<HTMLHeadingElement>(null)
  const lista = useRef<HTMLDivElement>(null)
  const campo = useRef<HTMLInputElement>(null)
  const pantallaBaja = useMediaQuery('(max-height: 499px)') // celular en horizontal, zoom alto: Punto del encabezado más chico

  // Teclado en pantalla: el panel se achica y sube con el visual viewport mientras está abierto.
  useVisualViewport(abierto)
  // En celular (o pantalla baja) el fondo no scrollea con el panel abierto (la regla vive en index.css).
  useEffect(() => {
    if (!abierto) return
    document.documentElement.classList.add('punto-abierto')
    return () => document.documentElement.classList.remove('punto-abierto')
  }, [abierto])

  const waLink = buildWALink(config.whatsapp_number, config.whatsapp_default_text)

  // El botón va solo en el último mensaje que pidió pasar a WhatsApp (no se apilan botones viejos).
  const idUltimoWhatsApp = [...chat.mensajes].reverse().find((x) => x.whatsapp)?.id

  // "Seguir por WhatsApp": el link ya lleva el servicio del que se habló; acá se miden los eventos y Punto se pone contento.
  const seguirPorWhatsApp = () => {
    const servicio = servicioDeConversacion(chat.mensajes)
    track({ event: 'punto_whatsapp', servicio: servicio?.id ?? 'sin_definir' })
    track({ event: 'cta_whatsapp_click', location: 'punto' })
    chat.celebrar()
  }

  // Globito "¿Te ayudo con tu web?": una vez por sesión, a los 20 s o al 50% del scroll.
  useEffect(() => {
    if (leerSesion()) return
    let mostrado = false
    const mostrar = () => {
      if (mostrado) return
      mostrado = true
      marcarSesion()
      setGlobito(true)
      window.setTimeout(() => setGlobito(false), GLOBITO_MS)
    }
    const t = window.setTimeout(mostrar, 20000)
    const onScroll = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight
      if (max > 0 && window.scrollY / max >= 0.5) mostrar()
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => {
      window.clearTimeout(t)
      window.removeEventListener('scroll', onScroll)
    }
  }, [])

  const abrir = () => {
    setGlobito(false)
    marcarSesion()
    setAbierto(true)
    chat.saludar()
    chat.consultarEstado()
    track({ event: 'punto_open' })
  }
  const cerrar = () => setAbierto(false)

  // Foco al abrir (en el título del panel) y vuelta al botón al cerrar (ya visible de nuevo en celular).
  const yaAbrio = useRef(false)
  useEffect(() => {
    if (abierto) {
      yaAbrio.current = true
      titulo.current?.focus()
    } else if (yaAbrio.current) {
      boton.current?.focus()
    }
  }, [abierto])

  // El último mensaje (y el botón de WhatsApp, que aparece al terminar la respuesta) siempre a la vista.
  useEffect(() => {
    lista.current?.scrollTo({ top: lista.current.scrollHeight })
  }, [chat.mensajes, chat.ocupado])

  // Escape cierra y Tab no se escapa del panel, estén donde estén el foco o el tamaño de pantalla. El listener es del documento
  // (no del panel) porque el foco puede quedar en el <body> (p. ej. al deshabilitarse el botón de enviar).
  useEffect(() => {
    if (!abierto) return
    const alTeclear = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault()
        cerrar()
        return
      }
      if (e.key !== 'Tab' || !panel.current) return
      const enfocables = Array.from(panel.current.querySelectorAll<HTMLElement>('button:not([disabled]), a[href], input:not([disabled]), [tabindex="0"]'))
      if (!enfocables.length) return
      const primero = enfocables[0]
      const ultimo = enfocables[enfocables.length - 1]
      const activo = document.activeElement
      if (!panel.current.contains(activo)) {
        e.preventDefault()
        ;(e.shiftKey ? ultimo : primero).focus()
      } else if (e.shiftKey && (activo === primero || activo === titulo.current)) {
        e.preventDefault()
        ultimo.focus()
      } else if (!e.shiftKey && activo === ultimo) {
        e.preventDefault()
        primero.focus()
      }
    }
    document.addEventListener('keydown', alTeclear)
    return () => document.removeEventListener('keydown', alTeclear)
  }, [abierto])

  const enviar = (e: React.FormEvent) => {
    e.preventDefault()
    if (chat.enviarLibre(texto)) {
      setTexto('')
      campo.current?.focus({ preventScroll: true }) // el foco no se pierde al enviar (y el teclado sigue abierto)
    }
  }

  // Con el formulario de contacto abierto, Punto se esconde.
  if (modalAbierto) return null

  return (
    <>
      <PuntoDefs />

      {/* Botón flotante */}
      <div className={`punto-fab ${menuMovilAbierto ? 'hidden' : ''}`} data-abierto={abierto}>
        {globito && !abierto && (
          <div role="status" className="absolute bottom-full right-0 mb-2 w-max max-w-[14rem] rounded-2xl rounded-br-md bg-white text-[#0a0a0a] text-sm px-4 py-2.5 shadow-lg">
            ¿Te ayudo con tu web?
          </div>
        )}
        <button
          ref={boton}
          type="button"
          onClick={() => (abierto ? cerrar() : abrir())}
          aria-label="Abrir el asistente Punto"
          aria-expanded={abierto}
          className="flex h-16 w-16 items-center justify-center rounded-full bg-[#111111] border border-white/15 hover:border-white/40 transition-colors duration-200 shadow-lg"
        >
          <PuntoAvatar tamano={52} estado="reposo" />
        </button>
      </div>

      <AnimatePresence>
        {abierto && (
          <m.div
            ref={panel}
            role="dialog"
            aria-modal="true"
            aria-labelledby="punto-titulo"
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 24 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className="punto-panel"
          >
            {/* Cabecera */}
            <div className="flex flex-none items-center gap-3 border-b border-white/10 px-4 pb-2 pt-3 max-[499px]:py-1.5">
              <PuntoAvatar tamano={pantallaBaja ? 48 : 80} conBrazos estado={chat.estado} bocaAbierta={chat.bocaAbierta} />
              <div className="flex-1 min-w-0">
                {/* Recibe el foco por código al abrir (para anunciar el diálogo); no es un control, por eso sin aro de foco. */}
                <h2 id="punto-titulo" ref={titulo} tabIndex={-1} style={{ outline: 'none' }} className="font-display font-bold text-lg leading-tight">Punto</h2>
                <p className="text-xs text-white/70">Asistente con IA de SCdev</p>
              </div>
              <button
                type="button"
                onClick={cerrar}
                aria-label="Cerrar el asistente"
                className="flex h-11 w-11 items-center justify-center rounded-lg text-white/70 hover:text-white hover:bg-white/5 transition-colors"
              >
                <X size={20} aria-hidden="true" />
              </button>
            </div>

            {/* Conversación (si Punto está apagado: solo un aviso y el botón del equipo) */}
            {chat.desactivado ? (
              <div className="min-h-0 flex-1 px-4 py-6">
                <p role="status" className="text-sm text-white/80 leading-relaxed">{MENSAJE_DESACTIVADO}</p>
              </div>
            ) : (
            <div
              ref={lista}
              role="log"
              aria-live="polite"
              aria-busy={chat.ocupado}
              aria-label="Conversación con Punto"
              tabIndex={0}
              className="flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto overscroll-contain px-4 py-4"
            >
              {chat.mensajes.map((msg) => (
                <div key={msg.id} className={`flex min-w-0 max-w-[85%] flex-col gap-2 ${msg.role === 'user' ? 'self-end' : 'self-start'}`}>
                <div
                  className={`whitespace-pre-line rounded-2xl px-4 py-2.5 text-sm leading-relaxed [overflow-wrap:anywhere] ${
                    msg.role === 'user'
                      ? 'bg-[#D32F2F] text-white rounded-br-md'
                      : msg.error
                        ? 'bg-[#161618] text-[#F5F5F4] rounded-bl-md border border-[#D32F2F]/50'
                        : 'bg-[#161618] text-[#F5F5F4] rounded-bl-md'
                  }`}
                >
                  {msg.texto}
                </div>
                {msg.id === idUltimoWhatsApp && !chat.ocupado && (
                  <a
                    href={buildWALink(config.whatsapp_number, textoWhatsApp(servicioDeConversacion(chat.mensajes)))}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={seguirPorWhatsApp}
                    className="inline-flex min-h-11 items-center justify-center self-start rounded-lg bg-[#D32F2F] px-4 text-sm font-semibold text-white hover:bg-[#B71C1C] transition-colors"
                  >
                    Seguir por WhatsApp
                  </a>
                )}
                </div>
              ))}
              {chat.estado === 'pensando' && (
                <div className="self-start bg-[#161618] text-white/70 rounded-2xl rounded-bl-md px-4 py-2.5 text-sm" aria-hidden="true">…</div>
              )}
              {!chat.hayUsuario && (
                <div className="flex flex-wrap gap-2 pt-1">
                  {RESPUESTAS_RAPIDAS.map((r) => (
                    <button
                      key={r.id}
                      type="button"
                      onClick={() => chat.enviarRapida(r.id)}
                      className="min-h-11 rounded-lg border border-white/20 px-3.5 py-2 text-sm text-white hover:border-white/50 hover:bg-white/5 transition-colors"
                    >
                      {r.boton}
                    </button>
                  ))}
                </div>
              )}
            </div>
            )}

            {/* Entrada */}
            <div className="flex-none border-t border-white/10 px-4 pb-3 pt-3 max-[499px]:pb-2 max-[499px]:pt-2">
              {!chat.desactivado && chat.aviso && <p role="status" className="text-xs text-white/70 mb-2">{chat.aviso}</p>}
              {!chat.desactivado && (
              <form onSubmit={enviar} className="flex gap-2">
                <label htmlFor="punto-input" className="sr-only">Escribí tu mensaje</label>
                <input
                  id="punto-input"
                  ref={campo}
                  type="text"
                  value={texto}
                  maxLength={500}
                  autoComplete="off"
                  disabled={chat.bloqueado}
                  placeholder={chat.bloqueado ? 'Seguí con el equipo por WhatsApp' : 'Escribí tu mensaje'}
                  onChange={(e) => { setTexto(e.target.value); chat.setEscribiendo(e.target.value.length > 0) }}
                  onBlur={() => chat.setEscribiendo(false)}
                  className="min-h-11 flex-1 min-w-0 rounded-lg bg-white/5 border border-white/15 px-3 text-base text-white placeholder:text-white/50 focus:border-white/40 disabled:opacity-50"
                />
                <button
                  type="submit"
                  aria-label="Enviar mensaje"
                  disabled={!texto.trim() || chat.ocupado || chat.bloqueado}
                  className="flex h-11 w-11 flex-none items-center justify-center rounded-lg bg-[#D32F2F] text-white hover:bg-[#B71C1C] disabled:opacity-40 disabled:hover:bg-[#D32F2F] transition-colors"
                >
                  <Send size={18} aria-hidden="true" />
                </button>
              </form>
              )}
              <a
                href={waLink}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => { track({ event: 'cta_whatsapp_click', location: 'punto' }); chat.celebrar() }}
                className="mt-2 flex min-h-11 items-center justify-center rounded-lg border border-white/20 text-sm font-semibold text-white hover:bg-white/5 transition-colors"
              >
                Hablar con el equipo
              </a>
              {!chat.desactivado && (
              <p className="mt-2 text-xs leading-snug text-white/60">
                Punto es un asistente con IA. No compartas datos sensibles.
                <Link to="/privacidad" onClick={cerrar} className="flex min-h-11 items-center underline underline-offset-2 hover:text-white">Cómo usamos tus datos</Link>
              </p>
              )}
            </div>
          </m.div>
        )}
      </AnimatePresence>
    </>
  )
}
