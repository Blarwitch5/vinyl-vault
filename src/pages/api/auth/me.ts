import type { APIRoute } from 'astro'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export const GET: APIRoute = async ({ request, cookies }) => {
  try {
    console.log('API /auth/me: Début de la requête')

    // Vérifier la présence du token (cookie ou header Authorization)
    let token = cookies.get('vinyl_vault_token')?.value

    // Si pas de token dans les cookies, vérifier l'header Authorization
    if (!token) {
      const authHeader = request.headers.get('authorization')
      if (authHeader && authHeader.startsWith('Bearer ')) {
        token = authHeader.substring(7)
      }
    }

    console.log('API /auth/me: Token trouvé:', !!token)

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
        username: true,
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
  } finally {
    await prisma.$disconnect()
  }
}
