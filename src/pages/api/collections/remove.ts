import { PrismaClient } from '@prisma/client'
import type { APIRoute } from 'astro'

const prisma = new PrismaClient()

// DELETE /api/collections/remove - Supprimer un vinyle d'une collection
export const DELETE: APIRoute = async ({ request, cookies }) => {
  try {
    // Vérifier l'authentification
    const authToken = cookies.get('vinyl_vault_token')?.value
    const authHeader = request.headers.get('Authorization')

    // Utiliser le token du header Authorization ou du cookie
    const token = authHeader?.replace('Bearer ', '') || authToken

    if (!token) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Authentification requise',
        }),
        {
          status: 401,
          headers: { 'Content-Type': 'application/json' },
        }
      )
    }

    // Récupérer les données de la requête
    const body = await request.json()
    const { vinylId } = body

    if (!vinylId) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'ID du vinyle requis',
        }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        }
      )
    }

    // TODO: Récupérer l'ID utilisateur depuis le token JWT
    // Pour l'instant, on utilise un ID fixe
    const userId = '1'

    // Vérifier que le vinyle existe
    const vinyl = await prisma.vinyl.findUnique({
      where: {
        id: vinylId,
      },
    })

    if (!vinyl) {
      return new Response(
        JSON.stringify({
          success: false,
          error: `Vinyle avec l'ID ${vinylId} non trouvé`,
        }),
        {
          status: 404,
          headers: { 'Content-Type': 'application/json' },
        }
      )
    }

    // Supprimer le vinyle de la base de données
    await prisma.vinyl.delete({
      where: {
        id: vinylId,
      },
    })

    console.log('Vinyle supprimé:', {
      vinylId,
      userId,
      vinyl: {
        title: vinyl.title,
        artist: vinyl.artist,
      },
    })

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Vinyle supprimé avec succès',
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }
    )
  } catch (error) {
    console.error('Erreur lors de la suppression du vinyle:', error)

    return new Response(
      JSON.stringify({
        success: false,
        error: 'Erreur interne du serveur',
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    )
  }
}

// OPTIONS pour CORS
export const OPTIONS: APIRoute = async () => {
  return new Response(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  })
}
