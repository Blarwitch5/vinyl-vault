#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Créer des icônes PWA basiques à partir du favicon SVG
// Dans un vrai projet, vous utiliseriez pwa-asset-generator ou un outil similaire

const publicDir = path.join(__dirname, '../public');

// Créer des icônes SVG simples pour les PWA
const createPwaIcon = (size, filename) => {
  const svgContent = `<?xml version="1.0" encoding="UTF-8"?>
<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
  <rect width="24" height="24" rx="4" fill="#059669"/>
  <path d="M12 2L13.09 8.26L20 9L13.09 9.74L12 16L10.91 9.74L4 9L10.91 8.26L12 2Z" fill="white"/>
  <circle cx="12" cy="12" r="3" fill="#059669"/>
</svg>`;

  fs.writeFileSync(path.join(publicDir, filename), svgContent);
  console.log(`✅ Créé ${filename}`);
};

// Générer les icônes nécessaires
console.log('🎨 Génération des icônes PWA...');

createPwaIcon(192, 'pwa-192x192.png');
createPwaIcon(512, 'pwa-512x512.png');

console.log('🎉 Icônes PWA générées avec succès !');
console.log('');
console.log('📝 Note: Pour des icônes de meilleure qualité, utilisez:');
console.log('   npx pwa-asset-generator public/favicon.svg public --manifest public/manifest.json');
