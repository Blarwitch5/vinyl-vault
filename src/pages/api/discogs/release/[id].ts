import type { APIRoute } from 'astro'
import { getDiscogsReleaseDetails } from '../../../../lib/discogs'

export const GET: APIRoute = async ({ params }) => {
  try {
    const { id } = params

    if (!id || isNaN(Number(id))) {
      return new Response(
        JSON.stringify({
          error: 'ID de release invalide',
          details: "L'ID doit être un nombre valide",
        }),
        {
          status: 400,
          headers: {
            'Content-Type': 'application/json',
          },
        }
      )
    }

    console.log(`API: Récupération des détails pour la release ${id}`)

    // Récupérer les détails de la release depuis Discogs
    const releaseDetails = await getDiscogsReleaseDetails(Number(id))

    if (!releaseDetails) {
      return new Response(
        JSON.stringify({
          error: 'Release non trouvée',
          details: 'Aucune release trouvée avec cet ID',
        }),
        {
          status: 404,
          headers: {
            'Content-Type': 'application/json',
          },
        }
      )
    }

    console.log(`API: Détails récupérés pour "${releaseDetails.title}"`)

    return new Response(JSON.stringify(releaseDetails), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'public, max-age=3600', // Cache pendant 1 heure
      },
    })
  } catch (error) {
    console.error('Erreur API Discogs release:', error)

    return new Response(
      JSON.stringify({
        error: 'Erreur lors de la récupération des détails',
        details: error instanceof Error ? error.message : 'Erreur inconnue',
      }),
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
        },
      }
    )
  }
}
