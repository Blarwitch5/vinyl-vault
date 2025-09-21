import type { APIRoute } from 'astro'

// POST /api/collections/add - Ajouter un vinyle à une collection
export const POST: APIRoute = async ({ request, cookies }) => {
  try {
    // Vérifier l'authentification
    const authToken = cookies.get('vinyl_vault_token')?.value

    if (!authToken) {
      console.log('Add vinyl: Aucun token trouvé')
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

    // Récupérer les données de la requête
    const body = await request.json()

    const {
      collection_id,
      vinyl_data,
      // Champs directs (pour le scan de code-barres et autres sources)
      title,
      artist,
      year,
      genre,
      label,
      format,
      condition,
      price,
      note,
      imageUrl,
      coverImage,
      discogsId,
      discogsUrl,
      barcode,
      country,
      catalogNumber,
      tracks,
      rating,
      ratingCount,
    } = body

    // Validation - soit collection_id + vinyl_data, soit les champs directs
    const hasDirectFields = title && artist
    const hasVinylData = collection_id && vinyl_data

    if (!hasDirectFields && !hasVinylData) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Données du vinyle requises',
        }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        }
      )
    }

    // Récupérer les collections depuis la base de données
    const { PrismaClient } = await import('@prisma/client')
    const prisma = new PrismaClient()

    try {
      // Vérifier que la collection existe
      const collection = await prisma.collection.findUnique({
        where: { id: collection_id },
      })

      if (!collection) {
        await prisma.$disconnect()
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

      // Préparer les données du vinyle
      let vinylData

      // Récupérer l'utilisateur authentifié
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

      // Récupérer l'utilisateur depuis la base de données
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

      // Récupérer les détails complets depuis Discogs si on a un discogsId
      let fullVinylData = null
      const vinylDiscogsId = hasDirectFields ? discogsId : vinyl_data.discogsId

      if (vinylDiscogsId && vinylDiscogsId.trim() !== '') {
        console.log(
          'Add vinyl: Récupération des détails depuis Discogs:',
          vinylDiscogsId
        )
        try {
          const discogsResponse = await fetch(
            `https://api.discogs.com/releases/${vinylDiscogsId}`,
            {
              headers: {
                'User-Agent': 'VinylVault/1.0 +https://vinylvault.com',
              },
            }
          )
          console.log(
            'Add vinyl: Réponse Discogs status:',
            discogsResponse.status
          )

          if (discogsResponse.ok) {
            fullVinylData = await discogsResponse.json()
            console.log(
              'Add vinyl: Données Discogs récupérées:',
              fullVinylData.title,
              'Image:',
              fullVinylData.images?.[0]?.uri
            )
          } else {
            console.log(
              'Add vinyl: ⚠️ Discogs API non disponible:',
              discogsResponse.status,
              '- Utilisation des données de base'
            )
          }
        } catch (discogsError) {
          console.log(
            'Add vinyl: ⚠️ Enrichissement Discogs échoué (normal):',
            discogsError instanceof Error
              ? discogsError.message
              : 'Erreur réseau',
            '- Utilisation des données de base'
          )
        }
      }

      if (hasDirectFields) {
        // Données directes du scan de code-barres (enrichies avec Discogs)
        vinylData = {
          title: fullVinylData?.title || title,
          artist: fullVinylData?.artists?.[0]?.name || artist,
          year:
            fullVinylData?.year || (year ? parseInt(year.toString()) : null),
          format: fullVinylData?.formats?.[0]?.name || format || 'LP',
          condition: condition || 'Near Mint',
          coverImage:
            fullVinylData?.images?.[0]?.uri ||
            coverImage ||
            imageUrl ||
            '/default-vinyl-cover.svg',
          discogsId: discogsId,
          discogsUrl: fullVinylData?.uri || discogsUrl,
          barcode:
            fullVinylData?.identifiers?.find((id) => id.type === 'Barcode')
              ?.value || barcode,
          tracks: fullVinylData?.tracklist
            ? JSON.stringify(fullVinylData.tracklist)
            : tracks,
          genre: fullVinylData?.genres?.[0] || genre,
          price: price ? parseFloat(price.toString()) : null,
          note: note || null,
          userId: userId,
          collectionId: collection_id,
        }
      } else {
        // Données via vinyl_data (format de la modal, enrichies avec Discogs)
        vinylData = {
          title: fullVinylData?.title || vinyl_data.title,
          artist: fullVinylData?.artists?.[0]?.name || vinyl_data.artist,
          year:
            fullVinylData?.year ||
            (vinyl_data.year ? parseInt(vinyl_data.year.toString()) : null),
          format:
            fullVinylData?.formats?.[0]?.name || vinyl_data.format || 'LP',
          condition: vinyl_data.condition || 'Near Mint',
          coverImage:
            fullVinylData?.images?.[0]?.uri ||
            vinyl_data.coverImage ||
            '/default-vinyl-cover.svg',
          discogsId: vinyl_data.discogsId,
          discogsUrl: fullVinylData?.uri || vinyl_data.discogsUrl,
          barcode:
            fullVinylData?.identifiers?.find((id) => id.type === 'Barcode')
              ?.value || vinyl_data.barcode,
          tracks: fullVinylData?.tracklist
            ? JSON.stringify(fullVinylData.tracklist)
            : vinyl_data.tracks,
          genre: fullVinylData?.genres?.[0] || vinyl_data.genre,
          price: vinyl_data.price
            ? parseFloat(vinyl_data.price.toString())
            : null,
          note: vinyl_data.note || null,
          userId: userId,
          collectionId: collection_id,
        }
      }

      // Créer le vinyle en base de données
      const newVinyl = await prisma.vinyl.create({
        data: vinylData,
      })

      // Recalculer les statistiques de la collection
      try {
        const collectionVinyls = await prisma.vinyl.findMany({
          where: { collectionId: collection_id },
          select: { price: true },
        })

        const totalVinyls = collectionVinyls.length
        const totalValue = collectionVinyls.reduce(
          (sum, vinyl) => sum + (vinyl.price || 0),
          0
        )
        const averagePrice = totalVinyls > 0 ? totalValue / totalVinyls : 0

        await prisma.collection.update({
          where: { id: collection_id },
          data: {
            vinylCount: totalVinyls,
            totalValue: totalValue,
            averagePrice: averagePrice,
          },
        })
      } catch (statsError) {
        console.log(
          'Add vinyl: Erreur lors de la mise à jour des statistiques:',
          statsError
        )
      }

      await prisma.$disconnect()

      return new Response(
        JSON.stringify({
          success: true,
          vinyl: newVinyl,
          message: 'Vinyle ajouté à la collection avec succès',
        }),
        {
          status: 201,
          headers: { 'Content-Type': 'application/json' },
        }
      )
    } catch (dbError) {
      console.error('Add vinyl: Erreur base de données:', dbError)
      console.error("Add vinyl: Détails de l'erreur:", {
        message: dbError.message,
        code: dbError.code,
        stack: dbError.stack,
      })
      await prisma.$disconnect()

      return new Response(
        JSON.stringify({
          success: false,
          error: "Erreur lors de l'ajout du vinyle",
          details: dbError.message,
        }),
        {
          status: 500,
          headers: { 'Content-Type': 'application/json' },
        }
      )
    }
  } catch (error) {
    console.error("Erreur lors de l'ajout du vinyle à la collection:", error)

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
  }
}

// OPTIONS pour CORS
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
