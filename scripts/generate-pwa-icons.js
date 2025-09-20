import fs from 'fs'
import { createRequire } from 'module'

const require = createRequire(import.meta.url)

// Créer les icônes PWA basées sur notre design
const createPWAIcon = (size) => {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" fill="none">
  <defs>
    <linearGradient id="vinyl-gradient-${size}" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#14b8a6;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#10b981;stop-opacity:1" />
    </linearGradient>
  </defs>
  <rect width="${size}" height="${size}" rx="${size * 0.2}" fill="url(#vinyl-gradient-${size})"/>
  <circle cx="${size / 2}" cy="${size / 2}" r="${size / 2 - 8}" stroke="white" stroke-width="4"/>
  <path d="M${size / 4} ${size / 2}c0-${size / 8} ${size / 32}-${size / 4} ${size / 16}-${size / 3}" stroke="white" stroke-width="3" stroke-linecap="round"/>
  <circle cx="${size / 2}" cy="${size / 2}" r="${size / 16}" fill="white"/>
  <path d="M${(size * 3) / 4} ${size / 2}c0 ${size / 8}-${size / 32} ${size / 4}-${size / 16} ${size / 3}" stroke="white" stroke-width="3" stroke-linecap="round"/>
</svg>`
}

// Créer les fichiers SVG
const icon192 = createPWAIcon(192)
const icon512 = createPWAIcon(512)

// Sauvegarder les fichiers
fs.writeFileSync('public/pwa-192x192.svg', icon192)
fs.writeFileSync('public/pwa-512x512.svg', icon512)

console.log('✅ Icônes PWA SVG créées avec succès !')
console.log('📁 Fichiers créés :')
console.log('  - public/pwa-192x192.svg')
console.log('  - public/pwa-512x512.svg')
console.log('')
console.log(
  '💡 Pour convertir en PNG, utilisez un outil en ligne ou ImageMagick :'
)
console.log('  convert public/pwa-192x192.svg public/pwa-192x192.png')
console.log('  convert public/pwa-512x512.svg public/pwa-512x512.png')
