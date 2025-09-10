// Types selon les règles .cursorrules (préférer types aux interfaces)

// Types principaux pour les vinyles
export type Vinyl = {
  id: string
  title: string
  artist: string
  year?: number
  format?: string
  coverImage?: string
  condition?: string
  price?: number
  note?: string
  discogsId?: string
  discogsUrl?: string
  labels?: string[]
  catalogNumber?: string
  genre?: string[]
  style?: string[]
  country?: string
}

// Types pour les collections
export type Collection = {
  id: string
  name: string
  description?: string
  vinyl_count: number
  created_at: string
  updated_at?: string
  user_id: string
}

// Types pour l'authentification
export type User = {
  id: string
  email: string
  name: string
  avatar?: string
}

export type AuthState = {
  isAuthenticated: boolean
  user: User | null
  isLoading: boolean
  hasError: boolean
  errorMessage?: string
}

// Types pour les API responses
export type ApiResponse<T = unknown> = {
  success: boolean
  data?: T
  error?: string
  message?: string
}

export type SearchOptions = {
  type?: 'release' | 'master' | 'artist' | 'label'
  page?: number
  per_page?: number
  genre?: string
  style?: string
  year?: number
  format?: string
  country?: string
}

export type SearchResult = {
  results: Vinyl[]
  pagination: {
    page: number
    pages: number
    items: number
    per_page: number
  }
}

// Types pour les événements
export type ModalEvent = {
  type: 'open' | 'close' | 'show-section'
  data?: unknown
}

// Types utilitaires avec auxiliaire selon les règles
export type LoadingState = {
  isLoading: boolean
  hasError: boolean
  errorMessage?: string
}

export type FormState = {
  isSubmitting: boolean
  hasValidationError: boolean
  validationErrors: Record<string, string>
}

// Maps au lieu d'enums selon les règles
export const MODAL_SECTIONS = {
  LOGIN_REQUIRED: 'login-required',
  LOADING_COLLECTIONS: 'loading-collections',
  NO_COLLECTIONS: 'no-collections',
  COLLECTION_SELECTION: 'collection-selection',
  COLLECTION_CREATION: 'collection-creation',
  SUCCESS_MESSAGE: 'success-message',
} as const

export const VINYL_CONDITIONS = {
  MINT: 'Mint',
  NEAR_MINT: 'Near Mint',
  VERY_GOOD_PLUS: 'Very Good Plus',
  VERY_GOOD: 'Very Good',
  GOOD_PLUS: 'Good Plus',
  GOOD: 'Good',
  FAIR: 'Fair',
  POOR: 'Poor',
} as const

export const THEME_MODES = {
  LIGHT: 'light',
  DARK: 'dark',
  SYSTEM: 'system',
} as const
