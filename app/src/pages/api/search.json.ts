import type { APIRoute } from 'astro'
import { createDiscogsClient } from '../../lib/discogs'

export const GET: APIRoute = async ({ url }) => {
  const query = url.searchParams.get('q')
  const type = url.searchParams.get('type') || 'release'
  const page = parseInt(url.searchParams.get('page') || '1')

  if (!query) {
    return new Response(JSON.stringify({ error: 'Query parameter is required' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  try {
    const client = createDiscogsClient()
    const results = await client.search(query, type, page, 20)

    return new Response(JSON.stringify(results), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      },
    })
  } catch (error) {
    console.error('Erreur API Discogs:', error)
    return new Response(
      JSON.stringify({
        error: 'Erreur lors de la recherche Discogs',
        details: error instanceof Error ? error.message : 'Erreur inconnue',
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    )
  }
}
