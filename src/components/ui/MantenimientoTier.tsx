interface Props {
  nombre: string
  precio: string
  descripcion: string
  incluye: string[]
  popular?: boolean
}

export default function MantenimientoTier({
  nombre,
  precio,
  descripcion,
  incluye,
  popular,
}: Props) {
  return (
    <div
      className={`relative rounded-2xl p-6 border transition-all duration-300 ${
        popular
          ? 'bg-[#D32F2F]/10 border-[#D32F2F]/40'
          : 'bg-white/[0.03] border-white/[0.08]'
      }`}
    >
      {popular && (
        <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#D32F2F] text-white text-xs px-3 py-1 rounded-full whitespace-nowrap">
          ★ MÁS ELEGIDO
        </span>
      )}
      <div className="text-sm font-mono text-white/40 mb-1">{nombre}</div>
      <div className="text-2xl font-bold mb-1">{precio}</div>
      <div className="text-white/50 text-sm mb-4">{descripcion}</div>
      <ul className="space-y-2">
        {incluye.map((item) => (
          <li key={item} className="flex items-start gap-2 text-sm text-white/60">
            <span className="text-[#D32F2F] mt-0.5 flex-shrink-0">✓</span>
            {item}
          </li>
        ))}
      </ul>
    </div>
  )
}
