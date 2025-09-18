import type { APIRoute } from 'astro'
import { verifyAuth } from '../../../lib/auth'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export const GET: APIRoute = async ({ request }) => {
  try {
    // Vérifier l'authentification
    const user = await verifyAuth(request)
    if (!user) {
      return new Response(JSON.stringify({ error: 'Non autorisé' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    // Récupérer toutes les collections de l'utilisateur avec leurs vinyles
    const collections = await prisma.collection.findMany({
      where: {
        userId: user.id,
      },
      include: {
        vinyls: true,
      },
    })

    // Calculer les statistiques
    const stats = calculatePersonalStats(collections)

    return new Response(JSON.stringify(stats), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (error) {
    console.error('Erreur lors de la récupération des statistiques:', error)
    return new Response(
      JSON.stringify({
        error: 'Erreur lors de la récupération des statistiques',
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    )
  }
}

function calculatePersonalStats(collections: any[]) {
  const allVinyls = collections.flatMap((collection) => collection.vinyls)

  // Statistiques de base
  const totalVinyls = allVinyls.length
  const totalCollections = collections.length

  // Genres favoris (utiliser le champ genre du schéma)
  const genreCounts: Record<string, number> = {}
  allVinyls.forEach((vinyl) => {
    if (vinyl.genre) {
      genreCounts[vinyl.genre] = (genreCounts[vinyl.genre] || 0) + 1
    }
  })
  const topGenres = Object.entries(genreCounts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 10)
    .map(([genre, count]) => ({ genre, count }))

  // Années dominantes
  const yearCounts: Record<number, number> = {}
  allVinyls.forEach((vinyl) => {
    if (vinyl.year) {
      yearCounts[vinyl.year] = (yearCounts[vinyl.year] || 0) + 1
    }
  })
  const topYears = Object.entries(yearCounts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 10)
    .map(([year, count]) => ({ year: parseInt(year), count }))

  // Formats favoris (utiliser le champ format du schéma)
  const formatCounts: Record<string, number> = {}
  allVinyls.forEach((vinyl) => {
    if (vinyl.format) {
      formatCounts[vinyl.format] = (formatCounts[vinyl.format] || 0) + 1
    }
  })
  const topFormats = Object.entries(formatCounts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 10)
    .map(([format, count]) => ({ format, count }))

  // Répartition par décennie
  const decadeCounts: Record<string, number> = {}
  allVinyls.forEach((vinyl) => {
    if (vinyl.year) {
      const decade = Math.floor(vinyl.year / 10) * 10
      const decadeLabel = `${decade}s`
      decadeCounts[decadeLabel] = (decadeCounts[decadeLabel] || 0) + 1
    }
  })
  const decadeDistribution = Object.entries(decadeCounts)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([decade, count]) => ({ decade, count }))

  // Année la plus ancienne et la plus récente
  const years = allVinyls
    .filter((vinyl) => vinyl.year)
    .map((vinyl) => vinyl.year)
    .sort((a, b) => a - b)

  const oldestYear = years[0] || null
  const newestYear = years[years.length - 1] || null

  // Moyenne d'âge de la collection
  const currentYear = new Date().getFullYear()
  const averageAge =
    years.length > 0
      ? Math.round(
          years.reduce((sum, year) => sum + (currentYear - year), 0) /
            years.length
        )
      : 0

  return {
    overview: {
      totalVinyls,
      totalCollections,
      oldestYear,
      newestYear,
      averageAge,
    },
    topGenres,
    topYears,
    topFormats,
    decadeDistribution,
  }
}
