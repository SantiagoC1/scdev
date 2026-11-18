// Uso único: convierte a WebP las imágenes pesadas que referencia el sitio y exporta el favicon.
// Uso: node scripts/optimizar-imagenes.mjs [--borrar-originales]
// Capturas y fotos: máx. 1600 px de ancho. Logos: máx. 512 px. Favicon: PNG 32, 180 y 512.
import sharp from 'sharp'
import fs from 'node:fs'
import path from 'node:path'

const DIR = 'public/images'
const borrar = process.argv.includes('--borrar-originales')

const CAPTURAS = ['AdsumPater.png', 'balance.png', 'Scdev.png', 'campusfit.png']
const LOGOS = ['BalanceLogo.png', 'LogoAdsum-Claro.png', 'LogoCompletoHorizontalFN.png']

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

// Clientes Deca y Diputados Bonaerenses. Los originales pesados están en scripts/fuentes/ (fuera de public/).
// Logos blancos con transparencia: la franja los muestra a 44 px de alto (hasta 2x), por eso 512 px (Deca) y 640 px (Diputados).
// No se publican: deca-azul (no se lee sobre negro), deca-emblema (favicon de Deca, NO es el de SCdev), diputados-emblema-blanco
// (ampliación de una captura) ni diputados-logo-grande (fondo opaco).
for (const [f, ancho] of [['deca-blanco.png', 512], ['diputados-logo-blanco.png', 640]]) {
  const out = path.join(DIR, f.replace(/\.png$/, '.webp'))
  const info = await sharp(path.join('scripts/fuentes', f)).resize({ width: ancho, withoutEnlargement: true }).webp({ quality: 90, alphaQuality: 100, effort: 6 }).toFile(out)
  console.log(`${f} -> ${path.basename(out)} ${info.width}x${info.height} ${(info.size / 1024).toFixed(1)} KB (con transparencia)`)
}
// Capturas 16:10 recortadas de las capturas de pantalla originales ({ left, top, width, height } en px del original).
// Deca: dashboard completo desde el logo, sin la barra de scroll. Diputados: cabecera, navegación y portada, centradas en el contenido.
// `pixelar`: rectángulos (relativos al recorte) que se pixelan para que no se reconozcan personas ni fotos de prensa
// (en Diputados: la nota principal y las dos fotos de la derecha). El encabezado, la navegación y los titulares quedan visibles.
const RECORTES = {
  'deca-captura': { corte: { left: 300, top: 0, width: 1513, height: 946 } },
  'diputados-captura': {
    corte: { left: 355, top: 0, width: 1192, height: 745 },
    pixelar: [
      { left: 0, top: 186, width: 788, height: 552 }, // nota principal (empleados públicos)
      { left: 808, top: 186, width: 384, height: 192 }, // foto de la nota de la derecha (papa)
      { left: 808, top: 488, width: 384, height: 192 }, // foto de la segunda nota de la derecha
    ],
  },
}
const BLOQUE = 28 // px por bloque de pixelado
for (const [base, { corte, pixelar = [] }] of Object.entries(RECORTES)) {
  const out = path.join(DIR, base + '.webp')
  const recorte = await sharp(path.join('scripts/fuentes', base + '.png')).extract(corte).png().toBuffer()
  const capas = []
  for (const z of pixelar) {
    // Dos pasos con buffer intermedio: sharp fusiona dos resize encadenados y solo aplicaría el último.
    const chico = await sharp(recorte).extract(z).resize(Math.ceil(z.width / BLOQUE), Math.ceil(z.height / BLOQUE), { kernel: 'cubic' }).png().toBuffer()
    const trozo = await sharp(chico).resize(z.width, z.height, { kernel: 'nearest' }).png().toBuffer()
    capas.push({ input: trozo, left: z.left, top: z.top })
  }
  const info = await sharp(recorte).composite(capas).webp({ quality: 82, effort: 6 }).toFile(out)
  console.log(`${base}.png -> ${base}.webp ${info.width}x${info.height} ${(info.size / 1024).toFixed(0)} KB${pixelar.length ? ` (${pixelar.length} zonas pixeladas)` : ''}`)
}

// Favicon: se exporta desde scripts/fuentes/LogoChicoFN.png (fuera de public/).
for (const t of [32, 180, 512]) {
  const out = path.join(DIR, `favicon-${t}.png`)
  const info = await sharp(path.join('scripts/fuentes', 'LogoChicoFN.png')).resize(t, t, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } }).png({ compressionLevel: 9 }).toFile(out)
  console.log(`favicon-${t}.png ${(info.size / 1024).toFixed(1)} KB`)
}

// Variantes del carrusel de Trabajos: las cards se muestran a 317 px (celular) y 480 px (escritorio), o el doble en pantallas
// de alta densidad. Se generan -480.webp y -960.webp (solo si son más chicas que el original) para usar con srcset.
const CARRUSEL = ['tabano-captura', 'flor-captura', 'deca-captura', 'diputados-captura', 'UnidosConstruimos', 'balance', 'Scdev', 'AdsumPater', 'campusfit']
for (const base of CARRUSEL) {
  const src = path.join(DIR, base + '.webp')
  const { width } = await sharp(src).metadata()
  for (const ancho of [480, 960]) {
    if (width <= ancho) continue
    const out = path.join(DIR, `${base}-${ancho}.webp`)
    const info = await sharp(src).resize({ width: ancho }).webp({ quality: 80, effort: 6 }).toFile(out)
    console.log(`${base}.webp (${width} px) -> ${path.basename(out)} ${info.width}x${info.height} ${(info.size / 1024).toFixed(0)} KB`)
  }
}
