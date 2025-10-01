import type { APIRoute } from 'astro'
import { createDiscogsClient } from '../../../lib/discogs'

export const GET: APIRoute = async ({ params }) => {
  const releaseId = parseInt(params.id || '0')

  if (!releaseId || isNaN(releaseId)) {
    return new Response(JSON.stringify({ error: 'Invalid release ID' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  try {
    const client = createDiscogsClient()
    const release = await client.getRelease(releaseId)

    return new Response(JSON.stringify(release), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      },
    })
  } catch (error) {
    console.error('Erreur API Discogs:', error)
    return new Response(
      JSON.stringify({
        error: 'Erreur lors de la récupération du vinyle',
        details: error instanceof Error ? error.message : 'Erreur inconnue',
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    )
  }
}
