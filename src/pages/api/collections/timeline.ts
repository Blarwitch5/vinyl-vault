import type { APIRoute } from 'astro'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export const GET: APIRoute = async ({ url, request }) => {
  try {
    // Vérifier l'authentification
    const authHeader = request.headers.get('authorization')
    const cookies = request.headers.get('cookie')

    // Récupérer l'ID de la collection depuis les paramètres
    const collectionId = url.searchParams.get('collectionId')

    if (!collectionId) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'ID de collection manquant',
        }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        }
      )
    }

    // Récupérer la collection avec ses vinyles
    const collection = await prisma.collection.findUnique({
      where: { id: collectionId },
      include: {
        vinyls: {
          select: {
            id: true,
            title: true,
            artist: true,
            year: true,
            coverImage: true,
            discogsUrl: true,
            discogsId: true,
            createdAt: true,
            updatedAt: true,
          },
          orderBy: [{ year: 'desc' }, { title: 'asc' }],
        },
        user: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    })

    if (!collection) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Collection non trouvée',
        }),
        {
          status: 404,
          headers: { 'Content-Type': 'application/json' },
        }
      )
    }

    // Vérifier si la collection est publique ou si l'utilisateur est le propriétaire
    // Pour l'instant, on permet l'accès (à améliorer avec l'auth)

    // Traiter les données pour la timeline
    const processedVinyls = collection.vinyls.map((vinyl) => ({
      id: vinyl.id,
      title: vinyl.title,
      artist: vinyl.artist,
      year: vinyl.year,
      coverImage: vinyl.coverImage || '/default-vinyl-cover.svg',
      discogsUrl: vinyl.discogsUrl || '',
      discogsId: vinyl.discogsId || '',
      createdAt: vinyl.createdAt,
      updatedAt: vinyl.updatedAt,
    }))

    // Calculer des statistiques
    const years = processedVinyls
      .map((v) => v.year)
      .filter((y) => y !== null) as number[]

    const statistics = {
      totalVinyls: processedVinyls.length,
      yearRange:
        years.length > 0
          ? {
              min: Math.min(...years),
              max: Math.max(...years),
              span: Math.max(...years) - Math.min(...years) + 1,
            }
          : null,
      decadeDistribution: getDecadeDistribution(years),
      averageYear:
        years.length > 0
          ? Math.round(
              years.reduce((sum, year) => sum + year, 0) / years.length
            )
          : null,
    }

    return new Response(
      JSON.stringify({
        success: true,
        collection: {
          id: collection.id,
          name: collection.name,
          description: collection.description,
          isPublic: collection.isPublic,
          user: collection.user,
        },
        vinyls: processedVinyls,
        statistics,
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }
    )
  } catch (error) {
    console.error(
      'Erreur lors de la récupération des données chronologiques:',
      error
    )

    return new Response(
      JSON.stringify({
        success: false,
        error: 'Erreur serveur lors de la récupération des données',
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    )
  }
}

// Fonction utilitaire pour calculer la distribution par décennie
function getDecadeDistribution(years: number[]): { [decade: string]: number } {
  const distribution: { [decade: string]: number } = {}

  years.forEach((year) => {
    let decade: string

    if (year >= 2020) decade = '2020s'
    else if (year >= 2010) decade = '2010s'
    else if (year >= 2000) decade = '2000s'
    else if (year >= 1990) decade = '1990s'
    else if (year >= 1980) decade = '1980s'
    else if (year >= 1970) decade = '1970s'
    else if (year >= 1960) decade = '1960s'
    else decade = 'older'

    distribution[decade] = (distribution[decade] || 0) + 1
  })

  return distribution
}
