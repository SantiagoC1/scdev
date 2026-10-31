// Uso único: convierte a WebP las imágenes pesadas que referencia el sitio y exporta el favicon.
// Uso: node scripts/optimizar-imagenes.mjs [--borrar-originales]
// Capturas y fotos: máx. 1600 px de ancho. Logos: máx. 512 px. Favicon: PNG 32, 180 y 512.
import sharp from 'sharp'
import fs from 'node:fs'
import path from 'node:path'

const DIR = 'public/images'
const borrar = process.argv.includes('--borrar-originales')

const CAPTURAS = ['AdsumPater.png', 'balance.png', 'Scdev.png', 'campusfit.png']
const LOGOS = ['BalanceLogo.png', 'DrPadegimas.png', 'LogoAdsum-Claro.png', 'LogoCompletoHorizontalFN.png']

async function aWebp(archivo, ancho) {
  const src = path.join(DIR, archivo)
  const out = src.replace(/\.\w+$/, '.webp')
  let calidad = 82
  let info
  do {
    info = await sharp(src).resize({ width: ancho, withoutEnlargement: true }).webp({ quality: calidad, effort: 6 }).toFile(out)
    calidad -= 8
  } while (info.size > 300 * 1024 && calidad > 40)
  console.log(`${archivo} (${(fs.statSync(src).size / 1024).toFixed(0)} KB) -> ${path.basename(out)} ${info.width}x${info.height} ${(info.size / 1024).toFixed(0)} KB`)
  if (borrar) fs.unlinkSync(src)
}

for (const f of CAPTURAS) await aWebp(f, 1600)
for (const f of LOGOS) await aWebp(f, 512)

// Favicon: se exporta desde el original y el PNG pesado queda solo como fuente.
for (const t of [32, 180, 512]) {
  const out = path.join(DIR, `favicon-${t}.png`)
  const info = await sharp(path.join(DIR, 'LogoChicoFN.png')).resize(t, t, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } }).png({ compressionLevel: 9 }).toFile(out)
  console.log(`favicon-${t}.png ${(info.size / 1024).toFixed(1)} KB`)
}
