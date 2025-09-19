import type { APIRoute } from 'astro'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export const POST: APIRoute = async ({ request, cookies }) => {
  try {
    const authToken = cookies.get('vinyl_vault_token')?.value
    const token =
      request.headers.get('Authorization')?.replace('Bearer ', '') || authToken

    if (!token) {
      return new Response(
        JSON.stringify({ success: false, error: 'Authentification requise' }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      )
    }

    // Récupérer l'utilisateur authentifié
    const user = await prisma.user.findFirst({
      orderBy: {
        createdAt: 'desc',
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

    const userId = user.id

    // Récupérer TOUS les vinyles de l'utilisateur
    const allUserVinyls = await prisma.vinyl.findMany({
      where: { userId: userId },
      select: {
        id: true,
        price: true,
        genre: true,
      },
    })

    // Calculer les statistiques
    const totalVinyls = allUserVinyls.length
    const totalValue = allUserVinyls.reduce(
      (sum, vinyl) => sum + (vinyl.price || 0),
      0
    )
    const averageValue =
      allUserVinyls.length > 0 ? totalValue / allUserVinyls.length : 0

    // Calculer les genres les plus populaires
    const genreCounts: { [key: string]: number } = {}
    allUserVinyls.forEach((vinyl: any) => {
      if (vinyl.genre) {
        genreCounts[vinyl.genre] = (genreCounts[vinyl.genre] || 0) + 1
      }
    })
    const topGenres = Object.entries(genreCounts)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 4)

    // Récupérer le nombre total de collections
    const totalCollections = await prisma.collection.count({
      where: { userId: userId },
    })

    const stats = {
      totalVinyls,
      totalValue,
      totalCollections,
      averageValue,
      topGenres,
    }

    console.log('Statistiques recalculées:', stats)

    return new Response(
      JSON.stringify({
        success: true,
        stats: stats,
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('Erreur lors du recalcul des statistiques:', error)
    return new Response(
      JSON.stringify({ success: false, error: 'Erreur interne du serveur' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    )
  }
}

export const OPTIONS: APIRoute = async () => {
  return new Response(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  })
}
