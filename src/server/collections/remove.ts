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

// DELETE /api/collections/remove - Supprime un vinyle d'une collection
export const DELETE: APIRoute = async ({ request }) => {
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

    // Récupération des données
    const body = await request.json();
    const { vinylId, collectionId } = body;

    if (!vinylId) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'ID du vinyle requis',
        }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    // Si collectionId est fourni, vérifier que l'utilisateur possède cette collection
    if (collectionId) {
      const collections = await db.getUserCollections(userId);
      const targetCollection = collections.find(c => c.id === collectionId);

      if (!targetCollection) {
        return new Response(
          JSON.stringify({
            success: false,
            error: 'Collection non trouvée ou non autorisée',
          }),
          {
            status: 404,
            headers: { 'Content-Type': 'application/json' },
          }
        );
      }
    }

    // Vérification que le vinyle existe et appartient à l'utilisateur
    // (via ses collections)
    const userCollections = await db.getUserCollections(userId);
    let vinylFound = false;
    let vinylCollection = null;

    for (const collection of userCollections) {
      const items = await db.getCollectionItems(collection.id);
      const vinyl = items.find(item => item.id === vinylId);
      
      if (vinyl) {
        vinylFound = true;
        vinylCollection = collection;
        break;
      }
    }

    if (!vinylFound) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Vinyle non trouvé ou non autorisé',
        }),
        {
          status: 404,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    // Si un collectionId spécifique est fourni, vérifier la correspondance
    if (collectionId && vinylCollection?.id !== collectionId) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Le vinyle ne se trouve pas dans la collection spécifiée',
        }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    // Suppression du vinyle
    const success = await db.removeVinylFromCollection(vinylId);

    if (!success) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Échec de la suppression du vinyle',
        }),
        {
          status: 500,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Vinyle supprimé avec succès de la collection',
        deletedVinylId: vinylId,
        fromCollection: vinylCollection?.name,
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }
    );

  } catch (error) {
    console.error('Erreur lors de la suppression du vinyle:', error);

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

// PUT /api/collections/remove - Met à jour un vinyle dans une collection
export const PUT: APIRoute = async ({ request }) => {
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

    // Récupération des données
    const body = await request.json();
    const { vinylId, updates } = body;

    if (!vinylId || !updates) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'ID du vinyle et données de mise à jour requis',
        }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    // Vérification que le vinyle existe et appartient à l'utilisateur
    const userCollections = await db.getUserCollections(userId);
    let vinylFound = false;

    for (const collection of userCollections) {
      const items = await db.getCollectionItems(collection.id);
      const vinyl = items.find(item => item.id === vinylId);
      
      if (vinyl) {
        vinylFound = true;
        break;
      }
    }

    if (!vinylFound) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Vinyle non trouvé ou non autorisé',
        }),
        {
          status: 404,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    // Validation des données de mise à jour
    const allowedFields = [
      'title', 'artist', 'year', 'format', 'condition', 
      'cover_image', 'note', 'purchase_price', 'purchase_date', 'estimated_value'
    ];

    const sanitizedUpdates: any = {};
    
    for (const [key, value] of Object.entries(updates)) {
      if (allowedFields.includes(key)) {
        // Validation spécifique par champ
        if (key === 'year' && value !== null) {
          const year = Number(value);
          if (!Number.isInteger(year) || year < 1900 || year > new Date().getFullYear()) {
            return new Response(
              JSON.stringify({
                success: false,
                error: 'Année invalide',
              }),
              {
                status: 400,
                headers: { 'Content-Type': 'application/json' },
              }
            );
          }
          sanitizedUpdates[key] = year;
        } else if ((key === 'purchase_price' || key === 'estimated_value') && value !== null) {
          const price = Number(value);
          if (!Number.isFinite(price) || price < 0) {
            return new Response(
              JSON.stringify({
                success: false,
                error: `${key === 'purchase_price' ? 'Prix d\'achat' : 'Valeur estimée'} invalide`,
              }),
              {
                status: 400,
                headers: { 'Content-Type': 'application/json' },
              }
            );
          }
          sanitizedUpdates[key] = price;
        } else if (key === 'condition' && value !== null) {
          const validConditions = ['Mint', 'Near Mint', 'Very Good Plus', 'Very Good', 'Good Plus', 'Good', 'Fair', 'Poor'];
          if (!validConditions.includes(value)) {
            return new Response(
              JSON.stringify({
                success: false,
                error: 'État du vinyle invalide',
              }),
              {
                status: 400,
                headers: { 'Content-Type': 'application/json' },
              }
            );
          }
          sanitizedUpdates[key] = value;
        } else if (key === 'purchase_date' && value !== null) {
          try {
            sanitizedUpdates[key] = new Date(value);
          } catch (error) {
            return new Response(
              JSON.stringify({
                success: false,
                error: 'Date d\'achat invalide',
              }),
              {
                status: 400,
                headers: { 'Content-Type': 'application/json' },
              }
            );
          }
        } else if (typeof value === 'string') {
          sanitizedUpdates[key] = value.trim();
        } else {
          sanitizedUpdates[key] = value;
        }
      }
    }

    if (Object.keys(sanitizedUpdates).length === 0) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Aucune donnée valide à mettre à jour',
        }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    // Mise à jour du vinyle
    const updatedVinyl = await db.updateCollectionItem(vinylId, sanitizedUpdates);

    if (!updatedVinyl) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Échec de la mise à jour du vinyle',
        }),
        {
          status: 500,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    return new Response(
      JSON.stringify({
        success: true,
        vinyl: updatedVinyl,
        message: 'Vinyle mis à jour avec succès',
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }
    );

  } catch (error) {
    console.error('Erreur lors de la mise à jour du vinyle:', error);

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
