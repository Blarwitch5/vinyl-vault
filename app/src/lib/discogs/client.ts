import type { DiscogsMasterRelease, DiscogsRelease, DiscogsSearchResponse } from './types'

const DISCOGS_API_BASE = 'https://api.discogs.com'

type DiscogsClientConfig = {
  userToken?: string
  apiKey?: string
  apiSecret?: string
}

export class DiscogsClient {
  private config: DiscogsClientConfig

  constructor(config: DiscogsClientConfig) {
    this.config = config
  }

  private getHeaders(): HeadersInit {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      'User-Agent': 'VinylVault/1.0',
    }

    if (this.config.userToken) {
      headers['Authorization'] = `Discogs token=${this.config.userToken}`
    } else if (this.config.apiKey && this.config.apiSecret) {
      headers['Authorization'] =
        `Discogs key=${this.config.apiKey}, secret=${this.config.apiSecret}`
    }

    return headers
  }

  private async request<T>(endpoint: string): Promise<T> {
    const url = `${DISCOGS_API_BASE}${endpoint}`

    try {
      const response = await fetch(url, {
        headers: this.getHeaders(),
      })

      if (!response.ok) {
        throw new Error(`Discogs API error: ${response.status} ${response.statusText}`)
      }

      const data = await response.json()
      return data as T
    } catch (error) {
      console.error('Erreur lors de la requête Discogs:', error)
      throw error
    }
  }

  async search(
    query: string,
    type?: string,
    page = 1,
    perPage = 50
  ): Promise<DiscogsSearchResponse> {
    const params = new URLSearchParams({
      q: query,
      page: page.toString(),
      per_page: perPage.toString(),
    })

    if (type) {
      params.append('type', type)
    }

    return this.request<DiscogsSearchResponse>(`/database/search?${params.toString()}`)
  }

  async getRelease(releaseId: number): Promise<DiscogsRelease> {
    return this.request<DiscogsRelease>(`/releases/${releaseId}`)
  }

  async getMasterRelease(masterId: number): Promise<DiscogsMasterRelease> {
    return this.request<DiscogsMasterRelease>(`/masters/${masterId}`)
  }

  async searchArtist(artistName: string): Promise<DiscogsSearchResponse> {
    return this.search(artistName, 'artist')
  }

  async searchRelease(query: string): Promise<DiscogsSearchResponse> {
    return this.search(query, 'release')
  }
}

export const createDiscogsClient = (config?: DiscogsClientConfig): DiscogsClient => {
  const finalConfig: DiscogsClientConfig = {
    userToken: config?.userToken || import.meta.env.DISCOGS_USER_TOKEN,
    apiKey: config?.apiKey || import.meta.env.DISCOGS_API_KEY,
    apiSecret: config?.apiSecret || import.meta.env.DISCOGS_API_SECRET,
  }

  return new DiscogsClient(finalConfig)
}
