import type { APIRoute } from "astro";
import { DiscogsAPI, formatVinylForDisplay } from "../../../lib/discogs";

// GET /api/discogs/search - Endpoint pour la recherche Discogs
export const GET: APIRoute = async ({ request }) => {
  try {
    // Récupérer l'URL depuis la requête
    const url = new URL(request.url);

    // Debug: Log de l'URL complète
    console.log("URL reçue:", url.toString());
    console.log("Search params:", Array.from(url.searchParams.entries()));

    // Récupération des paramètres de recherche
    const query = url.searchParams.get("q");
    const page = parseInt(url.searchParams.get("page") || "1");
    const perPage = parseInt(url.searchParams.get("per_page") || "24");
    const type = url.searchParams.get("type") as
      | "release"
      | "master"
      | "artist"
      | "label"
      | undefined;
    const genre = url.searchParams.get("genre");
    const style = url.searchParams.get("style");
    const year = url.searchParams.get("year")
      ? parseInt(url.searchParams.get("year")!)
      : undefined;
    const format = url.searchParams.get("format");
    const country = url.searchParams.get("country");

    // Debug: Log de la query
    console.log("Query reçue:", JSON.stringify(query));

    // Validation des paramètres
    if (!query || query.trim().length === 0) {
      console.log("Erreur: query vide ou undefined");
      return new Response(
        JSON.stringify({
          success: false,
          error: "Paramètre de recherche requis",
          debug: {
            query: query,
            queryTrimmed: query?.trim(),
            queryLength: query?.length,
          },
        }),
        {
          status: 400,
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
          },
        }
      );
    }

    // Validation de la pagination
    if (page < 1 || page > 100) {
      return new Response(
        JSON.stringify({
          success: false,
          error: "Le numéro de page doit être entre 1 et 100",
        }),
        {
          status: 400,
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
          },
        }
      );
    }

    if (perPage < 1 || perPage > 100) {
      return new Response(
        JSON.stringify({
          success: false,
          error: "Le nombre de résultats par page doit être entre 1 et 100",
        }),
        {
          status: 400,
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
          },
        }
      );
    }

    // Obtenir l'instance de l'API Discogs
    const discogsAPI = DiscogsAPI.getInstance();

    // Préparer les options de recherche
    const searchOptions = {
      type: type || "release",
      page,
      per_page: perPage,
      genre: genre || undefined,
      style: style || undefined,
      year: year || undefined,
      format: format || undefined,
      country: country || undefined,
    };

    console.log("Recherche Discogs:", { query, searchOptions });

    // Effectuer la recherche
    const searchResponse = await discogsAPI.search(query, searchOptions);

    // Formater les résultats pour l'affichage
    const formattedResults = searchResponse.results.map((item) => {
      return formatVinylForDisplay(item);
    });

    // Retourner les résultats
    return new Response(
      JSON.stringify({
        success: true,
        data: {
          results: formattedResults,
          pagination: searchResponse.pagination,
          query: query,
          total: searchResponse.pagination.items,
        },
        meta: {
          searchOptions,
          timestamp: new Date().toISOString(),
        },
      }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
          "Cache-Control": "public, max-age=300", // Cache pendant 5 minutes
        },
      }
    );
  } catch (error) {
    console.error("Erreur lors de la recherche Discogs:", error);

    // Gestion des erreurs spécifiques à l'API Discogs
    let errorMessage = "Erreur interne du serveur";
    let statusCode = 500;

    if (error instanceof Error) {
      if (
        error.message.includes("401") ||
        error.message.includes("Unauthorized")
      ) {
        errorMessage = "Erreur d'authentification avec l'API Discogs";
        statusCode = 401;
      } else if (
        error.message.includes("403") ||
        error.message.includes("Forbidden")
      ) {
        errorMessage = "Accès refusé à l'API Discogs";
        statusCode = 403;
      } else if (
        error.message.includes("429") ||
        error.message.includes("Rate limit")
      ) {
        errorMessage =
          "Limite de taux atteinte. Veuillez réessayer dans quelques minutes";
        statusCode = 429;
      } else if (
        error.message.includes("404") ||
        error.message.includes("Not found")
      ) {
        errorMessage = "Aucun résultat trouvé";
        statusCode = 404;
      } else if (
        error.message.includes("timeout") ||
        error.message.includes("ECONNRESET")
      ) {
        errorMessage = "Timeout de connexion avec l'API Discogs";
        statusCode = 408;
      }
    }

    return new Response(
      JSON.stringify({
        success: false,
        error: errorMessage,
        details: error instanceof Error ? error.message : "Erreur inconnue",
        timestamp: new Date().toISOString(),
      }),
      {
        status: statusCode,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
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
      "Access-Control-Allow-Headers": "Content-Type",
    },
  });
};
