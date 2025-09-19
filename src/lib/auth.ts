// Types pour l'authentification
export interface User {
  id: string
  email: string
  name?: string
  createdAt: Date
}

export interface LoginCredentials {
  email: string
  password: string
}

export interface RegisterData {
  email: string
  password: string
  name?: string
}

export interface AuthResponse {
  success: boolean
  user?: User
  token?: string
  error?: string
}

// Configuration JWT
const JWT_SECRET = import.meta.env.JWT_SECRET || 'votre-secret-jwt-super-secure'
const TOKEN_COOKIE_NAME = 'vinyl_vault_token'

/**
 * Enregistre un nouvel utilisateur
 */
export async function register(userData: RegisterData): Promise<AuthResponse> {
  try {
    const response = await fetch('/api/auth/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData),
    })

    const result = await response.json()

    if (result.success && result.token) {
      // Stocker le token dans un cookie sécurisé
      setAuthToken(result.token)
    }

    return result
  } catch (error) {
    console.error("Erreur lors de l'inscription:", error)
    return {
      success: false,
      error: "Une erreur est survenue lors de l'inscription",
    }
  }
}

/**
 * Connecte un utilisateur existant
 */
export async function login(
  credentials: LoginCredentials
): Promise<AuthResponse> {
  try {
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(credentials),
    })

    const result = await response.json()

    if (result.success && result.token) {
      // Stocker le token dans un cookie sécurisé
      setAuthToken(result.token)
    }

    return result
  } catch (error) {
    console.error('Erreur lors de la connexion:', error)
    return {
      success: false,
      error: 'Une erreur est survenue lors de la connexion',
    }
  }
}

/**
 * Déconnecte l'utilisateur actuel
 */
export function logout(): void {
  try {
    // Supprimer le token du localStorage et des cookies
    localStorage.removeItem('auth_token')
    document.cookie = `${TOKEN_COOKIE_NAME}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`

    // Rediriger vers la page d'accueil
    window.location.href = '/'
  } catch (error) {
    console.error('Erreur lors de la déconnexion:', error)
  }
}

/**
 * Récupère l'utilisateur actuellement connecté
 */
export async function getCurrentUser(): Promise<User | null> {
  try {
    const token = getAuthToken()

    if (!token) {
      return null
    }

    const response = await fetch('/api/auth/me', {
      credentials: 'include',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })

    if (!response.ok) {
      // Token invalide ou expiré
      clearAuthToken()
      return null
    }

    const result = await response.json()
    return result.user || null
  } catch (error) {
    console.error("Erreur lors de la récupération de l'utilisateur:", error)
    return null
  }
}

/**
 * Vérifie si l'utilisateur est connecté
 */
export async function isAuthenticated(): Promise<boolean> {
  const user = await getCurrentUser()
  return user !== null
}

/**
 * Stocke le token d'authentification
 */
function setAuthToken(token: string): void {
  // Stocker dans localStorage pour l'accès côté client
  if (typeof window !== 'undefined') {
    localStorage.setItem('auth_token', token)
  }

  // Stocker dans un cookie sécurisé pour l'accès côté serveur
  const expires = new Date()
  expires.setDate(expires.getDate() + 7) // Expire dans 7 jours

  document.cookie = `${TOKEN_COOKIE_NAME}=${token}; expires=${expires.toUTCString()}; path=/; sameSite=strict`
}

/**
 * Récupère le token d'authentification
 */
export function getAuthToken(): string | null {
  if (typeof window === 'undefined') {
    return null // Côté serveur
  }

  // Essayer localStorage d'abord
  const localToken = localStorage.getItem('auth_token')
  if (localToken) {
    return localToken
  }

  // Fallback sur les cookies
  const cookies = document.cookie.split(';')
  for (const cookie of cookies) {
    const [name, value] = cookie.trim().split('=')
    if (name === TOKEN_COOKIE_NAME) {
      return value
    }
  }

  return null
}

/**
 * Supprime le token d'authentification
 */
function clearAuthToken(): void {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('auth_token')
  }

  document.cookie = `${TOKEN_COOKIE_NAME}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`
}

/**
 * Middleware pour protéger les routes
 */
export async function requireAuth(): Promise<User> {
  const user = await getCurrentUser()

  if (!user) {
    // Rediriger vers la page de connexion
    window.location.href =
      '/login?redirect=' + encodeURIComponent(window.location.pathname)
    throw new Error('Authentication required')
  }

  return user
}

/**
 * Utilitaire pour valider un email
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

/**
 * Utilitaire pour valider un mot de passe
 */
export function isValidPassword(password: string): boolean {
  return password.length >= 8
}

/**
 * Vérifie l'authentification côté serveur (pour les pages Astro)
 */
export async function verifyAuth(request: Request): Promise<User | null> {
  try {
    console.log('verifyAuth: Début de la vérification')

    // Récupérer le token depuis les cookies
    const cookies = request.headers.get('cookie')
    console.log('verifyAuth: Cookies reçus:', cookies ? 'présents' : 'absents')

    if (!cookies) {
      console.log('verifyAuth: Aucun cookie trouvé')
      return null
    }

    const tokenMatch = cookies.match(new RegExp(`${TOKEN_COOKIE_NAME}=([^;]+)`))
    if (!tokenMatch) {
      console.log('verifyAuth: Token non trouvé dans les cookies')
      return null
    }

    const token = tokenMatch[1]
    console.log('verifyAuth: Token trouvé:', token ? 'présent' : 'absent')

    // Pour l'instant, on va faire une vérification simple
    // En production, vous devriez utiliser une vraie vérification JWT
    if (!token || token.length < 10) {
      console.log('verifyAuth: Token invalide (trop court)')
      return null
    }

    // En production, vous devriez décoder le JWT et récupérer l'utilisateur réel
    // Pour l'instant, on retourne null pour forcer une vraie authentification
    console.log(
      'verifyAuth: Authentification requise - token présent mais pas décodé'
    )
    return null
  } catch (error) {
    console.error(
      "Erreur lors de la vérification de l'authentification:",
      error
    )
    return null
  }
}
