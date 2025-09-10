import { DISCOGS_CONFIG } from './config.js'

// Types pour l'API Discogs
export interface DiscogsSearchResult {
  id: number
  type: 'release' | 'master' | 'artist' | 'label'
  title: string
  year?: number
  format?: string[]
  label?: string[]
  catno?: string
  barcode?: string[]
  user_data?: {
    in_wantlist: boolean
    in_collection: boolean
  }
  master_id?: number
  master_url?: string
  uri: string
  resource_url: string
  thumb: string
  cover_image: string
  genre?: string[]
  style?: string[]
  country?: string
  community?: {
    want: number
    have: number
  }
}

export interface DiscogsSearchResponse {
  pagination: {
    page: number
    pages: number
    per_page: number
    items: number
    urls: {
      last?: string
      next?: string
    }
  }
  results: DiscogsSearchResult[]
}

export interface DiscogsRelease {
  id: number
  title: string
  artists: Array<{
    name: string
    anv?: string
    join?: string
    role?: string
    tracks?: string
    id: number
    resource_url: string
  }>
  year?: number
  released?: string
  genres?: string[]
  styles?: string[]
  tracklist?: Array<{
    position: string
    type_: string
    title: string
    duration?: string
  }>
  images?: Array<{
    type: 'primary' | 'secondary'
    uri: string
    resource_url: string
    uri150: string
    width: number
    height: number
  }>
  formats?: Array<{
    name: string
    qty: string
    descriptions?: string[]
  }>
  labels?: Array<{
    name: string
    catno: string
    entity_type: string
    entity_type_name: string
    id: number
    resource_url: string
  }>
  country?: string
  master_id?: number
  master_url?: string
  uri: string
  resource_url: string
  data_quality: string
  community?: {
    want: number
    have: number
    rating: {
      count: number
      average: number
    }
  }
  estimated_weight?: number
  notes?: string
}

// Configuration de l'API Discogs
const BASE_URL = DISCOGS_CONFIG.API_BASE_URL

// Headers par défaut pour toutes les requêtes (utilise la configuration)
const defaultHeaders = {
  ...DISCOGS_CONFIG.DEFAULT_HEADERS,
  // Utilisation des clés Consumer pour l'authentification basique
  Authorization: `Discogs key=${DISCOGS_CONFIG.CONSUMER_KEY}, secret=${DISCOGS_CONFIG.CONSUMER_SECRET}`,
}

/**
 * Classe pour interagir avec l'API Discogs
 */
export class DiscogsAPI {
  private static instance: DiscogsAPI

  private constructor() {}

  public static getInstance(): DiscogsAPI {
    if (!DiscogsAPI.instance) {
      DiscogsAPI.instance = new DiscogsAPI()
    }
    return DiscogsAPI.instance
  }

  /**
   * Effectue une requête GET vers l'API Discogs
   */
  private async makeRequest<T>(
    endpoint: string,
    params?: Record<string, string>
  ): Promise<T> {
    try {
      let url = `${BASE_URL}${endpoint}`

      if (params) {
        const searchParams = new URLSearchParams(params)
        url += `?${searchParams.toString()}`
      }

      const response = await fetch(url, {
        method: 'GET',
        headers: defaultHeaders,
      })

      if (!response.ok) {
        throw new Error(
          `Erreur API Discogs: ${response.status} ${response.statusText}`
        )
      }

      // Vérifier les limites de taux
      const remaining = response.headers.get('X-Discogs-Ratelimit-Remaining')
      if (remaining && parseInt(remaining) < 10) {
        console.warn('Attention: Limite de taux Discogs proche')
      }

      return await response.json()
    } catch (error) {
      console.error('Erreur lors de la requête Discogs:', error)
      throw error
    }
  }

  /**
   * Recherche dans la base de données Discogs
   */
  async search(
    query: string,
    options: {
      type?: 'release' | 'master' | 'artist' | 'label'
      genre?: string
      style?: string
      year?: number
      format?: string
      country?: string
      page?: number
      per_page?: number
    } = {}
  ): Promise<DiscogsSearchResponse> {
    const params: Record<string, string> = {
      q: query,
      per_page: (options.per_page || 50).toString(),
      page: (options.page || 1).toString(),
    }

    // Ajouter les filtres optionnels
    if (options.type) params.type = options.type
    if (options.genre) params.genre = options.genre
    if (options.style) params.style = options.style
    if (options.year) params.year = options.year.toString()
    if (options.format) params.format = options.format
    if (options.country) params.country = options.country

    return this.makeRequest<DiscogsSearchResponse>('/database/search', params)
  }

  /**
   * Récupère les détails d'une release spécifique
   */
  async getRelease(releaseId: number): Promise<DiscogsRelease> {
    return this.makeRequest<DiscogsRelease>(`/releases/${releaseId}`)
  }

  /**
   * Récupère les détails d'un master release
   */
  async getMasterRelease(masterId: number): Promise<any> {
    return this.makeRequest(`/masters/${masterId}`)
  }

  /**
   * Recherche par artiste
   */
  async searchByArtist(
    artistName: string,
    page = 1,
    perPage = 50
  ): Promise<DiscogsSearchResponse> {
    return this.search(`artist:"${artistName}"`, {
      type: 'release',
      page,
      per_page: perPage,
    })
  }

  /**
   * Recherche par titre d'album
   */
  async searchByTitle(
    title: string,
    page = 1,
    perPage = 50
  ): Promise<DiscogsSearchResponse> {
    return this.search(`title:"${title}"`, {
      type: 'release',
      page,
      per_page: perPage,
    })
  }

  /**
   * Recherche avancée avec plusieurs critères
   */
  async advancedSearch(
    criteria: {
      artist?: string
      title?: string
      label?: string
      catno?: string
      year?: number
      format?: string
      genre?: string
      style?: string
      country?: string
    },
    page = 1,
    perPage = 50
  ): Promise<DiscogsSearchResponse> {
    let query = ''
    const queryParts: string[] = []

    if (criteria.artist) queryParts.push(`artist:"${criteria.artist}"`)
    if (criteria.title) queryParts.push(`title:"${criteria.title}"`)
    if (criteria.label) queryParts.push(`label:"${criteria.label}"`)
    if (criteria.catno) queryParts.push(`catno:"${criteria.catno}"`)

    query = queryParts.join(' AND ')

    return this.search(query, {
      type: 'release',
      year: criteria.year,
      format: criteria.format,
      genre: criteria.genre,
      style: criteria.style,
      country: criteria.country,
      page,
      per_page: perPage,
    })
  }

  /**
   * Récupère l'image de couverture optimisée
   */
  getOptimizedImageUrl(
    item: DiscogsSearchResult,
    size: 'thumb' | 'small' | 'medium' | 'large' = 'medium'
  ): string {
    if (!item.cover_image && !item.thumb) {
      return '/default-vinyl-cover.svg'
    }

    // Discogs propose différentes tailles d'images
    switch (size) {
      case 'thumb':
        return item.thumb || item.cover_image
      case 'small':
        // Généralement 150px
        return item.cover_image || item.thumb
      case 'medium':
        // Généralement 300px
        return item.cover_image || item.thumb
      case 'large':
        // Image originale
        return item.cover_image || item.thumb
      default:
        return item.cover_image || item.thumb
    }
  }

  /**
   * Formate les informations d'un vinyle pour l'affichage
   */
  formatVinylInfo(item: DiscogsSearchResult): {
    id: string
    title: string
    artist: string
    year?: number
    format?: string
    coverImage: string
    discogsUrl: string
    labels?: string[]
    genres?: string[]
    styles?: string[]
  } {
    // Extraire l'artiste du titre si nécessaire
    let artist = ''
    let title = item.title

    if (title.includes(' - ')) {
      const parts = title.split(' - ')
      artist = parts[0]
      title = parts.slice(1).join(' - ')
    }

    return {
      id: item.id.toString(),
      title: title.trim(),
      artist: artist.trim(),
      year: item.year,
      format: item.format?.[0],
      coverImage: this.getOptimizedImageUrl(item, 'medium'),
      discogsUrl: `https://www.discogs.com${item.uri}`,
      labels: item.label,
      genres: item.genre,
      styles: item.style,
    }
  }

  /**
   * Récupère les suggestions d'artistes populaires
   */
  async getPopularArtists(genre?: string): Promise<DiscogsSearchResponse> {
    const query = genre ? `genre:"${genre}"` : '*'
    return this.search(query, {
      type: 'artist',
      per_page: 20,
    })
  }

  /**
   * Récupère les genres disponibles (liste statique car pas d'endpoint dédié)
   */
  getAvailableGenres(): string[] {
    return [
      'Rock',
      'Pop',
      'Jazz',
      'Classical',
      'Hip Hop',
      'Electronic',
      'Blues',
      'Country',
      'Folk',
      'Reggae',
      'Funk / Soul',
      'Latin',
      'World',
      'Alternative Rock',
      'Punk',
      'Metal',
      'Disco',
      'House',
      'Techno',
      'Ambient',
      'Experimental',
    ]
  }

  /**
   * Récupère les formats disponibles
   */
  getAvailableFormats(): string[] {
    return [
      'Vinyl',
      'LP',
      '12"',
      '7"',
      '10"',
      'EP',
      'Single',
      'Compilation',
      'Reissue',
      'Picture Disc',
      'Colored Vinyl',
      'Limited Edition',
      'Promo',
      'Test Pressing',
    ]
  }
}

// Export de l'instance singleton
export const discogsAPI = DiscogsAPI.getInstance()

// Fonctions utilitaires exportées pour faciliter l'utilisation
export async function searchVinyl(
  query: string,
  options?: any
): Promise<DiscogsSearchResponse> {
  return discogsAPI.search(query, options)
}

export async function getVinylDetails(
  releaseId: number
): Promise<DiscogsRelease> {
  return discogsAPI.getRelease(releaseId)
}

export function formatVinylForDisplay(item: DiscogsSearchResult) {
  return discogsAPI.formatVinylInfo(item)
}
