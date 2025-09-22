import type { APIRoute } from 'astro'
import { db as prisma } from '../../../lib/prisma'

export const POST: APIRoute = async ({ request, cookies }) => {
  try {
    // Récupérer l'utilisateur le plus récent (système d'authentification simplifié)
    const user = await prisma.user.findFirst({
      orderBy: {
        createdAt: 'desc',
      },
    })

    if (!user) {
      return new Response(JSON.stringify({ error: 'Utilisateur non trouvé' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    // Parser les données de la requête
    const { vinylId, rating } = await request.json()

    // Validation
    if (!vinylId || typeof vinylId !== 'string') {
      return new Response(JSON.stringify({ error: 'ID du vinyle requis' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    if (rating === undefined || rating === null) {
      return new Response(JSON.stringify({ error: 'Note requise' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    // Validation de la note (0-5)
    const numericRating = parseInt(rating)
    if (isNaN(numericRating) || numericRating < 0 || numericRating > 5) {
      return new Response(
        JSON.stringify({ error: 'La note doit être entre 0 et 5' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      )
    }

    // Vérifier que le vinyle appartient à l'utilisateur
    const vinyl = await prisma.vinyl.findFirst({
      where: {
        id: vinylId,
        userId: user.id,
      },
    })

    if (!vinyl) {
      return new Response(
        JSON.stringify({ error: 'Vinyle non trouvé ou non autorisé' }),
        { status: 404, headers: { 'Content-Type': 'application/json' } }
      )
    }

    // Mettre à jour la note
    const updatedVinyl = await prisma.vinyl.update({
      where: { id: vinylId },
      data: {
        userRating: numericRating === 0 ? null : numericRating,
        updatedAt: new Date(),
      },
    })

    console.log(
      `✅ Note mise à jour: ${vinyl.title} → ${updatedVinyl.userRating} étoiles`
    )

    return new Response(
      JSON.stringify({
        success: true,
        vinyl: {
          id: updatedVinyl.id,
          userRating: updatedVinyl.userRating,
          updatedAt: updatedVinyl.updatedAt,
        },
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('Erreur complète lors de la mise à jour de la note:', error)
    console.error(
      'Stack trace:',
      error instanceof Error ? error.stack : 'Pas de stack trace'
    )

    return new Response(
      JSON.stringify({
        error: 'Erreur interne du serveur',
        details: error instanceof Error ? error.message : 'Erreur inconnue',
        stack: error instanceof Error ? error.stack : undefined,
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    )
  }
}
