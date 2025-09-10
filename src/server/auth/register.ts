import type { APIRoute } from 'astro'
import { db } from '../../lib/db'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'

const JWT_SECRET = import.meta.env.JWT_SECRET || 'votre-secret-jwt-super-secure'

export const POST: APIRoute = async ({ request }) => {
  try {
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
    const { email, password, name } = body

    if (!email || !password) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Email et mot de passe requis',
        }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        }
      )
    }

    // Validation du format email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return new Response(
        JSON.stringify({
          success: false,
          error: "Format d'email invalide",
        }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        }
      )
    }

    // Validation de la force du mot de passe
    if (password.length < 8) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Le mot de passe doit contenir au moins 8 caractères',
        }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        }
      )
    }

    // Validation du nom (optionnel mais si fourni, doit être valide)
    if (name && (name.trim().length < 2 || name.trim().length > 50)) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Le nom doit contenir entre 2 et 50 caractères',
        }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        }
      )
    }

    // Vérification de l'unicité de l'email
    const existingUser = await db.getUserByEmail(email.toLowerCase())
    if (existingUser) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Un compte avec cet email existe déjà',
        }),
        {
          status: 409,
          headers: { 'Content-Type': 'application/json' },
        }
      )
    }

    // Hashage du mot de passe
    const saltRounds = 12
    const passwordHash = await bcrypt.hash(password, saltRounds)

    // Création de l'utilisateur
    const newUser = await db.createUser(
      email.toLowerCase(),
      passwordHash,
      name ? name.trim() : undefined
    )

    // Création d'une collection par défaut pour le nouvel utilisateur
    try {
      await db.createCollection(
        newUser.id,
        'Ma collection principale',
        'Ma première collection de vinyles',
        false // Collection privée par défaut
      )
    } catch (collectionError) {
      console.warn(
        'Erreur lors de la création de la collection par défaut:',
        collectionError
      )
      // Ne pas échouer l'inscription pour autant
    }

    // Génération du token JWT
    const token = jwt.sign(
      {
        userId: newUser.id,
        email: newUser.email,
      },
      JWT_SECRET,
      {
        expiresIn: '7d', // Token valide 7 jours
      }
    )

    // Préparation de la réponse utilisateur (sans le hash du mot de passe)
    const userResponse = {
      id: newUser.id,
      email: newUser.email,
      name: newUser.name,
      createdAt: newUser.created_at,
    }

    // Configuration du cookie sécurisé
    const isProduction = import.meta.env.NODE_ENV === 'production'
    const cookieOptions = [
      `auth_token=${token}`,
      'HttpOnly',
      'Path=/',
      `Max-Age=${7 * 24 * 60 * 60}`, // 7 jours en secondes
      'SameSite=Strict',
      ...(isProduction ? ['Secure'] : []), // HTTPS uniquement en production
    ].join('; ')

    return new Response(
      JSON.stringify({
        success: true,
        user: userResponse,
        token: token, // Pour le stockage côté client également
        message: 'Compte créé avec succès',
      }),
      {
        status: 201,
        headers: {
          'Content-Type': 'application/json',
          'Set-Cookie': cookieOptions,
        },
      }
    )
  } catch (error) {
    console.error("Erreur lors de l'inscription:", error)

    // Gestion des erreurs de base de données spécifiques
    if (error instanceof Error && error.message.includes('duplicate')) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Un compte avec cet email existe déjà',
        }),
        {
          status: 409,
          headers: { 'Content-Type': 'application/json' },
        }
      )
    }

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

// Endpoint pour vérifier la disponibilité d'un email
export const GET: APIRoute = async ({ url }) => {
  try {
    const email = url.searchParams.get('email')

    if (!email) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Email requis',
        }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        }
      )
    }

    // Validation du format email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return new Response(
        JSON.stringify({
          success: false,
          error: "Format d'email invalide",
          available: false,
        }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        }
      )
    }

    // Vérification de la disponibilité
    const existingUser = await db.getUserByEmail(email.toLowerCase())
    const isAvailable = !existingUser

    return new Response(
      JSON.stringify({
        success: true,
        email: email.toLowerCase(),
        available: isAvailable,
        message: isAvailable ? 'Email disponible' : 'Email déjà utilisé',
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }
    )
  } catch (error) {
    console.error("Erreur lors de la vérification d'email:", error)

    return new Response(
      JSON.stringify({
        success: false,
        error: 'Erreur interne du serveur',
        available: false,
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    )
  }
}
