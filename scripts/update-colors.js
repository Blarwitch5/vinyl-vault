#!/usr/bin/env node

// Script pour mettre à jour toutes les couleurs selon le nouveau schéma
import { readFileSync, writeFileSync, readdirSync, statSync } from 'fs';
import { join, extname } from 'path';

console.log('🎨 MISE À JOUR DES COULEURS SELON LE NOUVEAU SCHÉMA\n');

// Mapping des anciennes couleurs vers les nouvelles
const colorMappings = {
  // Backgrounds
  'bg-white': 'bg-light-background',
  'bg-gray-50': 'bg-light-background',
  'bg-gray-100': 'bg-light-surface',
  'bg-gray-200': 'bg-light-surface',
  'dark:bg-gray-900': 'dark:bg-dark-background',
  'dark:bg-gray-800': 'dark:bg-dark-surface',
  'dark:bg-dark-900': 'dark:bg-dark-background',
  'dark:bg-dark-800': 'dark:bg-dark-surface',
  
  // Text colors
  'text-gray-900': 'text-light-text',
  'text-gray-800': 'text-light-text',
  'text-gray-600': 'text-light-textSecondary',
  'text-gray-500': 'text-light-textSecondary',
  'dark:text-gray-100': 'dark:text-dark-text',
  'dark:text-gray-200': 'dark:text-dark-text',
  'dark:text-gray-300': 'dark:text-dark-textSecondary',
  'dark:text-gray-400': 'dark:text-dark-textSecondary',
  
  // Borders
  'border-gray-200': 'border-light-surface',
  'border-gray-300': 'border-light-surface',
  'dark:border-gray-700': 'dark:border-dark-surface',
  'dark:border-gray-600': 'dark:border-dark-surface',
  'dark:border-dark-700': 'dark:border-dark-surface',
  'dark:border-dark-600': 'dark:border-dark-surface',
  
  // Primary colors (lime to amber)
  'bg-lime-500': 'bg-primary-500',
  'bg-lime-600': 'bg-primary-600',
  'text-lime-500': 'text-primary-500',
  'text-lime-600': 'text-primary-600',
  'border-lime-500': 'border-primary-500',
  'hover:bg-lime-600': 'hover:bg-primary-600',
  'focus:ring-lime-500': 'focus:ring-primary-500',
};

let totalReplacements = 0;
let filesModified = 0;

// Fonction pour traiter un fichier
const processFile = (filePath) => {
  try {
    let content = readFileSync(filePath, 'utf8');
    let fileModified = false;
    let replacements = 0;
    
    // Appliquer chaque mapping
    Object.entries(colorMappings).forEach(([oldColor, newColor]) => {
      const regex = new RegExp(oldColor.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g');
      const matches = content.match(regex);
      if (matches) {
        content = content.replace(regex, newColor);
        replacements += matches.length;
        fileModified = true;
      }
    });
    
    if (fileModified) {
      writeFileSync(filePath, content, 'utf8');
      console.log(`✅ ${filePath}: ${replacements} remplacements`);
      filesModified++;
      totalReplacements += replacements;
    }
    
  } catch (error) {
    console.log(`⚠️  Erreur lors du traitement de ${filePath}:`, error.message);
  }
};

// Fonction pour parcourir les dossiers
const processDirectory = (dir, extensions = ['.astro', '.html', '.jsx', '.tsx']) => {
  try {
    const items = readdirSync(dir);
    
    items.forEach(item => {
      if (item.startsWith('.') || item === 'node_modules') return;
      
      const fullPath = join(dir, item);
      const stat = statSync(fullPath);
      
      if (stat.isDirectory()) {
        processDirectory(fullPath, extensions);
      } else if (extensions.includes(extname(item))) {
        processFile(fullPath);
      }
    });
    
  } catch (error) {
    console.log(`⚠️  Erreur lors du parcours de ${dir}:`, error.message);
  }
};

// Traiter les dossiers importants
console.log('📁 Traitement des composants...');
processDirectory('src/components');

console.log('\n📄 Traitement des pages...');
processDirectory('src/pages');

console.log('\n🎨 Traitement des layouts...');
processDirectory('src/layouts');

// Résumé
console.log('\n📊 RÉSUMÉ DE LA MISE À JOUR');
console.log(`✅ ${filesModified} fichiers modifiés`);
console.log(`🔄 ${totalReplacements} remplacements effectués`);

if (filesModified > 0) {
  console.log('\n🎉 Mise à jour terminée ! Le thème devrait maintenant affecter tout le site.');
  console.log('💡 Testez avec le toggle de thème dans la navbar.');
} else {
  console.log('\n✨ Aucun fichier à modifier - déjà à jour !');
}

console.log('\n📚 Couleurs mises à jour :');
console.log('• Backgrounds: light-background/dark-background');
console.log('• Surfaces: light-surface/dark-surface'); 
console.log('• Textes: light-text/dark-text, light-textSecondary/dark-textSecondary');
console.log('• Primary: amber (primary-500, primary-600)');
console.log('• Secondary: emerald (secondary-400, secondary-600)');
