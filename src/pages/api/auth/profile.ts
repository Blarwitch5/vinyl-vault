import type { APIRoute } from 'astro'
import { PrismaClient } from '@prisma/client'
import jwt from 'jsonwebtoken'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

export const PUT: APIRoute = async ({ request }) => {
  try {
    const authHeader = request.headers.get('authorization')

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return new Response(
        JSON.stringify({
          success: false,
          error: "Token d'authentification manquant",
        }),
        {
          status: 401,
          headers: {
            'Content-Type': 'application/json',
          },
        }
      )
    }

    const token = authHeader.substring(7)
    const jwtSecret = process.env.JWT_SECRET || 'your-super-secret-jwt-key'

    let decoded: any
    try {
      decoded = jwt.verify(token, jwtSecret)
    } catch (error) {
      return new Response(
        JSON.stringify({
          success: false,
          error: "Token d'authentification invalide",
        }),
        {
          status: 401,
          headers: {
            'Content-Type': 'application/json',
          },
        }
      )
    }

    const { name, email, avatar, currentPassword, newPassword } =
      await request.json()

    // Vérifier si l'utilisateur existe
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
    })

    if (!user) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Utilisateur non trouvé',
        }),
        {
          status: 404,
          headers: {
            'Content-Type': 'application/json',
          },
        }
      )
    }

    // Préparer les données à mettre à jour
    const updateData: any = {}

    if (name !== undefined) {
      updateData.name = name
    }

    if (avatar !== undefined) {
      updateData.avatar = avatar
    }

    if (email !== undefined && email !== user.email) {
      // Vérifier si l'email n'est pas déjà utilisé
      const existingUser = await prisma.user.findUnique({
        where: { email },
      })

      if (existingUser) {
        return new Response(
          JSON.stringify({
            success: false,
            error: 'Cet email est déjà utilisé par un autre compte',
          }),
          {
            status: 409,
            headers: {
              'Content-Type': 'application/json',
            },
          }
        )
      }

      updateData.email = email
    }

    // Si un nouveau mot de passe est fourni
    if (newPassword) {
      if (!currentPassword) {
        return new Response(
          JSON.stringify({
            success: false,
            error:
              'Le mot de passe actuel est requis pour changer le mot de passe',
          }),
          {
            status: 400,
            headers: {
              'Content-Type': 'application/json',
            },
          }
        )
      }

      // Vérifier le mot de passe actuel
      const isCurrentPasswordValid = await bcrypt.compare(
        currentPassword,
        user.password
      )

      if (!isCurrentPasswordValid) {
        return new Response(
          JSON.stringify({
            success: false,
            error: 'Mot de passe actuel incorrect',
          }),
          {
            status: 400,
            headers: {
              'Content-Type': 'application/json',
            },
          }
        )
      }

      // Valider le nouveau mot de passe
      if (newPassword.length < 8) {
        return new Response(
          JSON.stringify({
            success: false,
            error:
              'Le nouveau mot de passe doit contenir au moins 8 caractères',
          }),
          {
            status: 400,
            headers: {
              'Content-Type': 'application/json',
            },
          }
        )
      }

      // Hasher le nouveau mot de passe
      updateData.password = await bcrypt.hash(newPassword, 12)
    }

    // Mettre à jour l'utilisateur
    const updatedUser = await prisma.user.update({
      where: { id: decoded.userId },
      data: updateData,
      select: {
        id: true,
        email: true,
        name: true,
        avatar: true,
        createdAt: true,
        updatedAt: true,
      },
    })

    return new Response(
      JSON.stringify({
        success: true,
        user: updatedUser,
        message: 'Profil mis à jour avec succès',
      }),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
        },
      }
    )
  } catch (error) {
    console.error('Erreur lors de la mise à jour du profil:', error)
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
  }
}
