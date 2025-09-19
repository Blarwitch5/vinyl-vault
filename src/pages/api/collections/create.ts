import type { APIRoute } from 'astro'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// POST /api/collections/create - Créer une nouvelle collection
export const POST: APIRoute = async ({ request, cookies }) => {
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
    console.log('API /collections/create reçoit:', body)
    const { name, description, isPublic = false } = body

    // Validation
    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      console.log('Erreur validation nom:', {
        name,
        type: typeof name,
        length: name?.trim()?.length,
      })
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

    // Récupérer l'utilisateur authentifié
    const tokenMatch = cookies.match(/vinyl_vault_token=([^;]+)/)
    if (!tokenMatch) {
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

    // Pour l'instant, on va utiliser l'ID de l'utilisateur depuis le token
    // En production, vous devriez décoder le JWT pour obtenir l'ID utilisateur
    const token = tokenMatch[1]
    
    // Récupérer l'utilisateur depuis la base de données
    const user = await prisma.user.findFirst({
      where: {
        // Pour simplifier, on prend le premier utilisateur créé
        // En production, vous devriez décoder le JWT pour obtenir l'ID exact
      },
      orderBy: {
        createdAt: 'desc'
      }
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

    // Vérifier la limite de 5 collections par utilisateur
    const existingCollectionsCount = await prisma.collection.count({
      where: { userId: userId },
    })

    if (existingCollectionsCount >= 5) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Vous avez atteint la limite de 5 collections par utilisateur',
        }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        }
      )
    }

    // Créer la collection en base de données
    console.log('Tentative de création de collection avec:', {
      name: name.trim(),
      description: description?.trim() || null,
      isPublic: isPublic,
      userId: userId,
      vinylCount: 0,
      totalValue: 0,
      averagePrice: 0,
    })

    let newCollection
    try {
      newCollection = await prisma.collection.create({
        data: {
          name: name.trim(),
          description: description?.trim() || null,
          isPublic: isPublic,
          userId: userId,
          vinylCount: 0,
          totalValue: 0,
          averagePrice: 0,
        },
      })

      console.log('Nouvelle collection créée:', {
        id: newCollection.id,
        name: newCollection.name,
        description: newCollection.description,
        userId: newCollection.userId,
      })
    } catch (createError) {
      console.error('Erreur lors de la création de la collection:', createError)
      throw createError
    }

    return new Response(
      JSON.stringify({
        success: true,
        collection: newCollection,
        message: 'Collection créée avec succès',
      }),
      {
        status: 201,
        headers: { 'Content-Type': 'application/json' },
      }
    )
  } catch (error) {
    console.error('Erreur lors de la création de la collection:', error)

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
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  })
}
