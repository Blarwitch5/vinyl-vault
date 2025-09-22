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
    const { vinylId, listened } = await request.json()

    // Validation
    if (!vinylId || typeof vinylId !== 'string') {
      return new Response(JSON.stringify({ error: 'ID du vinyle requis' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    if (typeof listened !== 'boolean') {
      return new Response(
        JSON.stringify({ error: "Statut d'écoute requis (boolean)" }),
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

    // Mettre à jour le statut d'écoute
    const now = new Date()
    const updatedVinyl = await prisma.vinyl.update({
      where: { id: vinylId },
      data: {
        listened: listened,
        listenedAt: listened ? now : null, // Date d'écoute seulement si écouté
        updatedAt: now,
      },
    })

    console.log(
      `✅ Statut d'écoute mis à jour: ${vinyl.title} → ${listened ? 'Écouté' : 'Non écouté'}`
    )

    return new Response(
      JSON.stringify({
        success: true,
        vinyl: {
          id: updatedVinyl.id,
          listened: updatedVinyl.listened,
          listenedAt: updatedVinyl.listenedAt,
          updatedAt: updatedVinyl.updatedAt,
        },
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error("Erreur lors de la mise à jour du statut d'écoute:", error)
    return new Response(
      JSON.stringify({
        error: 'Erreur interne du serveur',
        details: error instanceof Error ? error.message : 'Erreur inconnue',
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    )
  }
}
