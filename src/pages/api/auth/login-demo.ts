import type { APIRoute } from "astro";

// POST /api/auth/login-demo - Connexion de démonstration (sans mot de passe)
export const POST: APIRoute = async ({ request, cookies }) => {
  try {
    // Créer un token de session temporaire pour la démo
    const demoToken = "demo-user-token-" + Date.now();

    // Définir le cookie d'authentification
    cookies.set("vinyl-vault-auth", demoToken, {
      path: "/",
      maxAge: 24 * 60 * 60, // 24 heures
      httpOnly: false, // Pour que JavaScript puisse y accéder si nécessaire
      secure: false, // En développement
      sameSite: "lax",
    });

    return new Response(
      JSON.stringify({
        success: true,
        message: "Connexion de démonstration réussie",
        user: {
          id: "1",
          email: "demo@vinylvault.com",
          name: "Utilisateur Démo",
        },
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Erreur lors de la connexion de démonstration:", error);

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

// GET /api/auth/login-demo - Connexion automatique pour la démo
export const GET: APIRoute = async ({ request, cookies }) => {
  return POST({ request, cookies });
};
