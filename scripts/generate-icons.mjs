import sharp from 'sharp'
import { readFileSync, mkdirSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const root = join(__dirname, '..')
const publicDir = join(root, 'public')

mkdirSync(join(publicDir, 'icons'), { recursive: true })

// Verde primario del proyecto: oklch(0.62 0.18 155) ≈ #15803d
// Azul-morado pastel: oklch(0.58 0.18 278) ≈ #6d28d9 suavizado → #7c3aed
const BG = { r: 109, g: 40, b: 217 }

async function makeIcon(size, outPath) {
  const gym = readFileSync(join(root, 'gym.png'))

  // El ícono: fondo verde redondeado + silueta blanca del gym
  const padding = Math.round(size * 0.18)
  const innerSize = size - padding * 2

  // Convierte la silueta negra en blanca
  const white = await sharp(gym)
    .resize(innerSize, innerSize, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .negate({ alpha: false })
    .toBuffer()

  // Fondo verde con esquinas redondeadas
  const radius = Math.round(size * 0.22)
  const bg = Buffer.from(
    `<svg width="${size}" height="${size}">
      <rect width="${size}" height="${size}" rx="${radius}" ry="${radius}" fill="rgb(${BG.r},${BG.g},${BG.b})"/>
    </svg>`
  )

  await sharp(bg)
    .composite([{ input: white, top: padding, left: padding }])
    .png()
    .toFile(outPath)

  console.log(`✓ ${outPath}`)
}

await makeIcon(180, join(publicDir, 'apple-touch-icon.png'))
await makeIcon(192, join(publicDir, 'icons', 'icon-192.png'))
await makeIcon(512, join(publicDir, 'icons', 'icon-512.png'))
await makeIcon(180, join(publicDir, 'icons', 'icon-180.png'))

console.log('Done.')
