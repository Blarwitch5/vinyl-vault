import type { APIRoute } from 'astro'

// GET /api/auth/check - Vérifier l'authentification de l'utilisateur
export const GET: APIRoute = async ({ request, cookies }) => {
  try {
    // Récupérer le token d'authentification depuis les cookies
    const authToken = cookies.get('vinyl-vault-auth')?.value

    if (!authToken) {
      return new Response(
        JSON.stringify({
          authenticated: false,
          message: "Aucun token d'authentification trouvé",
        }),
        {
          status: 401,
          headers: { 'Content-Type': 'application/json' },
        }
      )
    }

    // TODO: Valider le token JWT
    // Pour l'instant, on simule une validation
    try {
      // Ici on devrait valider le JWT avec la bibliothèque jsonwebtoken
      // const jwt = await import('jsonwebtoken');
      // const decoded = jwt.verify(authToken, process.env.JWT_SECRET);

      // Simulation d'un utilisateur connecté
      const mockUser = {
        id: '1',
        email: 'user@example.com',
        name: 'Utilisateur Test',
      }

      return new Response(
        JSON.stringify({
          authenticated: true,
          user: mockUser,
        }),
        {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        }
      )
    } catch (tokenError) {
      // Token invalide
      return new Response(
        JSON.stringify({
          authenticated: false,
          message: "Token d'authentification invalide",
        }),
        {
          status: 401,
          headers: { 'Content-Type': 'application/json' },
        }
      )
    }
  } catch (error) {
    console.error("Erreur lors de la vérification d'authentification:", error)

    return new Response(
      JSON.stringify({
        authenticated: false,
        error: 'Erreur interne du serveur',
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    )
  }
}

// OPTIONS pour CORS
export const OPTIONS: APIRoute = async () => {
  return new Response(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  })
}
