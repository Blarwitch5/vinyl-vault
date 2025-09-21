import type { APIRoute } from 'astro'
import { db as prisma } from '../../../lib/prisma'

export const GET: APIRoute = async ({ request, cookies }) => {
  try {
    console.log('API /auth/me: Début de la requête')

    // Vérifier la présence du token cookie (comme dans le dashboard)
    const token = cookies.get('vinyl_vault_token')?.value
    console.log('API /auth/me: Token cookie trouvé:', !!token)

    if (!token) {
      console.log('API /auth/me: Aucun token trouvé')
      return new Response(
        JSON.stringify({
          success: false,
          error: "Token d'authentification manquant",
        }),
        {
          status: 401,
          headers: {
            'Content-Type': 'application/json',
          },
        }
      )
    }

    // Système d'authentification simplifié - récupérer le premier utilisateur
    // (comme dans le dashboard et les autres pages)
    const user = await prisma.user.findFirst({
      orderBy: {
        createdAt: 'desc',
      },
      select: {
        id: true,
        email: true,
        name: true,
        avatar: true,
        createdAt: true,
      },
    })

    console.log('API /auth/me: Utilisateur trouvé:', user ? user.id : 'aucun')

    if (!user) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Aucun utilisateur trouvé',
        }),
        {
          status: 401,
          headers: {
            'Content-Type': 'application/json',
          },
        }
      )
    }

    return new Response(
      JSON.stringify({
        success: true,
        user,
      }),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
        },
      }
    )
  } catch (error) {
    console.error("Erreur lors de la récupération de l'utilisateur:", error)
    return new Response(
      JSON.stringify({
        success: false,
        error: 'Erreur interne du serveur',
      }),
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
        },
      }
    )
  }
}
