import sharp from 'sharp'

// Fotos de equipo: avatares circulares de 80 px (160 en retina)
const fotos = [
  'public/images/SantaigoCaceres.png',
  'public/images/AgustinMazzoni.png',
]

for (const foto of fotos) {
  const out = foto.replace('.png', '.webp')
  await sharp(foto)
    // Los originales son recortes con un margen transparente enorme. Sin
    // este trim, el cover/top encuadra sobre el vacio y corta la cara.
    .trim({ threshold: 10 })
    .resize(160, 160, { fit: 'cover', position: 'top' })
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
