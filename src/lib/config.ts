/**
 * Configuration centralisée pour VinylVault
 * Utilise les variables d'environnement avec des valeurs par défaut
 */

// Configuration de l'application
export const APP_CONFIG = {
  NODE_ENV: import.meta.env.NODE_ENV || 'development',
  APP_URL: import.meta.env.PUBLIC_APP_URL || 'http://localhost:4321',
  DEBUG: import.meta.env.DEV || false,
  LOG_LEVEL: import.meta.env.LOG_LEVEL || 'info',
} as const

// Configuration JWT
export const JWT_CONFIG = {
  SECRET:
    import.meta.env.JWT_SECRET ||
    'your-super-secret-jwt-key-change-this-in-production',
  EXPIRES_IN: import.meta.env.JWT_EXPIRES_IN || '7d',
} as const

// Configuration Discogs API
export const DISCOGS_CONFIG = {
  CONSUMER_KEY: import.meta.env.DISCOGS_CONSUMER_KEY || 'hOzKNJdosmmCLJFATkNV',
  CONSUMER_SECRET:
    import.meta.env.DISCOGS_CONSUMER_SECRET ||
    'oSxbEfkEwRCrJjvJrcKPmWXvnreklfET',
  REQUEST_TOKEN_URL:
    import.meta.env.DISCOGS_REQUEST_TOKEN_URL ||
    'https://api.discogs.com/oauth/request_token',
  AUTHORIZE_URL:
    import.meta.env.DISCOGS_AUTHORIZE_URL ||
    'https://www.discogs.com/fr/oauth/authorize',
  ACCESS_TOKEN_URL:
    import.meta.env.DISCOGS_ACCESS_TOKEN_URL ||
    'https://api.discogs.com/oauth/access_token',
  API_BASE_URL:
    import.meta.env.DISCOGS_API_BASE_URL || 'https://api.discogs.com',
  // Headers par défaut pour les requêtes Discogs
  DEFAULT_HEADERS: {
    'User-Agent': 'VinylVault/1.0 +http://localhost:4321',
    Accept: 'application/json',
    'Content-Type': 'application/json',
  },
  // Limites de l'API
  RATE_LIMIT: {
    REQUESTS_PER_MINUTE: 60,
    REQUESTS_PER_HOUR: 1000,
  },
} as const

// Configuration de la base de données
export const DATABASE_CONFIG = {
  URL:
    import.meta.env.DATABASE_URL ||
    'postgresql://username:password@localhost:5432/vinylvault',
  MAX_CONNECTIONS: parseInt(import.meta.env.DB_MAX_CONNECTIONS || '10'),
  TIMEOUT: parseInt(import.meta.env.DB_TIMEOUT || '30000'),
} as const

// Configuration Supabase (optionnel)
export const SUPABASE_CONFIG = {
  URL: import.meta.env.PUBLIC_SUPABASE_URL || '',
  ANON_KEY: import.meta.env.PUBLIC_SUPABASE_ANON_KEY || '',
  SERVICE_ROLE_KEY: import.meta.env.SUPABASE_SERVICE_ROLE_KEY || '',
} as const

// Configuration email
export const EMAIL_CONFIG = {
  SMTP_HOST: import.meta.env.SMTP_HOST || 'smtp.gmail.com',
  SMTP_PORT: parseInt(import.meta.env.SMTP_PORT || '587'),
  SMTP_USER: import.meta.env.SMTP_USER || '',
  SMTP_PASS: import.meta.env.SMTP_PASS || '',
  FROM_ADDRESS: import.meta.env.EMAIL_FROM || 'noreply@vinylvault.com',
  FROM_NAME: 'VinylVault',
} as const

// Configuration upload de fichiers
export const UPLOAD_CONFIG = {
  MAX_FILE_SIZE: parseInt(import.meta.env.MAX_FILE_SIZE || '5242880'), // 5MB par défaut
  ALLOWED_EXTENSIONS: ['.jpg', '.jpeg', '.png', '.webp', '.gif'],
  UPLOAD_PATH: import.meta.env.UPLOAD_PATH || './public/uploads',
  CDN_URL: import.meta.env.CDN_URL || '',
} as const

// Configuration de sécurité
export const SECURITY_CONFIG = {
  BCRYPT_ROUNDS: parseInt(import.meta.env.BCRYPT_ROUNDS || '12'),
  SESSION_TIMEOUT: parseInt(import.meta.env.SESSION_TIMEOUT || '3600000'), // 1 heure
  MAX_LOGIN_ATTEMPTS: parseInt(import.meta.env.MAX_LOGIN_ATTEMPTS || '5'),
  LOCKOUT_DURATION: parseInt(import.meta.env.LOCKOUT_DURATION || '900000'), // 15 minutes
} as const

// Configuration des cookies
export const COOKIE_CONFIG = {
  AUTH_COOKIE_NAME: 'vinyl-vault-auth',
  THEME_COOKIE_NAME: 'vinyl-vault-theme',
  SECURE: import.meta.env.NODE_ENV === 'production',
  SAME_SITE: 'lax' as const,
  MAX_AGE: 7 * 24 * 60 * 60 * 1000, // 7 jours
} as const

/**
 * Valide la configuration au démarrage
 * Vérifie que les variables critiques sont définies
 */
export function validateConfig(): { isValid: boolean; errors: string[] } {
  const errors: string[] = []

  // Vérification des variables critiques
  if (
    !DISCOGS_CONFIG.CONSUMER_KEY ||
    DISCOGS_CONFIG.CONSUMER_KEY === 'your-consumer-key'
  ) {
    errors.push('DISCOGS_CONSUMER_KEY manquant ou invalide')
  }

  if (
    !DISCOGS_CONFIG.CONSUMER_SECRET ||
    DISCOGS_CONFIG.CONSUMER_SECRET === 'your-consumer-secret'
  ) {
    errors.push('DISCOGS_CONSUMER_SECRET manquant ou invalide')
  }

  if (
    !JWT_CONFIG.SECRET ||
    JWT_CONFIG.SECRET === 'your-super-secret-jwt-key-change-this-in-production'
  ) {
    errors.push(
      'JWT_SECRET manquant ou utilise la valeur par défaut (non sécurisé)'
    )
  }

  if (APP_CONFIG.NODE_ENV === 'production') {
    if (
      !DATABASE_CONFIG.URL ||
      DATABASE_CONFIG.URL.includes('username:password')
    ) {
      errors.push('DATABASE_URL manquant ou invalide en production')
    }

    if (!EMAIL_CONFIG.SMTP_USER) {
      errors.push('Configuration email incomplète en production')
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
  }
}

/**
 * Affiche un résumé de la configuration (sans les secrets)
 */
export function getConfigSummary() {
  return {
    environment: APP_CONFIG.NODE_ENV,
    app_url: APP_CONFIG.APP_URL,
    discogs_api: DISCOGS_CONFIG.API_BASE_URL,
    database_configured:
      !!DATABASE_CONFIG.URL &&
      !DATABASE_CONFIG.URL.includes('username:password'),
    supabase_configured: !!SUPABASE_CONFIG.URL,
    email_configured: !!EMAIL_CONFIG.SMTP_USER,
    max_file_size: `${UPLOAD_CONFIG.MAX_FILE_SIZE / 1024 / 1024}MB`,
  }
}

// Export par défaut pour faciliter l'import
export default {
  APP: APP_CONFIG,
  JWT: JWT_CONFIG,
  DISCOGS: DISCOGS_CONFIG,
  DATABASE: DATABASE_CONFIG,
  SUPABASE: SUPABASE_CONFIG,
  EMAIL: EMAIL_CONFIG,
  UPLOAD: UPLOAD_CONFIG,
  SECURITY: SECURITY_CONFIG,
  COOKIE: COOKIE_CONFIG,
  validate: validateConfig,
  summary: getConfigSummary,
}
