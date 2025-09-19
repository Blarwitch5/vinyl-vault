import type { APIRoute } from 'astro'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// POST /api/collections/create - Créer une nouvelle collection
export const POST: APIRoute = async ({ request }) => {
  try {
    console.log('=== API /collections/create appelée ===')

    // Vérifier l'authentification
    const cookies = request.headers.get('cookie') || ''
    console.log('Cookies reçus:', cookies)

    const authTokenMatch = cookies.match(/vinyl_vault_token=([^;]+)/)
    console.log('Token match:', authTokenMatch ? 'Trouvé' : 'Non trouvé')

    if (!authTokenMatch) {
      console.log("Erreur: Aucun token d'authentification trouvé")
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

    // Pour l'instant, on va utiliser l'ID de l'utilisateur depuis le token
    // En production, vous devriez décoder le JWT pour obtenir l'ID utilisateur
    const token = authTokenMatch[1]
    console.log('Token extrait:', token)

    // Récupérer l'utilisateur depuis la base de données
    console.log("Recherche de l'utilisateur...")

    // Pour l'instant, on va créer ou récupérer un utilisateur par défaut
    // En production, vous devriez décoder le JWT pour obtenir l'ID exact
    let user = await prisma.user.findFirst({
      orderBy: {
        createdAt: 'desc',
      },
    })

    // Si aucun utilisateur n'existe, en créer un par défaut
    if (!user) {
      console.log(
        "Aucun utilisateur trouvé, création d'un utilisateur par défaut..."
      )
      user = await prisma.user.create({
        data: {
          email: 'default@vinylvault.com',
          name: 'Utilisateur par défaut',
          password: 'default_password_hash',
        },
      })
      console.log('Utilisateur par défaut créé:', user.email)
    }

    console.log(
      'Utilisateur trouvé/créé:',
      user ? `Oui (${user.email})` : 'Non'
    )

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
    console.error('=== ERREUR lors de la création de la collection ===')
    console.error("Type d'erreur:", typeof error)
    console.error("Message d'erreur:", error)
    console.error(
      'Stack trace:',
      error instanceof Error ? error.stack : 'Pas de stack trace'
    )

    return new Response(
      JSON.stringify({
        success: false,
        error: 'Erreur interne du serveur',
        details: error instanceof Error ? error.message : 'Erreur inconnue',
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
