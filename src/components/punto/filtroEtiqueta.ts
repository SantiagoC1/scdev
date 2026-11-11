const ETIQUETA = '[WHATSAPP]'

/**
 * Saca la etiqueta [WHATSAPP] del texto aunque llegue partida entre fragmentos del stream
 * ("[WHAT" + "SAPP]"). Retiene al final solo lo que todavía puede ser el comienzo de la etiqueta;
 * si el stream termina con una etiqueta a medias, esa cola se descarta (nunca se muestra cruda).
 */
export function crearFiltroEtiqueta() {
  let retenido = ''
  let vista = false

  return {
    /** Devuelve el texto que ya es seguro mostrar. */
    push(fragmento: string): string {
      const t = (retenido + fragmento).replace(/\[WHATSAPP\]/gi, () => {
        vista = true
        return ''
      })
      let k = Math.min(t.length, ETIQUETA.length - 1)
      while (k > 0 && !ETIQUETA.startsWith(t.slice(-k).toUpperCase())) k--
      retenido = t.slice(t.length - k)
      return t.slice(0, t.length - k)
    },
    /** Al terminar el stream: descarta la cola parcial. */
    fin(): string {
      retenido = ''
      return ''
    },
    /** true si la etiqueta apareció (el widget puede mostrar el botón de WhatsApp). */
    get vista() {
      return vista
    },
  }
}
