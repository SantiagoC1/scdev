import sharp from 'sharp'

/**
 * Vuelve transparente el fondo claro de una foto sin canal alpha.
 *
 * Usa un flood fill sembrado en los pixeles del borde que ya son casi blancos,
 * asi el recorte se propaga solo por el fondo conectado y nunca perfora zonas
 * claras dentro del sujeto (pelo, ropa, brillos en la piel).
 */
async function quitarFondoClaro(src, { umbral = 215, umbralHalo = 175 } = {}) {
  const { data, info } = await sharp(src).ensureAlpha().raw().toBuffer({ resolveWithObject: true })
  const { width: w, height: h, channels: c } = info

  const esClaro = (i) => Math.min(data[i], data[i + 1], data[i + 2]) >= umbral

  const fondo = new Uint8Array(w * h)
  const pila = []
  const sembrar = (x, y) => {
    const p = y * w + x
    if (fondo[p] || !esClaro(p * c)) return
    fondo[p] = 1
    pila.push(p)
  }

  for (let x = 0; x < w; x++) {
    sembrar(x, 0)
    sembrar(x, h - 1)
  }
  for (let y = 0; y < h; y++) {
    sembrar(0, y)
    sembrar(w - 1, y)
  }

  while (pila.length) {
    const p = pila.pop()
    const x = p % w
    const y = (p / w) | 0
    if (x > 0) sembrar(x - 1, y)
    if (x < w - 1) sembrar(x + 1, y)
    if (y > 0) sembrar(x, y - 1)
    if (y < h - 1) sembrar(x, y + 1)
  }

  // El borde del recorte original deja un halo claro de 1-2 px. Una pasada de
  // dilatacion se lo come: solo toca pixeles lindantes al fondo que ya son claros.
  const halo = new Uint8Array(w * h)
  for (let p = 0; p < w * h; p++) {
    if (fondo[p]) continue
    if (Math.min(data[p * c], data[p * c + 1], data[p * c + 2]) < umbralHalo) continue
    const x = p % w
    const y = (p / w) | 0
    const vecinoDeFondo =
      (x > 0 && fondo[p - 1]) ||
      (x < w - 1 && fondo[p + 1]) ||
      (y > 0 && fondo[p - w]) ||
      (y < h - 1 && fondo[p + w])
    if (vecinoDeFondo) halo[p] = 1
  }

  for (let p = 0; p < w * h; p++) if (fondo[p] || halo[p]) data[p * c + 3] = 0

  return sharp(data, { raw: { width: w, height: h, channels: c } }).png().toBuffer()
}

// Fotos de equipo: cards portrait 3:4 de ancho completo (480x640 alcanza para retina)
const fotos = [
  { src: 'public/images/SantaigoCaceres.png', threshold: 10 },
  { src: 'public/images/AgustinMazzoni.png', threshold: 10 },
  // JPEG sin alpha sobre fondo blanco: hay que recortarlo antes de que el trim sirva
  { src: 'public/images/lucasFernandez.jpeg', threshold: 10, quitarFondo: true },
  { src: 'public/images/EzequielWeber.png', threshold: 10 },
]

for (const { src, threshold, quitarFondo } of fotos) {
  const out = src.replace(/\.(png|jpe?g)$/, '.webp')
  const entrada = quitarFondo ? await quitarFondoClaro(src) : src
  await sharp(entrada)
    // Los originales son recortes con un margen transparente enorme. Sin
    // este trim, el cover/top encuadra sobre el vacio y corta la cara.
    .trim({ threshold })
    .resize(480, 640, { fit: 'cover', position: 'top' })
    .webp({ quality: 85 })
    .toFile(out)
  console.log(`✓ ${out}`)
}

// Imagen del portfolio: la card la renderiza a 320x192, o sea 640x384 en retina
await sharp('public/images/UnidosConstruimos.png')
  .resize(640, 384, { fit: 'cover', position: 'center' })
  .webp({ quality: 85 })
  .toFile('public/images/UnidosConstruimos.webp')
console.log('✓ public/images/UnidosConstruimos.webp')
