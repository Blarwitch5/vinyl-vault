import type { APIRoute } from "astro";

export const GET: APIRoute = async ({ url }) => {
  try {
    const searchParams = new URLSearchParams(url.search);
    const query = searchParams.get("q");
    const limit = parseInt(searchParams.get("limit") || "5");

    if (!query || query.length < 2) {
      return new Response(
        JSON.stringify({
          success: false,
          error: "Requête trop courte",
        }),
        {
          status: 400,
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
    }

    // Utiliser l'API Discogs existante mais avec une limite réduite pour les suggestions
    const discogsToken = process.env.DISCOGS_API_TOKEN;

    if (!discogsToken) {
      return new Response(
        JSON.stringify({
          success: false,
          error: "API Discogs non configurée",
        }),
        {
          status: 500,
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
    }

    const discogsUrl = `https://api.discogs.com/database/search?q=${encodeURIComponent(
      query
    )}&type=release&per_page=${limit}&page=1`;

    const response = await fetch(discogsUrl, {
      headers: {
        "User-Agent": "VinylVault/1.0",
        Authorization: `Discogs token=${discogsToken}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Erreur API Discogs: ${response.status}`);
    }

    const data = await response.json();

    // Transformer les données Discogs en format simplifié pour les suggestions
    const suggestions =
      data.results?.slice(0, limit).map((item: any) => ({
        title: item.title || "Titre inconnu",
        artist: item.artist || "Artiste inconnu",
        year: item.year || null,
        coverImage: item.cover_image || "/default-vinyl-cover.svg",
        format: item.format?.[0] || "LP",
        discogsId: item.id,
        discogsUrl: item.uri,
      })) || [];

    return new Response(
      JSON.stringify({
        success: true,
        results: suggestions,
        query: query,
      }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
  } catch (error) {
    console.error("Erreur lors de la recherche de suggestions:", error);
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
  }
};
