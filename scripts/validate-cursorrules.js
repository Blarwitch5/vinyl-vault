#!/usr/bin/env node

// Script de validation des règles .cursorrules
import { readFileSync, readdirSync, statSync } from 'fs';
import { join, extname } from 'path';

console.log('🎯 VALIDATION DES RÈGLES .CURSORRULES\n');

let hasErrors = false;
let warningCount = 0;

// Fonction utilitaire pour logger avec couleurs
const log = {
  success: (msg) => console.log(`✅ ${msg}`),
  error: (msg) => { console.log(`❌ ${msg}`); hasErrors = true; },
  warning: (msg) => { console.log(`⚠️  ${msg}`); warningCount++; },
  info: (msg) => console.log(`ℹ️  ${msg}`),
};

// 1. Vérifier le schéma de couleurs dans tailwind.config.js
console.log('📋 1. VÉRIFICATION DU SCHÉMA DE COULEURS\n');

try {
  const tailwindConfig = readFileSync('tailwind.config.js', 'utf8');
  
  if (tailwindConfig.includes('amber')) {
    log.success('Schéma amber trouvé (accent1)');
  } else {
    log.error('Schéma amber manquant - devrait être utilisé pour accent1');
  }
  
  if (tailwindConfig.includes('emerald')) {
    log.success('Schéma emerald trouvé (accent2)');
  } else {
    log.error('Schéma emerald manquant - devrait être utilisé pour accent2');
  }
  
  if (tailwindConfig.includes('slate-950')) {
    log.success('Background dark (slate-950) trouvé');
  } else {
    log.warning('Background dark (slate-950) pourrait être manquant');
  }
  
} catch (error) {
  log.error('Impossible de lire tailwind.config.js');
}

console.log('');

// 2. Vérifier la structure des dossiers avec tirets
console.log('📁 2. VÉRIFICATION DES CONVENTIONS DE NOMMAGE\n');

const checkDirectoryNaming = (dir) => {
  try {
    const items = readdirSync(dir);
    items.forEach(item => {
      const fullPath = join(dir, item);
      if (statSync(fullPath).isDirectory()) {
        if (item.includes('_') || /[A-Z]/.test(item)) {
          log.warning(`Dossier "${item}" devrait utiliser des tirets (kebab-case)`);
        } else if (item.includes('-')) {
          log.success(`Dossier "${item}" suit les conventions (kebab-case)`);
        }
      }
    });
  } catch (error) {
    log.warning(`Impossible de lire le dossier ${dir}`);
  }
};

checkDirectoryNaming('src/components');
checkDirectoryNaming('src/utils');

console.log('');

// 3. Vérifier les types vs interfaces
console.log('🏷️  3. VÉRIFICATION TYPES VS INTERFACES\n');

const checkTypeUsage = (filePath) => {
  try {
    const content = readFileSync(filePath, 'utf8');
    
    // Compter les interfaces vs types
    const interfaceCount = (content.match(/interface\s+\w+/g) || []).length;
    const typeCount = (content.match(/type\s+\w+\s*=/g) || []).length;
    
    if (interfaceCount > 0) {
      log.warning(`${filePath}: ${interfaceCount} interface(s) trouvée(s) - préférer les types`);
    }
    
    if (typeCount > 0) {
      log.success(`${filePath}: ${typeCount} type(s) trouvé(s) ✓`);
    }
    
    // Vérifier les enums
    const enumCount = (content.match(/enum\s+\w+/g) || []).length;
    if (enumCount > 0) {
      log.warning(`${filePath}: ${enumCount} enum(s) trouvé(s) - préférer les maps`);
    }
    
  } catch (error) {
    // Fichier n'existe pas ou erreur de lecture - pas grave
  }
};

checkTypeUsage('src/types/index.ts');

// Parcourir les fichiers TypeScript
const checkTsFiles = (dir) => {
  try {
    const items = readdirSync(dir);
    items.forEach(item => {
      const fullPath = join(dir, item);
      if (statSync(fullPath).isDirectory()) {
        checkTsFiles(fullPath);
      } else if (extname(item) === '.ts') {
        checkTypeUsage(fullPath);
      }
    });
  } catch (error) {
    // Dossier n'existe pas - pas grave
  }
};

checkTsFiles('src');

console.log('');

// 4. Vérifier l'utilisation de classes
console.log('🚫 4. VÉRIFICATION ÉVITEMENT DES CLASSES\n');

const checkClassUsage = (filePath) => {
  try {
    const content = readFileSync(filePath, 'utf8');
    
    // Détecter les classes (mais pas les classes CSS)
    const classMatches = content.match(/class\s+\w+\s*{/g) || [];
    classMatches.forEach(match => {
      if (!match.includes('className') && !match.includes('class=')) {
        log.warning(`${filePath}: Classe trouvée "${match.trim()}" - préférer les fonctions`);
      }
    });
    
    // Vérifier les fonctions
    const functionCount = (content.match(/const\s+\w+\s*=\s*\(/g) || []).length;
    if (functionCount > 0) {
      log.success(`${filePath}: ${functionCount} fonction(s) utilitaire(s) trouvée(s)`);
    }
    
  } catch (error) {
    // Fichier n'existe pas - pas grave
  }
};

// Vérifier les fichiers principaux
checkClassUsage('src/components/collection-modal/AddToCollectionModal.astro');
checkClassUsage('src/components/theme-toggle/ThemeToggle.astro');

console.log('');

// 5. Vérifier la structure des composants
console.log('📦 5. VÉRIFICATION STRUCTURE DES COMPOSANTS\n');

const checkComponentStructure = (componentDir) => {
  try {
    const items = readdirSync(componentDir);
    
    if (items.includes('index.ts')) {
      log.success(`${componentDir}: index.ts trouvé (exports nommés)`);
    } else {
      log.warning(`${componentDir}: index.ts manquant pour les exports`);
    }
    
    const astroFiles = items.filter(item => extname(item) === '.astro');
    if (astroFiles.length > 0) {
      log.success(`${componentDir}: ${astroFiles.length} composant(s) Astro trouvé(s)`);
    }
    
  } catch (error) {
    log.warning(`Impossible de vérifier la structure de ${componentDir}`);
  }
};

checkComponentStructure('src/components/collection-modal');
checkComponentStructure('src/components/theme-toggle');

console.log('');

// Résumé final
console.log('📊 RÉSUMÉ DE LA VALIDATION\n');

if (hasErrors) {
  log.error(`${hasErrors ? 'Des erreurs' : 'Aucune erreur'} critiques trouvées`);
} else {
  log.success('Aucune erreur critique trouvée');
}

if (warningCount > 0) {
  log.warning(`${warningCount} avertissement(s) trouvé(s)`);
} else {
  log.success('Aucun avertissement');
}

console.log('');

if (!hasErrors && warningCount === 0) {
  log.success('🎉 PROJET CONFORME AUX RÈGLES .CURSORRULES !');
} else if (!hasErrors) {
  log.info('✨ Projet globalement conforme avec quelques améliorations possibles');
} else {
  log.error('🚨 Corrections nécessaires pour la conformité');
  process.exit(1);
}

console.log('');
console.log('📚 Pour plus de détails, consultez .cursorrules');
