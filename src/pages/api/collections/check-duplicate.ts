import type { APIRoute } from 'astro'
import { PrismaClient } from '@prisma/client'
import { verifyAuth } from '../../../lib/auth'

const prisma = new PrismaClient()

export const POST: APIRoute = async ({ request }) => {
  try {
    // Vérifier l'authentification
    const user = await verifyAuth(request)
    if (!user) {
      return new Response(JSON.stringify({ error: 'Non authentifié' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    const body = await request.json()
    const { discogsId, title, artist } = body

    if (!discogsId && (!title || !artist)) {
      return new Response(
        JSON.stringify({
          error: 'discogsId ou (title et artist) requis pour la vérification',
        }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        }
      )
    }

    // Rechercher le vinyle dans les collections de l'utilisateur
    let existingVinyl = null

    if (discogsId) {
      // Recherche par discogsId (plus précise)
      existingVinyl = await prisma.vinyl.findFirst({
        where: {
          discogsId: discogsId,
          collection: {
            userId: user.id,
          },
        },
        include: {
          collection: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      })
    }

    if (!existingVinyl && title && artist) {
      // Recherche par titre et artiste si pas trouvé par discogsId
      existingVinyl = await prisma.vinyl.findFirst({
        where: {
          title: {
            contains: title,
            mode: 'insensitive',
          },
          artist: {
            contains: artist,
            mode: 'insensitive',
          },
          collection: {
            userId: user.id,
          },
        },
        include: {
          collection: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      })
    }

    if (existingVinyl) {
      return new Response(
        JSON.stringify({
          exists: true,
          vinyl: {
            id: existingVinyl.id,
            title: existingVinyl.title,
            artist: existingVinyl.artist,
            coverImage: existingVinyl.coverImage,
            collection: existingVinyl.collection,
          },
        }),
        {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        }
      )
    }

    return new Response(JSON.stringify({ exists: false }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (error) {
    console.error('Erreur lors de la vérification de doublon:', error)
    return new Response(
      JSON.stringify({
        error: 'Erreur serveur lors de la vérification',
        details: error instanceof Error ? error.message : 'Erreur inconnue',
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    )
  }
}
