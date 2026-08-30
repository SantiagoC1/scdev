import sharp from 'sharp'

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
