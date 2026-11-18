import { Fragment, memo, useMemo } from 'react'
import { parsearMarkdown, type Tramo } from './formato'

function Tramos({ tramos }: { tramos: Tramo[] }) {
  return (
    <>
      {tramos.map((t, i) => (t.negrita ? <strong key={i} className="font-semibold text-white">{t.texto}</strong> : <Fragment key={i}>{t.texto}</Fragment>))}
    </>
  )
}

/**
 * Texto de una respuesta de Punto: párrafos, viñetas y negrita como elementos de React (nada de HTML en crudo, así que
 * lo que no se reconoce queda escapado). Se vuelve a calcular con el texto acumulado en cada actualización del stream.
 */
function TextoPuntoBase({ texto }: { texto: string }) {
  const bloques = useMemo(() => parsearMarkdown(texto), [texto])
  return (
    <div className="flex flex-col gap-2.5">
      {bloques.map((b, i) =>
        b.tipo === 'lista' ? (
          <ul key={i} className="flex list-disc flex-col gap-1.5 pl-5 marker:text-[#D32F2F]">
            {b.items.map((item, j) => (
              <li key={j} className="pl-0.5"><Tramos tramos={item} /></li>
            ))}
          </ul>
        ) : (
          <p key={i}>
            {b.lineas.map((l, j) => (
              <Fragment key={j}>
                {j > 0 && <br />}
                <Tramos tramos={l} />
              </Fragment>
            ))}
          </p>
        ),
      )}
    </div>
  )
}

export const TextoPunto = memo(TextoPuntoBase)
