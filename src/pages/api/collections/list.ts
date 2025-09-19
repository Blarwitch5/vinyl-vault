import type { APIRoute } from 'astro'

// GET /api/collections/list - Récupérer les collections de l'utilisateur
export const GET: APIRoute = async ({ request, cookies }) => {
  try {
    console.log('Collections API: Début de la récupération des collections')

    // Récupérer les collections depuis la base de données
    const { PrismaClient } = await import('@prisma/client')
    const prisma = new PrismaClient()

    try {
      // Récupérer l'utilisateur le plus récent (système d'authentification simplifié)
      console.log(
        "Collections API: Récupération de l'utilisateur le plus récent"
      )

      // Récupérer l'utilisateur depuis la base de données
      const user = await prisma.user.findFirst({
        where: {
          // Pour simplifier, on prend le premier utilisateur créé
          // En production, vous devriez décoder le JWT pour obtenir l'ID exact
        },
        orderBy: {
          createdAt: 'desc',
        },
      })

      if (!user) {
        console.log('Collections API: Aucun utilisateur trouvé')
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

      console.log('Collections API: Utilisateur trouvé:', user.id)
      const userId = user.id

      // Récupérer les collections de l'utilisateur connecté uniquement
      console.log(
        'Collections API: Récupération des collections pour userId:',
        userId
      )
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

      console.log('Collections API: Collections trouvées:', collections.length)

      // Formater les données pour l'API (même si aucune collection)
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
      console.error('Collections API: Erreur base de données:', dbError)
      await prisma.$disconnect()

      return new Response(
        JSON.stringify({
          success: false,
          error: 'Erreur lors de la récupération des collections',
          details:
            dbError instanceof Error ? dbError.message : 'Erreur inconnue',
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
