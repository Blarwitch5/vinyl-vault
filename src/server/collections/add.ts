import type { APIRoute } from 'astro'
import { db } from '../../lib/db'
import jwt from 'jsonwebtoken'

const JWT_SECRET = import.meta.env.JWT_SECRET || 'votre-secret-jwt-super-secure'

// Middleware pour vérifier l'authentification
async function authenticateUser(request: Request) {
  const authHeader = request.headers.get('authorization')
  const token = authHeader?.replace('Bearer ', '')

  if (!token) {
    throw new Error("Token d'authentification manquant")
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any
    return decoded.userId
  } catch (error) {
    throw new Error("Token d'authentification invalide")
  }
}

export const POST: APIRoute = async ({ request }) => {
  try {
    // Authentification
    let userId: string
    try {
      userId = await authenticateUser(request)
    } catch (authError) {
      return new Response(
        JSON.stringify({
          success: false,
          error:
            authError instanceof Error
              ? authError.message
              : "Erreur d'authentification",
        }),
        {
          status: 401,
          headers: { 'Content-Type': 'application/json' },
        }
      )
    }

    // Validation du Content-Type
    const contentType = request.headers.get('content-type')
    if (!contentType || !contentType.includes('application/json')) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Content-Type doit être application/json',
        }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        }
      )
    }

    // Récupération et validation des données
    const body = await request.json()
    const {
      collectionId,
      discogsId,
      title,
      artist,
      year,
      format,
      condition,
      coverImage,
      note,
      purchasePrice,
      purchaseDate,
      estimatedValue,
    } = body

    // Validation des champs requis
    if (!collectionId || !title || !artist) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Collection ID, titre et artiste sont requis',
        }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        }
      )
    }

    // Validation des types de données
    if (
      year &&
      (typeof year !== 'number' ||
        year < 1900 ||
        year > new Date().getFullYear())
    ) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Année invalide',
        }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        }
      )
    }

    if (
      purchasePrice &&
      (typeof purchasePrice !== 'number' || purchasePrice < 0)
    ) {
      return new Response(
        JSON.stringify({
          success: false,
          error: "Prix d'achat invalide",
        }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        }
      )
    }

    if (
      estimatedValue &&
      (typeof estimatedValue !== 'number' || estimatedValue < 0)
    ) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Valeur estimée invalide',
        }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        }
      )
    }

    // Validation de l'état du vinyle
    const validConditions = [
      'Mint',
      'Near Mint',
      'Very Good Plus',
      'Very Good',
      'Good Plus',
      'Good',
      'Fair',
      'Poor',
    ]
    if (condition && !validConditions.includes(condition)) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'État du vinyle invalide',
        }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        }
      )
    }

    // Vérification que la collection appartient à l'utilisateur
    const collections = await db.getUserCollections(userId)
    const targetCollection = collections.find((c) => c.id === collectionId)

    if (!targetCollection) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Collection non trouvée ou non autorisée',
        }),
        {
          status: 404,
          headers: { 'Content-Type': 'application/json' },
        }
      )
    }

    // Préparation des données du vinyle
    const vinylData = {
      discogs_id: discogsId,
      title: title.trim(),
      artist: artist.trim(),
      year,
      format,
      condition,
      cover_image: coverImage,
      note: note ? note.trim() : undefined,
      purchase_price: purchasePrice,
      purchase_date: purchaseDate ? new Date(purchaseDate) : undefined,
      estimated_value: estimatedValue,
    }

    // Ajout du vinyle à la collection
    const newVinyl = await db.addVinylToCollection(collectionId, vinylData)

    return new Response(
      JSON.stringify({
        success: true,
        vinyl: newVinyl,
        message: 'Vinyle ajouté avec succès à la collection',
      }),
      {
        status: 201,
        headers: { 'Content-Type': 'application/json' },
      }
    )
  } catch (error) {
    console.error("Erreur lors de l'ajout du vinyle:", error)

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

// Endpoint pour ajouter un vinyle depuis Discogs
export const PUT: APIRoute = async ({ request }) => {
  try {
    // Authentification
    let userId: string
    try {
      userId = await authenticateUser(request)
    } catch (authError) {
      return new Response(
        JSON.stringify({
          success: false,
          error:
            authError instanceof Error
              ? authError.message
              : "Erreur d'authentification",
        }),
        {
          status: 401,
          headers: { 'Content-Type': 'application/json' },
        }
      )
    }

    const body = await request.json()
    const { collectionId, discogsReleaseId } = body

    if (!collectionId || !discogsReleaseId) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Collection ID et Discogs Release ID requis',
        }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        }
      )
    }

    // Vérification que la collection appartient à l'utilisateur
    const collections = await db.getUserCollections(userId)
    const targetCollection = collections.find((c) => c.id === collectionId)

    if (!targetCollection) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Collection non trouvée ou non autorisée',
        }),
        {
          status: 404,
          headers: { 'Content-Type': 'application/json' },
        }
      )
    }

    // Récupération des données depuis Discogs
    const { discogsAPI } = await import('../../lib/discogs')
    const discogsRelease = await discogsAPI.getRelease(discogsReleaseId)

    // Extraction des informations principales
    const mainArtist = discogsRelease.artists?.[0]?.name || 'Artiste inconnu'
    const year = discogsRelease.year || undefined
    const format = discogsRelease.formats?.[0]?.name || undefined
    const coverImage =
      discogsRelease.images?.find((img) => img.type === 'primary')?.uri ||
      discogsRelease.images?.[0]?.uri ||
      undefined

    // Préparation des données du vinyle
    const vinylData = {
      discogs_id: discogsReleaseId.toString(),
      title: discogsRelease.title.trim(),
      artist: mainArtist.trim(),
      year,
      format,
      cover_image: coverImage,
      // Valeurs par défaut pour les nouveaux ajouts
      condition: 'Very Good Plus' as const,
      estimated_value: undefined, // Pourrait être récupéré via l'API marketplace de Discogs
    }

    // Ajout du vinyle à la collection
    const newVinyl = await db.addVinylToCollection(collectionId, vinylData)

    return new Response(
      JSON.stringify({
        success: true,
        vinyl: newVinyl,
        discogsData: {
          discogsUrl: `https://www.discogs.com${discogsRelease.uri}`,
          dataQuality: discogsRelease.data_quality,
          genres: discogsRelease.genres,
          styles: discogsRelease.styles,
        },
        message: 'Vinyle ajouté depuis Discogs avec succès',
      }),
      {
        status: 201,
        headers: { 'Content-Type': 'application/json' },
      }
    )
  } catch (error) {
    console.error("Erreur lors de l'ajout depuis Discogs:", error)

    if (error instanceof Error && error.message.includes('404')) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Release Discogs non trouvée',
        }),
        {
          status: 404,
          headers: { 'Content-Type': 'application/json' },
        }
      )
    }

    return new Response(
      JSON.stringify({
        success: false,
        error: 'Erreur lors de la récupération des données Discogs',
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    )
  }
}
