// Punto, la mascota de SCdev. Dibujo de docs/punto/mascota-punto.md, sin el filtro de grano (feTurbulence).
// Solo se animan transform y opacity (clases .punto-* en index.css).

export type EstadoPunto = 'reposo' | 'saludo' | 'escuchando' | 'pensando' | 'hablando' | 'contento' | 'preocupado'

/** Los id del <defs> (pg, pc) van una sola vez por página: se monta una vez y todos los Punto los referencian. */
export function PuntoDefs() {
  return (
    <svg width="0" height="0" aria-hidden="true" focusable="false" style={{ position: 'absolute' }}>
      <defs>
        <radialGradient id="pg" cx="38%" cy="32%" r="75%">
          <stop offset="0" stopColor="#F2535A" />
          <stop offset="0.55" stopColor="#E3242B" />
          <stop offset="1" stopColor="#B3161C" />
        </radialGradient>
        <clipPath id="pc">
          <circle cx="60" cy="58" r="38" />
        </clipPath>
      </defs>
    </svg>
  )
}

interface Props {
  estado?: EstadoPunto
  tamano?: number
  conBrazos?: boolean
  /** En "hablando": true mientras llega un fragmento del texto. */
  bocaAbierta?: boolean
  /** Flotar suavemente (botón flotante y panel). */
  flota?: boolean
}

const BLANCO = '#F5F5F4'
const NEGRO = '#0B0B0C'

// Mirada: las dos pupilas juntas, máximo ±2,5.
const MIRADA: Record<EstadoPunto, [number, number]> = {
  reposo: [0, 0],
  saludo: [0, 0],
  escuchando: [0, 2.5],
  pensando: [1.5, -2.5],
  hablando: [0, 0],
  contento: [0, 0],
  preocupado: [0, 0],
}

const BOCA = {
  contento: 'M50 70 Q60 78 70 70',
  seria: 'M53 71 L67 71',
  preocupado: 'M51 74 Q60 68 69 74',
}

export default function PuntoAvatar({ estado = 'reposo', tamano = 64, conBrazos = false, bocaAbierta = false, flota = true }: Props) {
  const [mx, my] = MIRADA[estado]
  const saltando = estado === 'saludo' || estado === 'contento'
  const guino = estado === 'contento'

  let boca: React.ReactNode
  if (estado === 'pensando') boca = <path d={BOCA.seria} fill="none" stroke={NEGRO} strokeWidth="3.5" strokeLinecap="round" />
  else if (estado === 'preocupado') boca = <path d={BOCA.preocupado} fill="none" stroke={NEGRO} strokeWidth="3.5" strokeLinecap="round" />
  else if (estado === 'hablando' && bocaAbierta) boca = <ellipse cx="60" cy="72" rx="5.5" ry="5" fill={NEGRO} />
  else boca = <path d={BOCA.contento} fill="none" stroke={NEGRO} strokeWidth="3.5" strokeLinecap="round" />

  return (
    <span className={flota ? 'punto-float inline-block' : 'inline-block'} style={{ width: tamano, height: tamano, lineHeight: 0 }}>
      <svg
        viewBox="0 0 120 120"
        width={tamano}
        height={tamano}
        aria-hidden="true"
        focusable="false"
        className={saltando ? 'punto-jump' : undefined}
        key={saltando ? estado : 'quieto'}
      >
        {/* sombra, piernas y brazos: se dibujan antes del cuerpo para quedar detrás */}
        <ellipse cx="60" cy="112" rx="28" ry="4" fill="#26262A" />
        <path d="M50 92 L48 106" stroke={BLANCO} strokeWidth="5" strokeLinecap="round" fill="none" />
        <path d="M70 92 L72 106" stroke={BLANCO} strokeWidth="5" strokeLinecap="round" fill="none" />
        {conBrazos && (
          <>
            <path d="M23 66 L12 80" stroke={BLANCO} strokeWidth="5" strokeLinecap="round" fill="none" />
            {estado === 'saludo' ? (
              <g className="punto-wave">
                <path d="M95 46 L108 28" stroke={BLANCO} strokeWidth="5" strokeLinecap="round" fill="none" />
                <circle cx="109" cy="26" r="4.5" fill={BLANCO} />
              </g>
            ) : (
              <path d="M97 66 L108 80" stroke={BLANCO} strokeWidth="5" strokeLinecap="round" fill="none" />
            )}
          </>
        )}

        {/* cuerpo globo */}
        <circle cx="60" cy="58" r="38" fill="url(#pg)" />
        <g clipPath="url(#pc)">
          <g className={estado === 'pensando' ? 'punto-spin' : undefined}>
            <g transform="rotate(-18 60 58)" fill="none" stroke="#8F1016" strokeOpacity="0.6" strokeWidth="1.4">
              <ellipse cx="60" cy="58" rx="16" ry="38" />
              <ellipse cx="60" cy="58" rx="31" ry="38" />
              <path d="M60 10 L60 106" />
              <path d="M10 58 L110 58" />
              <path d="M14 40 Q60 48 106 40" />
              <path d="M14 76 Q60 68 106 76" />
            </g>
          </g>
        </g>
        <ellipse cx="43" cy="33" rx="9" ry="4.5" fill="#FFFFFF" opacity="0.22" transform="rotate(-30 43 33)" />
        <circle cx="60" cy="58" r="38" fill="none" stroke="#7A0D12" strokeOpacity="0.35" strokeWidth="1" />

        {/* cara */}
        <g className="punto-blink">
          {guino ? (
            <path d="M43 52 L53 52" stroke={NEGRO} strokeWidth="3" strokeLinecap="round" />
          ) : (
            <>
              <ellipse cx="48" cy="52" rx="5" ry="7" fill={BLANCO} />
              <circle cx={49 + mx} cy={53 + my} r="2.6" fill={NEGRO} />
            </>
          )}
          <ellipse cx="72" cy="52" rx="5" ry="7" fill={BLANCO} />
          <circle cx={73 + mx} cy={53 + my} r="2.6" fill={NEGRO} />
        </g>
        {boca}
      </svg>
    </span>
  )
}
