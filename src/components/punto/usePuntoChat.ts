import { useCallback, useEffect, useRef, useState } from 'react'
import type { EstadoPunto } from './PuntoAvatar'
import { RESPUESTAS_RAPIDAS, SALUDO_INICIAL, MENSAJE_ERROR, MENSAJE_LIMITE, MENSAJE_RAPIDO } from './respuestasRapidas'
import { crearFiltroEtiqueta } from './filtroEtiqueta'
import type { SheetConfig } from '../../hooks/useSheetConfig'

export interface Mensaje {
  id: number
  role: 'user' | 'assistant'
  texto: string
  /** Mensaje de error de Punto (no se manda al modelo como historial). */
  error?: boolean
  /** El modelo pidió pasar a WhatsApp (la etiqueta ya se sacó del texto). */
  whatsapp?: boolean
}

const ESPERA_ENTRE_MENSAJES_MS = 3000
const CIERRE_BOCA_MS = 120
const PREOCUPADO_MS = 4000
const ESPERA_PRIMER_FRAGMENTO_MS = 20000 // el servidor puede probar hasta 3 proveedores de 5 s
const ESPERA_ENTRE_FRAGMENTOS_MS = 15000
const HISTORIAL_MAX = 8

/**
 * Estado del chat de Punto. Los 3 botones rápidos responden con textos fijos (entregados en fragmentos);
 * el texto libre va a /api/punto y se lee el stream: "pensando" hasta el primer fragmento, "hablando" mientras llega,
 * "preocupado" si algo falla.
 */
export function usePuntoChat(config: SheetConfig) {
  const [mensajes, setMensajes] = useState<Mensaje[]>([{ id: 0, role: 'assistant', texto: SALUDO_INICIAL }])
  const [estado, setEstado] = useState<EstadoPunto>('reposo')
  const [bocaAbierta, setBocaAbierta] = useState(false)
  const [escribiendo, setEscribiendo] = useState(false)
  const [aviso, setAviso] = useState('')
  const [bloqueado, setBloqueado] = useState(false)
  const [desactivado, setDesactivado] = useState(false) // PUNTO_ACTIVO=false: el panel muestra solo "Hablar con el equipo"
  const estadoConsultado = useRef(false)
  const timers = useRef<ReturnType<typeof setTimeout>[]>([])
  const ultimoEnvio = useRef(0)
  const idSiguiente = useRef(1)
  const mensajesRef = useRef(mensajes)
  const abortar = useRef<AbortController | null>(null)
  const ocupado = estado === 'pensando' || estado === 'hablando'

  mensajesRef.current = mensajes

  const limpiar = () => {
    timers.current.forEach(clearTimeout)
    timers.current = []
  }
  const programar = (fn: () => void, ms: number) => {
    timers.current.push(setTimeout(fn, ms))
  }
  useEffect(
    () => () => {
      limpiar()
      abortar.current?.abort()
    },
    [],
  )

  // Mientras la persona escribe, Punto la mira; el resto de los estados tiene prioridad.
  useEffect(() => {
    if (estado === 'reposo' && escribiendo) setEstado('escuchando')
    else if (estado === 'escuchando' && !escribiendo) setEstado('reposo')
  }, [escribiendo, estado])

  const abrirBoca = () => {
    setBocaAbierta(true)
    programar(() => setBocaAbierta(false), CIERRE_BOCA_MS)
  }

  /** Respuesta fija, entregada en fragmentos para que pensando y hablando se vean igual que con el stream real. */
  const hablarFijo = useCallback((texto: string) => {
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
        abrirBoca()
        if (i === fragmentos.length - 1) programar(() => setEstado('reposo'), CIERRE_BOCA_MS)
      }, 55 * (i + 1))
    })
  }, [])

  const preocupar = (error: 'limite' | 'conexion' | 'rapido') => {
    const texto = error === 'limite' ? MENSAJE_LIMITE : error === 'rapido' ? MENSAJE_RAPIDO : MENSAJE_ERROR
    setMensajes((m) => [...m, { id: idSiguiente.current++, role: 'assistant', texto, error: true, whatsapp: error === 'limite' }])
    if (error === 'limite') setBloqueado(true)
    setEstado('preocupado')
    programar(() => setEstado('reposo'), PREOCUPADO_MS)
  }

  /** Pide la respuesta a /api/punto y la va mostrando a medida que llega el stream. */
  const consultarIA = async (historial: { role: 'user' | 'assistant'; content: string }[]) => {
    const ctl = new AbortController()
    abortar.current = ctl
    let espera = setTimeout(() => ctl.abort(), ESPERA_PRIMER_FRAGMENTO_MS)
    const rearmar = (ms: number) => {
      clearTimeout(espera)
      espera = setTimeout(() => ctl.abort(), ms)
    }
    let id = 0
    let crudo = ''
    const filtro = crearFiltroEtiqueta()
    const mostrar = (texto: string, whatsapp = false) =>
      setMensajes((m) => m.map((x) => (x.id === id ? { ...x, texto: texto.trimEnd(), whatsapp: whatsapp || x.whatsapp } : x)))

    try {
      const r = await fetch('/api/punto', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mensajes: historial }),
        signal: ctl.signal,
      })
      if (r.status === 503 && (await r.clone().json().then((j: { error?: string }) => j.error, () => undefined)) === 'desactivado') {
        setDesactivado(true)
        setEstado('reposo')
        return
      }
      if (r.status === 429) {
        // 'intervalo': mensajes muy seguidos (no bloquea). 'limite' / 'tope': tope por IP o global del día (bloquea el campo).
        const motivo = await r.json().then((j: { error?: string }) => j.error, () => undefined)
        return preocupar(motivo === 'intervalo' ? 'rapido' : 'limite')
      }
      if (!r.ok || !r.body) return preocupar('conexion')

      const lector = r.body.getReader()
      const dec = new TextDecoder()
      let buf = ''
      let terminado = false
      while (!terminado) {
        const { value, done } = await lector.read()
        if (done) break
        rearmar(ESPERA_ENTRE_FRAGMENTOS_MS)
        buf += dec.decode(value, { stream: true })
        let i: number
        while ((i = buf.indexOf('\n')) >= 0) {
          const linea = buf.slice(0, i).trim()
          buf = buf.slice(i + 1)
          if (!linea.startsWith('data:')) continue
          const dato = linea.slice(5).trim()
          if (dato === '[DONE]') {
            terminado = true
            break
          }
          let ev: { delta?: string; error?: string }
          try {
            ev = JSON.parse(dato)
          } catch {
            continue
          }
          if (ev.error) throw new Error(ev.error)
          if (!ev.delta) continue
          const visible = filtro.push(ev.delta)
          if (!id) {
            // Primer fragmento: nace la burbuja de Punto y pasa de "pensando" a "hablando".
            id = idSiguiente.current++
            setMensajes((m) => [...m, { id, role: 'assistant', texto: '' }])
            setEstado('hablando')
          }
          if (visible) {
            crudo += visible
            mostrar(crudo, filtro.vista)
            abrirBoca()
          } else if (filtro.vista) {
            mostrar(crudo, true)
          }
        }
      }
      filtro.fin()
      if (!crudo.trim()) {
        if (id) setMensajes((m) => m.filter((x) => x.id !== id))
        return preocupar('conexion')
      }
      mostrar(crudo, filtro.vista)
      programar(() => setEstado('reposo'), CIERRE_BOCA_MS)
    } catch {
      // Cortado (a mitad de respuesta o sin respuesta): se conserva el texto parcial y se muestra el mensaje de error.
      filtro.fin()
      if (crudo.trim()) mostrar(crudo, filtro.vista) // lo que llegó se conserva, pero se avisa que quedó cortado
      else if (id) setMensajes((m) => m.filter((x) => x.id !== id))
      preocupar('conexion')
    } finally {
      clearTimeout(espera)
      if (abortar.current === ctl) abortar.current = null
    }
  }

  /** Antirrebote y estado compartidos por los botones y el texto libre. Devuelve true si el mensaje salió. */
  const enviar = (texto: string, accion: () => void) => {
    const ahora = Date.now()
    if (ocupado || bloqueado) return false
    if (ahora - ultimoEnvio.current < ESPERA_ENTRE_MENSAJES_MS) {
      setAviso('Un segundito, que todavía estoy pensando.')
      return false
    }
    ultimoEnvio.current = ahora
    setAviso('')
    setMensajes((m) => [...m, { id: idSiguiente.current++, role: 'user', texto }])
    setEscribiendo(false)
    setEstado('pensando')
    accion()
    return true
  }

  const enviarRapida = (id: string) => {
    const r = RESPUESTAS_RAPIDAS.find((x) => x.id === id)
    if (r) enviar(r.boton, () => programar(() => hablarFijo(r.respuesta(config)), 700))
  }

  const enviarLibre = (texto: string) => {
    const t = texto.trim().slice(0, 500)
    if (!t) return false
    // Historial para el modelo: sin mensajes de error, hasta HISTORIAL_MAX, terminando en el mensaje nuevo.
    const previo = mensajesRef.current.filter((m) => !m.error && m.texto).map((m) => ({ role: m.role, content: m.texto }))
    const historial = [...previo, { role: 'user' as const, content: t }].slice(-HISTORIAL_MAX)
    return enviar(t, () => {
      void consultarIA(historial)
    })
  }

  /** Al abrir el panel (una vez por visita): pregunta a /api/punto si está activo. Si no responde, se asume que sí. */
  const consultarEstado = () => {
    if (estadoConsultado.current) return
    estadoConsultado.current = true
    fetch('/api/punto', { cache: 'no-store' })
      .then((r) => (r.ok ? r.json() : null))
      .then((j: { activo?: boolean } | null) => {
        if (j && j.activo === false) setDesactivado(true)
      })
      .catch(() => {})
  }

  /** Al abrir el panel: saluda una vez y vuelve a reposo (si no está en medio de una respuesta). */
  const saludar = () => {
    if (ocupado) return
    limpiar()
    setEstado('saludo')
    programar(() => setEstado('reposo'), 1700)
  }
  /** Cuando la persona va a WhatsApp: Punto se pone contento. */
  const celebrar = () => {
    if (ocupado) return
    limpiar()
    setEstado('contento')
    programar(() => setEstado('reposo'), 1700)
  }

  return {
    mensajes,
    estado,
    bocaAbierta,
    aviso,
    ocupado,
    bloqueado,
    desactivado,
    consultarEstado,
    setEscribiendo,
    enviarRapida,
    enviarLibre,
    saludar,
    celebrar,
    hayUsuario: mensajes.some((m) => m.role === 'user'),
  }
}
