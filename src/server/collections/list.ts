import type { APIRoute } from 'astro';
import { db } from '../../lib/db';
import jwt from 'jsonwebtoken';

const JWT_SECRET = import.meta.env.JWT_SECRET || 'votre-secret-jwt-super-secure';

// Middleware pour vérifier l'authentification
async function authenticateUser(request: Request) {
  const authHeader = request.headers.get('authorization');
  const token = authHeader?.replace('Bearer ', '');

  if (!token) {
    throw new Error('Token d\'authentification manquant');
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    return decoded.userId;
  } catch (error) {
    throw new Error('Token d\'authentification invalide');
  }
}

// GET /api/collections/list - Récupère toutes les collections de l'utilisateur
export const GET: APIRoute = async ({ request, url }) => {
  try {
    // Authentification
    let userId: string;
    try {
      userId = await authenticateUser(request);
    } catch (authError) {
      return new Response(
        JSON.stringify({
          success: false,
          error: authError instanceof Error ? authError.message : 'Erreur d\'authentification',
        }),
        {
          status: 401,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    // Paramètres de requête optionnels
    const includeItems = url.searchParams.get('include_items') === 'true';
    const publicOnly = url.searchParams.get('public_only') === 'true';

    // Récupération des collections
    const collections = await db.getUserCollections(userId);

    // Filtrage des collections publiques si demandé
    const filteredCollections = publicOnly 
      ? collections.filter(c => c.is_public) 
      : collections;

    // Enrichissement avec les éléments si demandé
    const enrichedCollections = await Promise.all(
      filteredCollections.map(async (collection) => {
        const baseCollection = {
          id: collection.id,
          name: collection.name,
          description: collection.description,
          isPublic: collection.is_public,
          createdAt: collection.created_at,
          updatedAt: collection.updated_at,
        };

        if (includeItems) {
          try {
            const items = await db.getCollectionItems(collection.id);
            const stats = await db.getCollectionStats(collection.id);
            
            return {
              ...baseCollection,
              items,
              stats,
              itemCount: items.length,
              totalValue: stats.totalValue,
            };
          } catch (error) {
            console.warn(`Erreur lors de la récupération des items pour la collection ${collection.id}:`, error);
            return {
              ...baseCollection,
              items: [],
              itemCount: 0,
              totalValue: 0,
            };
          }
        }

        // Récupération rapide du nombre d'éléments
        try {
          const items = await db.getCollectionItems(collection.id);
          const stats = await db.getCollectionStats(collection.id);
          
          return {
            ...baseCollection,
            itemCount: items.length,
            totalValue: stats.totalValue,
          };
        } catch (error) {
          console.warn(`Erreur lors du calcul des stats pour la collection ${collection.id}:`, error);
          return {
            ...baseCollection,
            itemCount: 0,
            totalValue: 0,
          };
        }
      })
    );

    return new Response(
      JSON.stringify({
        success: true,
        collections: enrichedCollections,
        total: enrichedCollections.length,
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }
    );

  } catch (error) {
    console.error('Erreur lors de la récupération des collections:', error);

    return new Response(
      JSON.stringify({
        success: false,
        error: 'Erreur interne du serveur',
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
};

// POST /api/collections/list - Crée une nouvelle collection
export const POST: APIRoute = async ({ request }) => {
  try {
    // Authentification
    let userId: string;
    try {
      userId = await authenticateUser(request);
    } catch (authError) {
      return new Response(
        JSON.stringify({
          success: false,
          error: authError instanceof Error ? authError.message : 'Erreur d\'authentification',
        }),
        {
          status: 401,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    // Validation du Content-Type
    const contentType = request.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Content-Type doit être application/json',
        }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    // Récupération et validation des données
    const body = await request.json();
    const { name, description, isPublic = false } = body;

    if (!name || name.trim().length === 0) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Le nom de la collection est requis',
        }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    if (name.trim().length > 100) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Le nom de la collection ne peut pas dépasser 100 caractères',
        }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    if (description && description.length > 500) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'La description ne peut pas dépasser 500 caractères',
        }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    // Vérification du nombre maximum de collections par utilisateur
    const existingCollections = await db.getUserCollections(userId);
    const maxCollections = 10; // Limite raisonnable
    
    if (existingCollections.length >= maxCollections) {
      return new Response(
        JSON.stringify({
          success: false,
          error: `Vous ne pouvez pas créer plus de ${maxCollections} collections`,
        }),
        {
          status: 429,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    // Vérification de l'unicité du nom pour cet utilisateur
    const duplicateName = existingCollections.find(
      c => c.name.toLowerCase() === name.trim().toLowerCase()
    );
    
    if (duplicateName) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Vous avez déjà une collection avec ce nom',
        }),
        {
          status: 409,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    // Création de la collection
    const newCollection = await db.createCollection(
      userId,
      name.trim(),
      description ? description.trim() : undefined,
      Boolean(isPublic)
    );

    return new Response(
      JSON.stringify({
        success: true,
        collection: {
          id: newCollection.id,
          name: newCollection.name,
          description: newCollection.description,
          isPublic: newCollection.is_public,
          createdAt: newCollection.created_at,
          updatedAt: newCollection.updated_at,
          itemCount: 0,
          totalValue: 0,
        },
        message: 'Collection créée avec succès',
      }),
      {
        status: 201,
        headers: { 'Content-Type': 'application/json' },
      }
    );

  } catch (error) {
    console.error('Erreur lors de la création de la collection:', error);

    return new Response(
      JSON.stringify({
        success: false,
        error: 'Erreur interne du serveur',
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
};
