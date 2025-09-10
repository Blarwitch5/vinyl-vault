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
    const { email, password } = body

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

    // Recherche de l'utilisateur dans la base de données
    const user = await db.getUserByEmail(email.toLowerCase())

    if (!user) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Email ou mot de passe incorrect',
        }),
        {
          status: 401,
          headers: { 'Content-Type': 'application/json' },
        }
      )
    }

    // Vérification du mot de passe
    const isPasswordValid = await bcrypt.compare(password, user.password_hash)

    if (!isPasswordValid) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Email ou mot de passe incorrect',
        }),
        {
          status: 401,
          headers: { 'Content-Type': 'application/json' },
        }
      )
    }

    // Génération du token JWT
    const token = jwt.sign(
      {
        userId: user.id,
        email: user.email,
      },
      JWT_SECRET,
      {
        expiresIn: '7d', // Token valide 7 jours
      }
    )

    // Préparation de la réponse utilisateur (sans le hash du mot de passe)
    const userResponse = {
      id: user.id,
      email: user.email,
      name: user.name,
      createdAt: user.created_at,
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
        message: 'Connexion réussie',
      }),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Set-Cookie': cookieOptions,
        },
      }
    )
  } catch (error) {
    console.error('Erreur lors de la connexion:', error)

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

// Endpoint pour récupérer les informations de l'utilisateur connecté
export const GET: APIRoute = async ({ request }) => {
  try {
    // Récupération du token depuis l'en-tête Authorization
    const authHeader = request.headers.get('authorization')
    const token = authHeader?.replace('Bearer ', '')

    if (!token) {
      return new Response(
        JSON.stringify({
          success: false,
          error: "Token d'authentification manquant",
        }),
        {
          status: 401,
          headers: { 'Content-Type': 'application/json' },
        }
      )
    }

    // Vérification et décodage du token
    let decoded: any
    try {
      decoded = jwt.verify(token, JWT_SECRET)
    } catch (jwtError) {
      return new Response(
        JSON.stringify({
          success: false,
          error: "Token d'authentification invalide",
        }),
        {
          status: 401,
          headers: { 'Content-Type': 'application/json' },
        }
      )
    }

    // Récupération des informations utilisateur
    const user = await db.getUserById(decoded.userId)

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

    // Préparation de la réponse (sans le hash du mot de passe)
    const userResponse = {
      id: user.id,
      email: user.email,
      name: user.name,
      createdAt: user.created_at,
    }

    return new Response(
      JSON.stringify({
        success: true,
        user: userResponse,
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }
    )
  } catch (error) {
    console.error('Erreur lors de la récupération utilisateur:', error)

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
