import type { APIRoute } from 'astro'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// DELETE /api/collections/delete - Supprimer une collection
export const DELETE: APIRoute = async ({ request, cookies }) => {
  try {
    // Vérifier l'authentification
    const authToken = cookies.get('vinyl_vault_token')?.value

    if (!authToken) {
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
    const { collectionId } = body

    if (!collectionId) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'ID de la collection requis',
        }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        }
      )
    }

    // Récupérer l'utilisateur authentifié
    const user = await prisma.user.findFirst({
      orderBy: {
        createdAt: 'desc',
      },
    })

    if (!user) {
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

    const userId = user.id

    // Vérifier que la collection existe et appartient à l'utilisateur
    const collection = await prisma.collection.findUnique({
      where: {
        id: collectionId,
      },
      select: {
        id: true,
        name: true,
        userId: true,
        _count: {
          select: {
            vinyls: true,
          },
        },
      },
    })

    if (!collection) {
      return new Response(
        JSON.stringify({
          success: false,
          error: `Collection avec l'ID ${collectionId} non trouvée`,
        }),
        {
          status: 404,
          headers: { 'Content-Type': 'application/json' },
        }
      )
    }

    if (collection.userId !== userId) {
      return new Response(
        JSON.stringify({
          success: false,
          error: "Vous n'avez pas le droit de supprimer cette collection",
        }),
        {
          status: 403,
          headers: { 'Content-Type': 'application/json' },
        }
      )
    }

    // Supprimer la collection (les vinyles seront supprimés automatiquement grâce à onDelete: Cascade)
    await prisma.collection.delete({
      where: {
        id: collectionId,
      },
    })

    console.log('Collection supprimée:', {
      id: collection.id,
      name: collection.name,
      vinylsSupprimés: collection._count.vinyls,
      userId: userId,
    })

    return new Response(
      JSON.stringify({
        success: true,
        message: `Collection "${collection.name}" supprimée avec succès`,
        deletedVinyls: collection._count.vinyls,
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }
    )
  } catch (error) {
    console.error('Erreur lors de la suppression de la collection:', error)

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
