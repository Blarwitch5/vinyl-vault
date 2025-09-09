import type { APIRoute } from "astro";

// GET /api/collections/list - Récupérer les collections de l'utilisateur
export const GET: APIRoute = async ({ request, cookies }) => {
  try {
    // Vérifier l'authentification
    const authToken = cookies.get("vinyl-vault-auth")?.value;

    if (!authToken) {
      return new Response(
        JSON.stringify({
          success: false,
          error: "Authentification requise",
        }),
        {
          status: 401,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // TODO: Récupérer l'ID utilisateur depuis le token JWT
    // Pour l'instant, on simule avec un utilisateur test
    const userId = "1";

    // TODO: Récupérer les collections depuis la base de données
    // Pour l'instant, on simule des collections
    const mockCollections = [
      {
        id: "collection-1",
        name: "Ma collection rock",
        description: "Tous mes vinyles rock préférés",
        vinyl_count: 15,
        created_at: "2024-01-15T10:00:00Z",
        user_id: userId,
      },
      {
        id: "collection-2",
        name: "Jazz classics",
        description: "Les grands classiques du jazz",
        vinyl_count: 8,
        created_at: "2024-02-01T14:30:00Z",
        user_id: userId,
      },
      {
        id: "collection-3",
        name: "Nouvelle collection",
        description: null,
        vinyl_count: 0,
        created_at: "2024-03-10T09:15:00Z",
        user_id: userId,
      },
    ];

    return new Response(
      JSON.stringify({
        success: true,
        collections: mockCollections,
        total: mockCollections.length,
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Erreur lors de la récupération des collections:", error);

    return new Response(
      JSON.stringify({
        success: false,
        error: "Erreur interne du serveur",
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
};

// OPTIONS pour CORS
export const OPTIONS: APIRoute = async () => {
  return new Response(null, {
    status: 200,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
    },
  });
};
