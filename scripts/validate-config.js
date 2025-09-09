#!/usr/bin/env node

/**
 * Script de validation de la configuration VinylVault
 * Vérifie que toutes les variables d'environnement requises sont définies
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Fonction pour charger le fichier .env
function loadEnvFile() {
  const envPath = path.join(__dirname, '..', '.env');
  
  if (!fs.existsSync(envPath)) {
    console.error('❌ Fichier .env non trouvé');
    console.log('💡 Créez un fichier .env à la racine du projet avec vos variables d\'environnement');
    console.log('📖 Consultez ENVIRONMENT_SETUP.md pour plus d\'informations');
    return {};
  }

  const envContent = fs.readFileSync(envPath, 'utf8');
  const env = {};
  
  envContent.split('\n').forEach(line => {
    line = line.trim();
    if (line && !line.startsWith('#')) {
      const [key, ...valueParts] = line.split('=');
      if (key && valueParts.length > 0) {
        env[key.trim()] = valueParts.join('=').replace(/^["']|["']$/g, '');
      }
    }
  });

  return env;
}

// Variables requises
const requiredVars = {
  DISCOGS_CONSUMER_KEY: 'Clé API Discogs (obligatoire)',
  DISCOGS_CONSUMER_SECRET: 'Secret API Discogs (obligatoire)',
  JWT_SECRET: 'Clé secrète JWT (obligatoire pour la sécurité)',
};

// Variables optionnelles mais recommandées
const optionalVars = {
  NODE_ENV: 'Environnement (development/production)',
  APP_URL: 'URL de l\'application',
  DATABASE_URL: 'URL de la base de données',
  DEBUG: 'Mode debug',
};

// Variables par défaut dangereuses
const dangerousDefaults = {
  JWT_SECRET: [
    'your-super-secret-jwt-key-change-this-in-production',
    'changez-cette-clé-secrète-en-production-2024'
  ],
  DISCOGS_CONSUMER_KEY: ['your-consumer-key'],
  DISCOGS_CONSUMER_SECRET: ['your-consumer-secret'],
};

function validateConfiguration() {
  console.log('🔍 Validation de la configuration VinylVault\n');
  
  const env = loadEnvFile();
  const errors = [];
  const warnings = [];
  let success = true;

  // Vérifier les variables requises
  console.log('📋 Variables requises :');
  for (const [key, description] of Object.entries(requiredVars)) {
    if (!env[key] || env[key].trim() === '') {
      console.log(`❌ ${key}: ${description} - MANQUANT`);
      errors.push(`${key} est requis`);
      success = false;
    } else {
      // Vérifier les valeurs par défaut dangereuses
      if (dangerousDefaults[key] && dangerousDefaults[key].includes(env[key])) {
        console.log(`⚠️  ${key}: ${description} - UTILISE LA VALEUR PAR DÉFAUT`);
        warnings.push(`${key} utilise la valeur par défaut (non sécurisé)`);
      } else {
        console.log(`✅ ${key}: ${description} - OK`);
      }
    }
  }

  console.log('\n📝 Variables optionnelles :');
  for (const [key, description] of Object.entries(optionalVars)) {
    if (env[key] && env[key].trim() !== '') {
      console.log(`✅ ${key}: ${description} - Configuré`);
    } else {
      console.log(`⚪ ${key}: ${description} - Non configuré (optionnel)`);
    }
  }

  // Vérification spécifique pour la production
  if (env.NODE_ENV === 'production') {
    console.log('\n🏭 Vérifications spécifiques à la production :');
    
    if (!env.DATABASE_URL || env.DATABASE_URL.includes('username:password')) {
      console.log('❌ DATABASE_URL: Base de données non configurée pour la production');
      errors.push('DATABASE_URL requis en production');
      success = false;
    } else {
      console.log('✅ DATABASE_URL: Configurée pour la production');
    }

    if (!env.SMTP_USER) {
      console.log('⚠️  SMTP_USER: Email non configuré (recommandé en production)');
      warnings.push('Configuration email recommandée en production');
    } else {
      console.log('✅ SMTP_USER: Email configuré');
    }
  }

  // Vérifier les URLs Discogs
  console.log('\n🎵 Configuration Discogs API :');
  const discogsUrls = {
    DISCOGS_API_BASE_URL: 'https://api.discogs.com',
    DISCOGS_REQUEST_TOKEN_URL: 'https://api.discogs.com/oauth/request_token',
    DISCOGS_AUTHORIZE_URL: 'https://www.discogs.com/fr/oauth/authorize',
    DISCOGS_ACCESS_TOKEN_URL: 'https://api.discogs.com/oauth/access_token',
  };

  for (const [key, expectedUrl] of Object.entries(discogsUrls)) {
    if (env[key] === expectedUrl || !env[key]) {
      console.log(`✅ ${key}: URL correcte`);
    } else {
      console.log(`⚠️  ${key}: URL modifiée (${env[key]})`);
      warnings.push(`${key} a une URL non standard`);
    }
  }

  // Résumé
  console.log('\n📊 Résumé de la validation :');
  
  if (success && errors.length === 0) {
    console.log('✅ Configuration valide !');
    
    if (warnings.length > 0) {
      console.log(`⚠️  ${warnings.length} avertissement(s) :`);
      warnings.forEach(warning => console.log(`   • ${warning}`));
    }
    
    console.log('\n🚀 Vous pouvez démarrer l\'application avec : pnpm dev');
    return true;
  } else {
    console.log(`❌ ${errors.length} erreur(s) trouvée(s) :`);
    errors.forEach(error => console.log(`   • ${error}`));
    
    if (warnings.length > 0) {
      console.log(`⚠️  ${warnings.length} avertissement(s) :`);
      warnings.forEach(warning => console.log(`   • ${warning}`));
    }
    
    console.log('\n📖 Consultez ENVIRONMENT_SETUP.md pour configurer les variables manquantes');
    return false;
  }
}

// Afficher les informations de configuration (sans les secrets)
function showConfigSummary(env) {
  console.log('\n🔧 Résumé de la configuration :');
  console.log(`   • Environnement: ${env.NODE_ENV || 'development'}`);
  console.log(`   • URL de l'app: ${env.APP_URL || 'http://localhost:4321'}`);
  console.log(`   • API Discogs: ${env.DISCOGS_API_BASE_URL || 'https://api.discogs.com'}`);
  console.log(`   • Base de données: ${env.DATABASE_URL ? 'Configurée' : 'Non configurée'}`);
  console.log(`   • Email: ${env.SMTP_USER ? 'Configuré' : 'Non configuré'}`);
  console.log(`   • Debug: ${env.DEBUG || 'false'}`);
}

// Exécution du script
if (import.meta.url === `file://${process.argv[1]}`) {
  const env = loadEnvFile();
  const isValid = validateConfiguration();
  showConfigSummary(env);
  
  process.exit(isValid ? 0 : 1);
}

export { validateConfiguration, loadEnvFile };
