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
