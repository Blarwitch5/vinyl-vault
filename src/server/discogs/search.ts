import type { APIRoute } from 'astro'
import { discogsAPI, formatVinylForDisplay } from '../../lib/discogs'

// GET /api/discogs/search - Proxy pour la recherche Discogs
export const GET: APIRoute = async ({ url }) => {
  try {
    // Récupération des paramètres de recherche
    const query = url.searchParams.get('q')
    const page = parseInt(url.searchParams.get('page') || '1')
    const perPage = parseInt(url.searchParams.get('per_page') || '50')
    const type = url.searchParams.get('type') as
      | 'release'
      | 'master'
      | 'artist'
      | 'label'
      | undefined
    const genre = url.searchParams.get('genre')
    const style = url.searchParams.get('style')
    const year = url.searchParams.get('year')
      ? parseInt(url.searchParams.get('year')!)
      : undefined
    const format = url.searchParams.get('format')
    const country = url.searchParams.get('country')

    // Validation des paramètres
    if (!query || query.trim().length === 0) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Paramètre de recherche requis',
        }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        }
      )
    }

    if (query.trim().length < 2) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'La recherche doit contenir au moins 2 caractères',
        }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        }
      )
    }

    if (page < 1 || page > 10000) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Numéro de page invalide (1-10000)',
        }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        }
      )
    }

    if (perPage < 1 || perPage > 100) {
      return new Response(
        JSON.stringify({
          success: false,
          error: "Nombre d'éléments par page invalide (1-100)",
        }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        }
      )
    }

    if (year && (year < 1900 || year > new Date().getFullYear())) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Année invalide',
        }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        }
      )
    }

    // Construction des options de recherche
    const searchOptions: any = {
      type: type || 'release',
      page,
      per_page: perPage,
    }

    if (genre) searchOptions.genre = genre
    if (style) searchOptions.style = style
    if (year) searchOptions.year = year
    if (format) searchOptions.format = format
    if (country) searchOptions.country = country

    // Exécution de la recherche
    const searchResponse = await discogsAPI.search(query.trim(), searchOptions)

    // Formatage des résultats pour l'affichage
    const formattedResults = searchResponse.results.map(formatVinylForDisplay)

    // Préparation de la réponse
    const response = {
      success: true,
      query: query.trim(),
      pagination: {
        page: searchResponse.pagination.page,
        pages: searchResponse.pagination.pages,
        per_page: searchResponse.pagination.per_page,
        items: searchResponse.pagination.items,
        has_next:
          searchResponse.pagination.page < searchResponse.pagination.pages,
        has_prev: searchResponse.pagination.page > 1,
        next_page:
          searchResponse.pagination.page < searchResponse.pagination.pages
            ? searchResponse.pagination.page + 1
            : null,
        prev_page:
          searchResponse.pagination.page > 1
            ? searchResponse.pagination.page - 1
            : null,
      },
      results: formattedResults,
      search_options: searchOptions,
      timestamp: new Date().toISOString(),
    }

    // Headers de cache pour améliorer les performances
    const cacheHeaders = {
      'Content-Type': 'application/json',
      'Cache-Control': 'public, max-age=300', // Cache 5 minutes
      'X-Search-Results-Count': searchResponse.pagination.items.toString(),
    }

    return new Response(JSON.stringify(response), {
      status: 200,
      headers: cacheHeaders,
    })
  } catch (error) {
    console.error('Erreur lors de la recherche Discogs:', error)

    // Gestion des erreurs spécifiques de l'API Discogs
    if (error instanceof Error) {
      if (error.message.includes('404')) {
        return new Response(
          JSON.stringify({
            success: false,
            error: 'Aucun résultat trouvé',
            results: [],
            pagination: {
              page: 1,
              pages: 0,
              per_page: 50,
              items: 0,
            },
          }),
          {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
          }
        )
      }

      if (error.message.includes('429')) {
        return new Response(
          JSON.stringify({
            success: false,
            error:
              'Limite de requêtes atteinte. Veuillez réessayer dans quelques minutes.',
          }),
          {
            status: 429,
            headers: {
              'Content-Type': 'application/json',
              'Retry-After': '60',
            },
          }
        )
      }

      if (error.message.includes('401') || error.message.includes('403')) {
        return new Response(
          JSON.stringify({
            success: false,
            error: "Erreur d'authentification avec l'API Discogs",
          }),
          {
            status: 503,
            headers: { 'Content-Type': 'application/json' },
          }
        )
      }
    }

    return new Response(
      JSON.stringify({
        success: false,
        error: 'Erreur lors de la recherche. Veuillez réessayer.',
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    )
  }
}

// GET /api/discogs/search/release/[id] - Récupère les détails d'une release
export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json()
    const { releaseId } = body

    if (!releaseId) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'ID de release requis',
        }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        }
      )
    }

    const releaseIdNum = parseInt(releaseId)
    if (!Number.isInteger(releaseIdNum) || releaseIdNum <= 0) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'ID de release invalide',
        }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        }
      )
    }

    // Récupération des détails de la release
    const release = await discogsAPI.getRelease(releaseIdNum)

    // Formatage des données pour l'affichage
    const formattedRelease = {
      id: release.id,
      title: release.title,
      artists:
        release.artists?.map((artist) => ({
          id: artist.id,
          name: artist.name,
          role: artist.role,
        })) || [],
      year: release.year,
      released: release.released,
      genres: release.genres || [],
      styles: release.styles || [],
      formats:
        release.formats?.map((format) => ({
          name: format.name,
          qty: format.qty,
          descriptions: format.descriptions || [],
        })) || [],
      labels:
        release.labels?.map((label) => ({
          id: label.id,
          name: label.name,
          catno: label.catno,
        })) || [],
      images:
        release.images?.map((image) => ({
          type: image.type,
          uri: image.uri,
          uri150: image.uri150,
          width: image.width,
          height: image.height,
        })) || [],
      tracklist:
        release.tracklist?.map((track) => ({
          position: track.position,
          type: track.type_,
          title: track.title,
          duration: track.duration,
        })) || [],
      country: release.country,
      notes: release.notes,
      data_quality: release.data_quality,
      community: release.community,
      estimated_weight: release.estimated_weight,
      discogs_url: `https://www.discogs.com${release.uri}`,
      resource_url: release.resource_url,
    }

    return new Response(
      JSON.stringify({
        success: true,
        release: formattedRelease,
        timestamp: new Date().toISOString(),
      }),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'public, max-age=3600', // Cache 1 heure pour les détails
        },
      }
    )
  } catch (error) {
    console.error(
      'Erreur lors de la récupération des détails de release:',
      error
    )

    if (error instanceof Error && error.message.includes('404')) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Release non trouvée',
        }),
        {
          status: 404,
          headers: { 'Content-Type': 'application/json' },
        }
      )
    }

    return new Response(
      JSON.stringify({
        success: false,
        error: 'Erreur lors de la récupération des détails',
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    )
  }
}
