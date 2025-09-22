import type { APIRoute } from 'astro'
import { db as prisma } from '../../../lib/prisma'
import jwt from 'jsonwebtoken'
import sharp from 'sharp'
import { writeFile, mkdir } from 'fs/promises'
import { join } from 'path'
import { existsSync } from 'fs'

const AVATAR_SIZE = 128
const AVATAR_QUALITY = 80

export const POST: APIRoute = async ({ request }) => {
  try {
    // Vérifier l'authentification
    const authHeader = request.headers.get('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
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
          headers: { 'Content-Type': 'application/json' },
        }
      )
    }

    // Récupérer l'utilisateur
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
          headers: { 'Content-Type': 'application/json' },
        }
      )
    }

    // Récupérer le fichier depuis FormData
    const formData = await request.formData()
    const file = formData.get('avatar') as File

    if (!file) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Aucun fichier fourni',
        }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        }
      )
    }

    // Vérifier le type de fichier
    if (!file.type.startsWith('image/')) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Le fichier doit être une image',
        }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        }
      )
    }

    // Vérifier la taille du fichier (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Le fichier est trop volumineux (max 5MB)',
        }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        }
      )
    }

    // Créer le dossier avatars s'il n'existe pas
    const avatarsDir = join(process.cwd(), 'public', 'avatars')
    if (!existsSync(avatarsDir)) {
      await mkdir(avatarsDir, { recursive: true })
    }

    // Générer un nom de fichier unique
    const fileExtension = 'jpg'
    const fileName = `${user.id}-${Date.now()}.${fileExtension}`
    const filePath = join(avatarsDir, fileName)

    // Convertir le fichier en buffer
    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    // Compresser et redimensionner l'image avec Sharp
    await sharp(buffer)
      .resize(AVATAR_SIZE, AVATAR_SIZE, {
        fit: 'cover',
        position: 'center',
      })
      .jpeg({ quality: AVATAR_QUALITY })
      .toFile(filePath)

    // Mettre à jour l'avatar de l'utilisateur en base
    const avatarUrl = `/avatars/${fileName}`
    await prisma.user.update({
      where: { id: user.id },
      data: { avatar: avatarUrl },
    })

    return new Response(
      JSON.stringify({
        success: true,
        avatarUrl: avatarUrl,
        message: 'Avatar mis à jour avec succès',
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }
    )
  } catch (error) {
    console.error("Erreur lors de l'upload de l'avatar:", error)
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
