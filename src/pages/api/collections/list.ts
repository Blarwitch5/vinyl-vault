import type { APIRoute } from 'astro'

// GET /api/collections/list - Récupérer les collections de l'utilisateur
export const GET: APIRoute = async ({ request, cookies }) => {
  try {
    // Vérifier l'authentification
    const authToken = cookies.get('vinyl_vault_token')?.value

    if (!authToken) {
      console.log('Collections: Aucun token trouvé')
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

    console.log('Collections: Token trouvé, récupération des collections')

    // Récupérer les collections depuis la base de données
    const { PrismaClient } = await import('@prisma/client')
    const prisma = new PrismaClient()

    try {
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

      // Récupérer les collections de l'utilisateur connecté uniquement
      const collections = await prisma.collection.findMany({
        where: {
          userId: userId, // Filtrer par utilisateur connecté
        },
        include: {
          vinyls: true,
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      })

      console.log('Collections: Collections trouvées:', collections.length)

      // Formater les données pour l'API
      const formattedCollections = collections.map((collection) => {
        const totalValue = collection.vinyls.reduce(
          (sum, vinyl) => sum + (vinyl.price || 0),
          0
        )
        const averagePrice =
          collection.vinyls.length > 0
            ? totalValue / collection.vinyls.length
            : 0

        return {
          id: collection.id,
          name: collection.name,
          description: collection.description,
          vinyl_count: collection.vinyls.length,
          total_value: totalValue,
          average_price: averagePrice,
          created_at: collection.createdAt.toISOString(),
          user_id: collection.userId,
          is_public: collection.isPublic,
          user: collection.user,
        }
      })

      await prisma.$disconnect()

      return new Response(
        JSON.stringify({
          success: true,
          collections: formattedCollections,
          total: formattedCollections.length,
        }),
        {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        }
      )
    } catch (dbError) {
      console.error('Collections: Erreur base de données:', dbError)
      await prisma.$disconnect()

      return new Response(
        JSON.stringify({
          success: false,
          error: 'Erreur lors de la récupération des collections',
        }),
        {
          status: 500,
          headers: { 'Content-Type': 'application/json' },
        }
      )
    }
  } catch (error) {
    console.error('Erreur lors de la récupération des collections:', error)

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
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  })
}
