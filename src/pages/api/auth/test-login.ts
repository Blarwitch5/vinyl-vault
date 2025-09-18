import type { APIRoute } from 'astro'

// POST /api/auth/test-login - Créer un token de test pour les tests
export const POST: APIRoute = async ({ cookies }) => {
  try {
    // Créer un token de test
    const testToken = 'test_token_' + Date.now()

    // Définir le cookie
    cookies.set('vinyl_vault_token', testToken, {
      httpOnly: true,
      secure: false, // En développement
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 jours
      path: '/',
    })

    console.log('Test login: Token créé:', testToken)

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Token de test créé',
        token: testToken,
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }
    )
  } catch (error) {
    console.error('Erreur lors de la création du token de test:', error)

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
