// Utilitaires pour l'extraction et l'enrichissement des données de vinyle

export type VinylData = {
  id: string
  title: string
  artist: string
  year?: number | null
  format?: string | null
  condition?: string | null
  price?: number | null
  note?: string | null
  coverImage?: string | null
  discogsId?: string | null
  discogsUrl?: string | null
  genre?: string | null
  label?: string | null
  country?: string | null
  catalogNumber?: string | null
  barcode?: string | null
  tracks?: string | null
  rating?: number | null
  ratingCount?: number | null
}

/**
 * Extrait toutes les données possibles d'une carte de vinyle
 */
export function extractVinylDataFromCard(
  card: Element,
  vinylId: string
): VinylData {
  // Informations de base depuis la carte
  const title = (
    card.querySelector('[data-vinyl-title]')?.textContent || ''
  ).trim()
  const artist = (
    card.querySelector('[data-vinyl-artist]')?.textContent || ''
  ).trim()
  const year = card.querySelector('[data-vinyl-year]')?.textContent?.trim()
  const coverImage = card.querySelector('img')?.src

  // Extraire le discogsId depuis l'URL si elle existe
  const discogsUrl = card.getAttribute('data-discogs-url') || ''
  const discogsIdFromUrl = discogsUrl.match(/\/release\/(\d+)-/)?.[1] || ''
  const discogsId = card.getAttribute('data-discogs-id') || discogsIdFromUrl

  // Extraire le format depuis les spans
  const format = Array.from(card.querySelectorAll('span'))
    .find(
      (span) =>
        span.textContent?.includes('LP') ||
        span.textContent?.includes('EP') ||
        span.textContent?.includes('Single') ||
        span.textContent?.includes('CD') ||
        span.textContent?.includes('Cassette')
    )
    ?.textContent?.trim()

  // Extraire le prix si disponible
  const priceElement = card.querySelector('.text-emerald-600, .font-mono')
  const priceText = priceElement?.textContent?.trim()
  const price = priceText
    ? parseFloat(priceText.replace(/[^\d.,]/g, '').replace(',', '.'))
    : null

  // Extraire la condition si disponible
  const conditionElement = card.querySelector('.bg-black.bg-opacity-70 span')
  const condition = conditionElement?.textContent?.trim()

  // Extraire la note si disponible
  const noteElement = card.querySelector('.italic')
  const note = noteElement?.textContent?.trim()?.replace(/^["']|["']$/g, '') // Enlever les guillemets

  // Essayer d'extraire plus d'informations depuis les attributs data-* s'ils existent
  const dataGenre = card.getAttribute('data-genre')
  const dataLabel = card.getAttribute('data-label')
  const dataCountry = card.getAttribute('data-country')
  const dataCatalogNumber = card.getAttribute('data-catalog')
  const dataBarcode = card.getAttribute('data-barcode')
  const dataCondition = card.getAttribute('data-condition')
  const dataPrice = card.getAttribute('data-price')
  const dataNote = card.getAttribute('data-note')

  // Construire l'objet avec toutes les données disponibles
  return {
    id: vinylId,
    title: title || 'Titre inconnu',
    artist: artist || 'Artiste inconnu',
    year: year ? (isNaN(parseInt(year)) ? null : parseInt(year)) : null,
    format: format || 'LP',
    condition: condition || dataCondition || null,
    price: price || (dataPrice ? parseFloat(dataPrice) : null),
    note: note || dataNote || null,
    coverImage: coverImage || '/default-vinyl-cover.svg',
    discogsId: discogsId || null,
    discogsUrl: discogsUrl || null,
    barcode: dataBarcode || null,
    genre: dataGenre || null,
    label: dataLabel || null,
    country: dataCountry || null,
    catalogNumber: dataCatalogNumber || null,
    tracks: null, // À enrichir via Discogs
    rating: null, // À enrichir via Discogs
    ratingCount: null, // À enrichir via Discogs
  }
}

/**
 * Enrichit les données de vinyle avec l'API Discogs
 */
export async function enrichVinylDataWithDiscogs(
  baseData: VinylData
): Promise<VinylData> {
  // Si on a un discogsId, essayer d'enrichir les données
  if (baseData.discogsId) {
    try {
      const response = await fetch(`/api/discogs/release/${baseData.discogsId}`)

      if (response.ok) {
        const discogsData = await response.json()

        // Enrichir les données avec les informations Discogs
        return {
          ...baseData,
          // Titre et artiste (prendre Discogs si plus précis)
          title: discogsData.title || baseData.title,
          artist: discogsData.artists?.[0]?.name || baseData.artist,

          // Informations manquantes depuis Discogs
          year: discogsData.year || baseData.year,
          format: discogsData.formats?.[0]?.name || baseData.format,
          genre: discogsData.genres?.[0] || baseData.genre,
          country: discogsData.country || baseData.country,
          label: discogsData.labels?.[0]?.name || baseData.label,
          catalogNumber:
            discogsData.labels?.[0]?.catno || baseData.catalogNumber,

          // Image de meilleure qualité
          coverImage: discogsData.images?.[0]?.uri || baseData.coverImage,

          // Métadonnées supplémentaires
          tracks: discogsData.tracklist
            ? JSON.stringify(discogsData.tracklist)
            : baseData.tracks,
          rating: discogsData.community?.rating?.average || baseData.rating,
          ratingCount:
            discogsData.community?.rating?.count || baseData.ratingCount,

          // Barcode depuis Discogs si disponible
          barcode:
            discogsData.identifiers?.find((id: any) => id.type === 'Barcode')
              ?.value || baseData.barcode,

          // URL Discogs mise à jour
          discogsUrl: discogsData.uri || baseData.discogsUrl,
        }
      } else {
        console.log(
          '⚠️ API Discogs indisponible, utilisation des données de base'
        )
        return baseData
      }
    } catch (error) {
      console.log('⚠️ Erreur enrichissement Discogs:', error)
      return baseData
    }
  }

  return baseData
}

/**
 * Extrait des données supplémentaires depuis la modal d'aperçu si disponible
 */
export function extractDataFromPreviewModal(): Partial<VinylData> {
  const previewContent = document.getElementById('preview-content')
  if (!previewContent) return {}

  // Extraire les informations supplémentaires depuis la modal d'aperçu
  const additionalData: Partial<VinylData> = {}

  // Extraire le genre depuis les badges
  const genreBadges = previewContent.querySelectorAll(
    '.bg-emerald-100, .bg-emerald-900'
  )
  if (genreBadges.length > 0) {
    additionalData.genre = Array.from(genreBadges)
      .map((badge) => badge.textContent?.trim())
      .filter(Boolean)
      .join(', ')
  }

  // Extraire les styles depuis les badges
  const styleBadges = previewContent.querySelectorAll(
    '.bg-blue-100, .bg-blue-900'
  )
  if (styleBadges.length > 0) {
    const styles = Array.from(styleBadges)
      .map((badge) => badge.textContent?.trim())
      .filter(Boolean)
      .join(', ')

    // Ajouter aux genres s'il n'y en a pas
    if (!additionalData.genre) {
      additionalData.genre = styles
    }
  }

  // Extraire le label, pays, etc. depuis les détails
  const detailsGrid = previewContent.querySelector('.grid')
  if (detailsGrid) {
    const detailElements = detailsGrid.querySelectorAll('div')
    detailElements.forEach((detail) => {
      const text = detail.textContent?.trim() || ''
      if (text.includes('Label:')) {
        additionalData.label = text.replace('Label:', '').trim()
      } else if (text.includes('Pays:')) {
        additionalData.country = text.replace('Pays:', '').trim()
      } else if (text.includes('Référence:')) {
        additionalData.catalogNumber = text.replace('Référence:', '').trim()
      }
    })
  }

  // Extraire le rating
  const ratingStars = previewContent.querySelectorAll('.text-yellow-400')
  if (ratingStars.length > 0) {
    additionalData.rating = ratingStars.length
  }

  return additionalData
}

/**
 * Vérifie si un vinyle existe déjà dans la collection
 */
export async function checkForDuplicate(vinylData: VinylData): Promise<{
  exists: boolean
  vinyl?: any
}> {
  try {
    const response = await fetch('/api/collections/check-duplicate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({
        discogsId: vinylData.discogsId,
        title: vinylData.title,
        artist: vinylData.artist,
      }),
    })

    if (!response.ok) {
      console.error(
        'Erreur lors de la vérification de doublon:',
        response.status
      )
      return { exists: false }
    }

    const result = await response.json()
    return result
  } catch (error) {
    console.error('Erreur lors de la vérification de doublon:', error)
    return { exists: false }
  }
}
