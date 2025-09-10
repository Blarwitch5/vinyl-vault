import type { APIRoute } from 'astro'
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'

const prisma = new PrismaClient()

export const POST: APIRoute = async ({ request }) => {
  try {
    const { email, password, name } = await request.json()

    // Validation des données
    if (!email || !password) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Email et mot de passe requis',
        }),
        {
          status: 400,
          headers: {
            'Content-Type': 'application/json',
          },
        }
      )
    }

    // Vérifier si l'utilisateur existe déjà
    const existingUser = await prisma.user.findUnique({
      where: { email },
    })

    if (existingUser) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Un compte avec cet email existe déjà',
        }),
        {
          status: 409,
          headers: {
            'Content-Type': 'application/json',
          },
        }
      )
    }

    // Hasher le mot de passe
    const saltRounds = 12
    const hashedPassword = await bcrypt.hash(password, saltRounds)

    // Créer l'utilisateur
    const user = await prisma.user.create({
      data: {
        email,
        name: name || null,
        password: hashedPassword,
      },
      select: {
        id: true,
        email: true,
        name: true,
        createdAt: true,
      },
    })

    // Générer le token JWT
    const jwtSecret = process.env.JWT_SECRET || 'your-super-secret-jwt-key'
    const token = jwt.sign(
      {
        userId: user.id,
        email: user.email,
      },
      jwtSecret,
      {
        expiresIn: '7d',
      }
    )

    return new Response(
      JSON.stringify({
        success: true,
        user,
        token,
        message: 'Compte créé avec succès',
      }),
      {
        status: 201,
        headers: {
          'Content-Type': 'application/json',
        },
      }
    )
  } catch (error) {
    console.error('Erreur lors de la création du compte:', error)

    return new Response(
      JSON.stringify({
        success: false,
        error: 'Erreur interne du serveur',
      }),
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
        },
      }
    )
  } finally {
    await prisma.$disconnect()
  }
}
