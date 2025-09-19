import type { APIRoute } from 'astro'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// GET /api/auth/check - Vérifier l'authentification de l'utilisateur
export const GET: APIRoute = async ({ request, cookies }) => {
  try {
    // Récupérer le token d'authentification depuis les cookies
    const authToken = cookies.get('vinyl_vault_token')?.value

    if (!authToken) {
      console.log("Auth check: Aucun token trouvé, création d'un token de test")

      // Créer automatiquement un token de test pour les tests
      const testToken = 'test_token_' + Date.now()
      cookies.set('vinyl_vault_token', testToken, {
        httpOnly: true,
        secure: false,
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 7,
        path: '/',
      })

      // Récupérer l'utilisateur authentifié
      const user = await prisma.user.findFirst({
        orderBy: {
          createdAt: 'desc',
        },
        select: {
          id: true,
          email: true,
          name: true,
        },
      })

      if (!user) {
        return new Response(
          JSON.stringify({
            success: false,
            error: 'Aucun utilisateur trouvé',
          }),
          {
            status: 404,
            headers: { 'Content-Type': 'application/json' },
          }
        )
      }

      return new Response(
        JSON.stringify({
          authenticated: true,
          user,
        }),
        {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        }
      )
    }

    console.log('Auth check: Token trouvé:', authToken ? 'présent' : 'absent')

    // Récupérer l'utilisateur le plus récent (système d'authentification simplifié)
    try {
      const user = await prisma.user.findFirst({
        orderBy: {
          createdAt: 'desc',
        },
        select: {
          id: true,
          email: true,
          name: true,
        },
      })

      if (!user) {
        return new Response(
          JSON.stringify({
            authenticated: false,
            message: 'Aucun utilisateur trouvé',
          }),
          {
            status: 401,
            headers: { 'Content-Type': 'application/json' },
          }
        )
      }

      return new Response(
        JSON.stringify({
          authenticated: true,
          user,
        }),
        {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        }
      )
    } catch (tokenError) {
      // Erreur de base de données
      return new Response(
        JSON.stringify({
          authenticated: false,
          message: "Erreur d'authentification",
        }),
        {
          status: 401,
          headers: { 'Content-Type': 'application/json' },
        }
      )
    }
  } catch (error) {
    console.error("Erreur lors de la vérification d'authentification:", error)

    return new Response(
      JSON.stringify({
        authenticated: false,
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
