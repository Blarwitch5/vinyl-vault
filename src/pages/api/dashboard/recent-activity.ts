import type { APIRoute } from 'astro'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export const GET: APIRoute = async ({ request }) => {
  try {
    // Vérifier l'authentification
    const cookies = request.headers.get('cookie') || ''
    const tokenMatch = cookies.match(/vinyl_vault_token=([^;]+)/)

    if (!tokenMatch) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Authentification requise',
        }),
        {
          status: 401,
          headers: { 'Content-Type': 'application/json' },
        }
      )
    }

    // Récupérer l'utilisateur authentifié
    const user = await prisma.user.findFirst({
      where: {
        // Pour simplifier, on prend le premier utilisateur créé
        // En production, vous devriez décoder le JWT pour obtenir l'ID exact
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    if (!user) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Utilisateur non trouvé',
        }),
        {
          status: 404,
          headers: { 'Content-Type': 'application/json' },
        }
      )
    }

    const userId = user.id

    // Récupérer l'activité récente (derniers 10 éléments)
    const recentActivity = []

    // 1. Vinyles ajoutés récemment (dernières 24h)
    const recentVinyls = await prisma.vinyl.findMany({
      where: {
        userId: userId,
        createdAt: {
          gte: new Date(Date.now() - 24 * 60 * 60 * 1000), // Dernières 24h
        },
      },
      include: {
        collection: {
          select: { name: true },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: 5,
    })

    recentVinyls.forEach((vinyl) => {
      recentActivity.push({
        id: `vinyl-${vinyl.id}`,
        type: 'vinyl_added',
        title: 'Vinyle ajouté',
        description: vinyl.title,
        collection: vinyl.collection?.name,
        timestamp: vinyl.createdAt,
        icon: 'disc',
        color: 'emerald',
      })
    })

    // 2. Collections créées récemment (dernières 7 jours)
    const recentCollections = await prisma.collection.findMany({
      where: {
        userId: userId,
        createdAt: {
          gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // Derniers 7 jours
        },
      },
      orderBy: { createdAt: 'desc' },
      take: 3,
    })

    recentCollections.forEach((collection) => {
      recentActivity.push({
        id: `collection-${collection.id}`,
        type: 'collection_created',
        title: 'Collection créée',
        description: collection.name,
        collection: null,
        timestamp: collection.createdAt,
        icon: 'library',
        color: 'emerald',
      })
    })

    // 3. Vinyles supprimés récemment (si on avait un champ deletedAt)
    // Pour l'instant, on n'a pas de soft delete, donc on ne peut pas tracker les suppressions

    // Trier par timestamp décroissant et prendre les 10 plus récents
    const sortedActivity = recentActivity
      .sort(
        (a, b) =>
          new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      )
      .slice(0, 10)

    // Formater les timestamps pour l'affichage
    const formattedActivity = sortedActivity.map((activity) => ({
      ...activity,
      timeAgo: formatTimeAgo(new Date(activity.timestamp)),
    }))

    return new Response(
      JSON.stringify({
        success: true,
        activity: formattedActivity,
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }
    )
  } catch (error) {
    console.error(
      "Erreur lors de la récupération de l'activité récente:",
      error
    )
    return new Response(
      JSON.stringify({
        success: false,
        error: 'Erreur interne du serveur',
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    )
  } finally {
    await prisma.$disconnect()
  }
}

/**
 * Formate un timestamp en "il y a X temps"
 */
function formatTimeAgo(date: Date): string {
  const now = new Date()
  const diffInMs = now.getTime() - date.getTime()
  const diffInMinutes = Math.floor(diffInMs / (1000 * 60))
  const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60))
  const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24))

  if (diffInMinutes < 1) {
    return "À l'instant"
  } else if (diffInMinutes < 60) {
    return `Il y a ${diffInMinutes} min`
  } else if (diffInHours < 24) {
    return `Il y a ${diffInHours}h`
  } else if (diffInDays === 1) {
    return 'Hier'
  } else if (diffInDays < 7) {
    return `Il y a ${diffInDays} jours`
  } else {
    return date.toLocaleDateString('fr-FR')
  }
}
