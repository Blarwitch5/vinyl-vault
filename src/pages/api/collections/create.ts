import type { APIRoute } from "astro";

// POST /api/collections/create - Créer une nouvelle collection
export const POST: APIRoute = async ({ request, cookies }) => {
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

    // Récupérer les données de la requête
    const body = await request.json();
    const { name, description } = body;

    // Validation
    if (!name || typeof name !== "string" || name.trim().length === 0) {
      return new Response(
        JSON.stringify({
          success: false,
          error: "Le nom de la collection est requis",
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    if (name.trim().length > 100) {
      return new Response(
        JSON.stringify({
          success: false,
          error: "Le nom de la collection ne peut pas dépasser 100 caractères",
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    if (
      description &&
      typeof description === "string" &&
      description.length > 500
    ) {
      return new Response(
        JSON.stringify({
          success: false,
          error: "La description ne peut pas dépasser 500 caractères",
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // TODO: Récupérer l'ID utilisateur depuis le token JWT
    const userId = "1";

    // TODO: Créer la collection en base de données
    // Pour l'instant, on simule la création
    const newCollection = {
      id: `collection-${Date.now()}`,
      name: name.trim(),
      description: description?.trim() || null,
      vinyl_count: 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      user_id: userId,
    };

    console.log("Nouvelle collection créée:", newCollection);

    return new Response(
      JSON.stringify({
        success: true,
        collection: newCollection,
        message: "Collection créée avec succès",
      }),
      {
        status: 201,
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Erreur lors de la création de la collection:", error);

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
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
    },
  });
};
