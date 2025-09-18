import type { APIRoute } from 'astro'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// PUT /api/collections/update - Mettre à jour une collection
export const PUT: APIRoute = async ({ request, cookies }) => {
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
    const { collectionId, name, description, isPublic } = body

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

    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Le nom de la collection est requis',
        }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        }
      )
    }

    if (name.trim().length > 100) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Le nom de la collection ne peut pas dépasser 100 caractères',
        }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        }
      )
    }

    if (
      description &&
      typeof description === 'string' &&
      description.length > 500
    ) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'La description ne peut pas dépasser 500 caractères',
        }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        }
      )
    }

    // Récupérer ou créer l'utilisateur de test (système d'authentification simplifié)
    const user = await prisma.user.upsert({
      where: { email: 'demo@vinylvault.com' },
      update: {
        id: 'test-user-id',
        name: 'Utilisateur Test',
      },
      create: {
        id: 'test-user-id',
        email: 'demo@vinylvault.com',
        name: 'Utilisateur Test',
        password: 'hashed_password_test',
      },
    })

    const userId = user.id

    // Vérifier que la collection existe et appartient à l'utilisateur
    const existingCollection = await prisma.collection.findUnique({
      where: {
        id: collectionId,
      },
      select: {
        id: true,
        name: true,
        userId: true,
      },
    })

    if (!existingCollection) {
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

    if (existingCollection.userId !== userId) {
      return new Response(
        JSON.stringify({
          success: false,
          error: "Vous n'avez pas le droit de modifier cette collection",
        }),
        {
          status: 403,
          headers: { 'Content-Type': 'application/json' },
        }
      )
    }

    // Mettre à jour la collection
    const updatedCollection = await prisma.collection.update({
      where: {
        id: collectionId,
      },
      data: {
        name: name.trim(),
        description: description?.trim() || null,
        isPublic: isPublic || false,
      },
    })

    console.log('Collection mise à jour:', {
      id: updatedCollection.id,
      name: updatedCollection.name,
      description: updatedCollection.description,
      isPublic: updatedCollection.isPublic,
      userId: userId,
    })

    return new Response(
      JSON.stringify({
        success: true,
        collection: updatedCollection,
        message: 'Collection mise à jour avec succès',
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }
    )
  } catch (error) {
    console.error('Erreur lors de la mise à jour de la collection:', error)

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
      'Access-Control-Allow-Methods': 'PUT, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  })
}
