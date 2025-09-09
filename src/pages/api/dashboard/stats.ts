import type { APIRoute } from "astro";
import { PrismaClient } from "@prisma/client";
import jwt from "jsonwebtoken";

const prisma = new PrismaClient();

export const GET: APIRoute = async ({ request }) => {
  try {
    // Récupérer le token depuis l'en-tête Authorization
    const authHeader = request.headers.get("Authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return new Response(
        JSON.stringify({
          success: false,
          error: "Token d'authentification requis",
        }),
        {
          status: 401,
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
    }

    const token = authHeader.substring(7); // Enlever "Bearer "
    const jwtSecret = process.env.JWT_SECRET || "your-super-secret-jwt-key";

    let userId: string;
    try {
      const decoded = jwt.verify(token, jwtSecret) as { userId: string };
      userId = decoded.userId;
    } catch (error) {
      return new Response(
        JSON.stringify({
          success: false,
          error: "Token invalide",
        }),
        {
          status: 401,
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
    }

    // Récupérer les statistiques pour l'utilisateur
    const [user, collections, vinyls] = await Promise.all([
      prisma.user.findUnique({
        where: { id: userId },
        select: {
          id: true,
          email: true,
          name: true,
        },
      }),
      prisma.collection.findMany({
        where: { userId },
        include: {
          vinyls: {
            select: {
              price: true,
            },
          },
          _count: {
            select: {
              vinyls: true,
            },
          },
        },
      }),
      prisma.vinyl.findMany({
        where: { userId },
        select: {
          id: true,
          title: true,
          artist: true,
          year: true,
          genre: true,
          format: true,
          condition: true,
          coverImage: true,
          price: true,
          createdAt: true,
        },
        orderBy: {
          createdAt: "desc",
        },
        take: 6, // Les 6 derniers ajouts
      }),
    ]);

    if (!user) {
      return new Response(
        JSON.stringify({
          success: false,
          error: "Utilisateur non trouvé",
        }),
        {
          status: 404,
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
    }

    // Calculer les statistiques
    const totalVinyls = await prisma.vinyl.count({
      where: { userId },
    });

    const totalValueResult = await prisma.vinyl.aggregate({
      where: { userId },
      _sum: {
        price: true,
      },
    });

    const totalValue = totalValueResult._sum.price || 0;
    const averageValue = totalVinyls > 0 ? totalValue / totalVinyls : 0;

    // Calculer les genres les plus populaires
    const genreStats = await prisma.vinyl.groupBy({
      by: ["genre"],
      where: {
        userId,
        genre: {
          not: null,
        },
      },
      _count: {
        genre: true,
      },
      orderBy: {
        _count: {
          genre: "desc",
        },
      },
      take: 4,
    });

    const topGenres = genreStats.map((stat) => ({
      name: stat.genre || "Inconnu",
      count: stat._count.genre,
    }));

    // Formater les collections
    const userCollections = collections.map((collection) => ({
      id: collection.id,
      name: collection.name,
      description: collection.description,
      itemCount: collection._count.vinyls,
      totalValue: collection.vinyls.reduce(
        (sum, vinyl) => sum + (vinyl.price || 0),
        0
      ),
      isPublic: collection.isPublic,
    }));

    // Formater les vinyles récents
    const recentVinyls = vinyls.map((vinyl) => ({
      id: vinyl.id,
      title: vinyl.title,
      artist: vinyl.artist,
      year: vinyl.year,
      format: vinyl.format,
      condition: vinyl.condition,
      coverImage: vinyl.coverImage,
      price: vinyl.price,
    }));

    const stats = {
      totalVinyls,
      totalValue: Number(totalValue.toFixed(2)),
      totalCollections: collections.length,
      averageValue: Number(averageValue.toFixed(2)),
      topGenres,
    };

    return new Response(
      JSON.stringify({
        success: true,
        user,
        collections: userCollections,
        recentVinyls,
        stats,
      }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
  } catch (error) {
    console.error("Erreur lors de la récupération des stats dashboard:", error);

    return new Response(
      JSON.stringify({
        success: false,
        error: "Erreur interne du serveur",
      }),
      {
        status: 500,
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
  } finally {
    await prisma.$disconnect();
  }
};
