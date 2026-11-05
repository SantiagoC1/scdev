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
  if (!fs.existsSync(src)) return console.log(`${archivo}: ya convertido, se omite`)
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

// Clientes nuevos (Tábano y Florencia). Las capturas ya vienen en WebP de 1600×1000: si pesan menos de 300 KB no se tocan.
for (const f of ['tabano-captura.webp', 'flor-captura.webp']) {
  const src = path.join(DIR, f)
  const { width, height } = await sharp(src).metadata()
  const kb = fs.statSync(src).size / 1024
  if (width <= 1600 && kb < 300) console.log(`${f}: ${width}x${height} ${kb.toFixed(0)} KB, ya optimizada, no se toca`)
  else console.log(`${f}: ${width}x${height} ${kb.toFixed(0)} KB, supera el límite: convertir a mano`)
}
// Logos con transparencia: los PNG originales viven en scripts/fuentes/ (fuera de public/) y se exportan a WebP de máx. 512 px.
// tabano-logo-blanco se usa en la franja "Confían en SCdev". Los de Florencia (demo) quedan guardados sin usar.
// Las variantes de color y los emblemas de Tábano se quedan como fuentes, sin publicar.
for (const f of ['tabano-logo-blanco.png', 'flor-logo-blanco.png', 'flor-logo-oscuro.png']) {
  const out = path.join(DIR, f.replace(/\.png$/, '.webp'))
  const info = await sharp(path.join('scripts/fuentes', f)).resize({ width: 512, withoutEnlargement: true }).webp({ quality: 90, alphaQuality: 100, effort: 6 }).toFile(out)
  console.log(`${f} -> ${path.basename(out)} ${info.width}x${info.height} ${(info.size / 1024).toFixed(1)} KB (con transparencia)`)
}

// Favicon: se exporta desde scripts/fuentes/LogoChicoFN.png (fuera de public/).
for (const t of [32, 180, 512]) {
  const out = path.join(DIR, `favicon-${t}.png`)
  const info = await sharp(path.join('scripts/fuentes', 'LogoChicoFN.png')).resize(t, t, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } }).png({ compressionLevel: 9 }).toFile(out)
  console.log(`favicon-${t}.png ${(info.size / 1024).toFixed(1)} KB`)
}
