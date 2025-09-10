import type { APIRoute } from 'astro'

export const POST: APIRoute = async ({ request }) => {
  try {
    const { barcode } = await request.json()

    if (!barcode) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Code-barres requis',
        }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        }
      )
    }

    const discogsToken = import.meta.env.DISCOGS_API_TOKEN
    if (!discogsToken) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Token Discogs non configuré',
        }),
        {
          status: 500,
          headers: { 'Content-Type': 'application/json' },
        }
      )
    }

    // Rechercher par code-barres sur Discogs
    const searchUrl = `https://api.discogs.com/database/search?barcode=${encodeURIComponent(
      barcode
    )}&type=release&token=${discogsToken}`

    const response = await fetch(searchUrl, {
      headers: {
        'User-Agent': 'VinylVault/1.0 +https://vinylvault.com',
      },
    })

    if (!response.ok) {
      throw new Error(`Erreur Discogs: ${response.status}`)
    }

    const data = await response.json()

    if (!data.results || data.results.length === 0) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Aucun vinyle trouvé pour ce code-barres',
        }),
        {
          status: 404,
          headers: { 'Content-Type': 'application/json' },
        }
      )
    }

    // Prendre le premier résultat (le plus pertinent)
    const release = data.results[0]

    // Récupérer les détails complets du release
    const releaseUrl = `https://api.discogs.com/releases/${release.id}?token=${discogsToken}`
    const releaseResponse = await fetch(releaseUrl, {
      headers: {
        'User-Agent': 'VinylVault/1.0 +https://vinylvault.com',
      },
    })

    if (!releaseResponse.ok) {
      throw new Error(
        `Erreur lors de la récupération des détails: ${releaseResponse.status}`
      )
    }

    const releaseData = await releaseResponse.json()

    // Formater les données pour VinylVault
    const vinylData = {
      title: releaseData.title || 'Titre inconnu',
      artist: releaseData.artists?.[0]?.name || 'Artiste inconnu',
      year: releaseData.year || new Date().getFullYear(),
      genre: releaseData.genres?.[0] || 'Inconnu',
      label: releaseData.labels?.[0]?.name || 'Label inconnu',
      format: releaseData.formats?.[0]?.name || 'Vinyl',
      imageUrl: releaseData.images?.[0]?.uri || '/default-vinyl-cover.svg',
      discogsId: releaseData.id?.toString(),
      discogsUrl: releaseData.uri,
      barcode: barcode,
      country: releaseData.country || 'Inconnu',
      tracklist:
        releaseData.tracklist?.map((track: any) => ({
          position: track.position || '',
          title: track.title || '',
          duration: track.duration || '',
        })) || [],
    }

    return new Response(
      JSON.stringify({
        success: true,
        vinyl: vinylData,
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }
    )
  } catch (error) {
    console.error('Erreur lors de la recherche par code-barres:', error)
    return new Response(
      JSON.stringify({
        success: false,
        error: 'Erreur lors de la recherche',
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    )
  }
}
