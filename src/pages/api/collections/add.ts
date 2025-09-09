import type { APIRoute } from "astro";

// POST /api/collections/add - Ajouter un vinyle à une collection
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
    const { collection_id, vinyl_data } = body;

    // Validation
    if (!collection_id || typeof collection_id !== "string") {
      return new Response(
        JSON.stringify({
          success: false,
          error: "ID de collection requis",
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    if (!vinyl_data || typeof vinyl_data !== "object") {
      return new Response(
        JSON.stringify({
          success: false,
          error: "Données du vinyle requises",
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // TODO: Récupérer l'ID utilisateur depuis le token JWT
    const userId = "1";

    // TODO: Vérifier que la collection appartient à l'utilisateur
    // TODO: Vérifier que le vinyle n'est pas déjà dans la collection
    // TODO: Ajouter le vinyle à la collection en base de données

    // Pour l'instant, on simule l'ajout
    const vinylEntry = {
      id: `vinyl-${Date.now()}`,
      collection_id,
      discogs_id: vinyl_data.discogsId,
      title: vinyl_data.title,
      artist: vinyl_data.artist,
      year: vinyl_data.year,
      format: vinyl_data.format,
      condition: "Near Mint", // Par défaut
      cover_image: vinyl_data.coverImage,
      discogs_url: vinyl_data.discogsUrl,
      labels: Array.isArray(vinyl_data.labels)
        ? vinyl_data.labels.join(", ")
        : null,
      catalog_number: vinyl_data.catalogNumber,
      genre: Array.isArray(vinyl_data.genre)
        ? vinyl_data.genre.join(", ")
        : null,
      style: Array.isArray(vinyl_data.style)
        ? vinyl_data.style.join(", ")
        : null,
      country: vinyl_data.country,
      notes: null,
      purchase_price: null,
      purchase_date: null,
      estimated_value: null,
      added_at: new Date().toISOString(),
      user_id: userId,
    };

    console.log("Vinyle ajouté à la collection:", {
      collection_id,
      vinyl: vinylEntry,
    });

    return new Response(
      JSON.stringify({
        success: true,
        vinyl: vinylEntry,
        message: "Vinyle ajouté à la collection avec succès",
      }),
      {
        status: 201,
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Erreur lors de l'ajout du vinyle à la collection:", error);

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
