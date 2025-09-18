import type { APIRoute } from 'astro'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export const GET: APIRoute = async ({ request, cookies }) => {
  try {
    const token = cookies.get('vinyl_vault_token')?.value

    if (!token) {
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

    // Récupérer ou créer l'utilisateur de test
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
      select: {
        id: true,
        email: true,
        name: true,
        avatar: true,
        createdAt: true,
      },
    })

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
