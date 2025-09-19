import { PrismaClient } from '@prisma/client'
import type { APIRoute } from 'astro'

const prisma = new PrismaClient()

// DELETE /api/collections/remove - Supprimer un vinyle d'une collection
export const DELETE: APIRoute = async ({ request, cookies }) => {
  try {
    console.log('Remove API: Début de la suppression du vinyle')

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

    console.log('Remove API: Suppression du vinyle:', vinylId)

    // Récupérer l'utilisateur le plus récent (système d'authentification simplifié)
    const user = await prisma.user.findFirst({
      orderBy: {
        createdAt: 'desc',
      },
    })

    if (!user) {
      console.log('Remove API: Aucun utilisateur trouvé')
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Utilisateur non trouvé',
        }),
        {
          status: 404,
          headers: { 'Content-Type': 'application/json' },
        }
      )
    }

    console.log('Remove API: Utilisateur trouvé:', user.id)
    const userId = user.id

    // Vérifier que le vinyle existe et récupérer son collectionId
    const vinyl = await prisma.vinyl.findUnique({
      where: {
        id: vinylId,
      },
      select: {
        id: true,
        title: true,
        artist: true,
        collectionId: true,
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

    if (!vinyl.collectionId) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Vinyle non associé à une collection',
        }),
        {
          status: 400,
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

    // Recalculer les statistiques de la collection
    try {
      const collectionVinyls = await prisma.vinyl.findMany({
        where: { collectionId: vinyl.collectionId },
        select: { price: true },
      })

      const totalVinyls = collectionVinyls.length
      const totalValue = collectionVinyls.reduce(
        (sum, v) => sum + (v.price || 0),
        0
      )
      const averagePrice = totalVinyls > 0 ? totalValue / totalVinyls : 0

      // Mettre à jour les statistiques de la collection
      await prisma.collection.update({
        where: { id: vinyl.collectionId },
        data: {
          vinylCount: totalVinyls,
          totalValue: totalValue,
          averagePrice: averagePrice,
        },
      })

      console.log(
        'Statistiques de collection mises à jour après suppression:',
        {
          collectionId: vinyl.collectionId,
          vinylSupprimé: {
            id: vinyl.id,
            title: vinyl.title,
            artist: vinyl.artist,
          },
          totalVinyls,
          totalValue,
          averagePrice,
        }
      )
    } catch (statsError) {
      console.error(
        'Erreur lors de la mise à jour des statistiques:',
        statsError
      )
    }

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
