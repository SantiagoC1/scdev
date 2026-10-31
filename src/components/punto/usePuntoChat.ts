import { useCallback, useEffect, useRef, useState } from 'react'
import type { EstadoPunto } from './PuntoAvatar'
import { RESPUESTAS_RAPIDAS, RESPUESTA_SIN_IA, SALUDO_INICIAL } from './respuestasRapidas'
import type { SheetConfig } from '../../hooks/useSheetConfig'

export interface Mensaje {
  id: number
  role: 'user' | 'assistant'
  texto: string
}

const ESPERA_ENTRE_MENSAJES_MS = 3000
const CIERRE_BOCA_MS = 120

/**
 * Estado del chat de Punto. En esta fase (sin IA) las respuestas son fijas, pero se entregan en
 * fragmentos para que los estados pensando y hablando funcionen igual que con el stream real.
 */
export function usePuntoChat(config: SheetConfig) {
  const [mensajes, setMensajes] = useState<Mensaje[]>([{ id: 0, role: 'assistant', texto: SALUDO_INICIAL }])
  const [estado, setEstado] = useState<EstadoPunto>('reposo')
  const [bocaAbierta, setBocaAbierta] = useState(false)
  const [escribiendo, setEscribiendo] = useState(false)
  const [aviso, setAviso] = useState('')
  const timers = useRef<ReturnType<typeof setTimeout>[]>([])
  const ultimoEnvio = useRef(0)
  const idSiguiente = useRef(1)
  const ocupado = estado === 'pensando' || estado === 'hablando'

  const limpiar = () => {
    timers.current.forEach(clearTimeout)
    timers.current = []
  }
  const programar = (fn: () => void, ms: number) => {
    timers.current.push(setTimeout(fn, ms))
  }
  useEffect(() => limpiar, [])

  // Mientras la persona escribe, Punto la mira; el resto de los estados tiene prioridad.
  useEffect(() => {
    if (estado === 'reposo' && escribiendo) setEstado('escuchando')
    else if (estado === 'escuchando' && !escribiendo) setEstado('reposo')
  }, [escribiendo, estado])

  const hablar = useCallback((texto: string) => {
    const fragmentos = texto.match(/\S+\s*/g) ?? [texto]
    const id = idSiguiente.current++
    setMensajes((m) => [...m, { id, role: 'assistant', texto: '' }])
    setEstado('hablando')
    let acumulado = ''
    fragmentos.forEach((f, i) => {
      programar(() => {
        acumulado += f
        const parcial = acumulado
        setMensajes((m) => m.map((x) => (x.id === id ? { ...x, texto: parcial } : x)))
        setBocaAbierta(true)
        programar(() => setBocaAbierta(false), CIERRE_BOCA_MS)
        if (i === fragmentos.length - 1) programar(() => setEstado('reposo'), CIERRE_BOCA_MS)
      }, 55 * (i + 1))
    })
  }, [])

  const enviar = useCallback(
    (texto: string, respuesta: string) => {
      const ahora = Date.now()
      if (ocupado) return false
      if (ahora - ultimoEnvio.current < ESPERA_ENTRE_MENSAJES_MS) {
        setAviso('Un segundito, que todavía estoy pensando.')
        return false
      }
      ultimoEnvio.current = ahora
      setAviso('')
      setMensajes((m) => [...m, { id: idSiguiente.current++, role: 'user', texto }])
      setEscribiendo(false)
      setEstado('pensando')
      programar(() => hablar(respuesta), 700)
      return true
    },
    [hablar, ocupado],
  )

  const enviarRapida = (id: string) => {
    const r = RESPUESTAS_RAPIDAS.find((x) => x.id === id)
    if (r) enviar(r.boton, r.respuesta(config))
  }
  const enviarLibre = (texto: string) => {
    const t = texto.trim().slice(0, 500)
    return t ? enviar(t, RESPUESTA_SIN_IA) : false
  }

  /** Al abrir el panel: saluda una vez y vuelve a reposo. */
  const saludar = () => {
    limpiar()
    setEstado('saludo')
    programar(() => setEstado('reposo'), 1700)
  }
  /** Cuando la persona va a WhatsApp: Punto se pone contento. */
  const celebrar = () => {
    limpiar()
    setEstado('contento')
    programar(() => setEstado('reposo'), 1700)
  }

  return { mensajes, estado, bocaAbierta, aviso, ocupado, setEscribiendo, enviarRapida, enviarLibre, saludar, celebrar, hayUsuario: mensajes.some((m) => m.role === 'user') }
}
