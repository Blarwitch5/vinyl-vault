import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'
import dotenv from 'dotenv'

// Charger les variables d'environnement
dotenv.config()

const prisma = new PrismaClient()

// Configuration pour l'API Discogs
const DISCOGS_API_URL = 'https://api.discogs.com'
const DISCOGS_TOKEN = process.env.DISCOGS_API_TOKEN
const USER_AGENT = 'VinylVault/1.0 +https://github.com/vinylvault/app'

// Interface pour les résultats Discogs
interface DiscogsSearchResult {
  id: number
  title: string
  year?: string
  format?: string[]
  country?: string
  uri?: string
  cover_image?: string
  thumb?: string
}

interface DiscogsSearchResponse {
  results: DiscogsSearchResult[]
  pagination: {
    pages: number
    page: number
    per_page: number
    items: number
    urls: any
  }
}

// Fonction pour chercher un album sur Discogs avec authentification
async function searchDiscogs(artist: string, title: string) {
  if (!DISCOGS_TOKEN) {
    console.warn("⚠️ Token Discogs manquant - utilisation d'image par défaut")
    return {
      discogsId: null,
      discogsUrl: null,
      coverImage: '/default-vinyl-cover.svg',
    }
  }

  try {
    const searchQuery = encodeURIComponent(`${artist} ${title}`)
    const response = await fetch(
      `${DISCOGS_API_URL}/database/search?q=${searchQuery}&type=release&format=vinyl&token=${DISCOGS_TOKEN}`,
      {
        headers: {
          'User-Agent': USER_AGENT,
          Authorization: `Discogs token=${DISCOGS_TOKEN}`,
        },
      }
    )

    if (!response.ok) {
      console.warn(
        `⚠️ Erreur API Discogs pour "${artist} - ${title}": ${response.status} ${response.statusText}`
      )
      return {
        discogsId: null,
        discogsUrl: null,
        coverImage: '/default-vinyl-cover.svg',
      }
    }

    const data: DiscogsSearchResponse = await response.json()

    if (data.results && data.results.length > 0) {
      // Chercher le meilleur match (priorité aux releases avec cover_image)
      const bestMatch =
        data.results.find((result) => result.cover_image) || data.results[0]

      console.log(`✅ Trouvé: ${bestMatch.title} (${bestMatch.year || 'N/A'})`)

      return {
        discogsId: bestMatch.id?.toString(),
        discogsUrl: bestMatch.uri
          ? `https://www.discogs.com${bestMatch.uri}`
          : null,
        coverImage:
          bestMatch.cover_image ||
          bestMatch.thumb ||
          '/default-vinyl-cover.svg',
      }
    }

    console.warn(`❌ Aucun résultat trouvé pour "${artist} - ${title}"`)
    return {
      discogsId: null,
      discogsUrl: null,
      coverImage: '/default-vinyl-cover.svg',
    }
  } catch (error) {
    console.warn(
      `⚠️ Erreur lors de la recherche Discogs pour "${artist} - ${title}":`,
      error
    )
    return {
      discogsId: null,
      discogsUrl: null,
      coverImage: '/default-vinyl-cover.svg',
    }
  }
}

// Fonction pour attendre entre les requêtes (rate limiting)
function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

async function main() {
  console.log('🎵 Début du seeding avec API Discogs...')

  if (!DISCOGS_TOKEN) {
    console.log('⚠️ DISCOGS_API_TOKEN non configuré dans .env')
    console.log('📝 Pour configurer :')
    console.log('   1. Aller sur https://www.discogs.com/settings/developers')
    console.log('   2. Générer un nouveau token')
    console.log("   3. L'ajouter dans votre fichier .env :")
    console.log('      DISCOGS_API_TOKEN=votre_token_ici')
    console.log('   4. Relancer ce script')
    console.log('')
    console.log("⏳ Utilisation d'images par défaut en attendant...")
  }

  // Nettoyer les données existantes
  await prisma.vinyl.deleteMany()
  await prisma.collection.deleteMany()
  await prisma.user.deleteMany()

  // Créer des utilisateurs de démonstration
  const hashedPassword = await bcrypt.hash('motdepasse123', 12)

  const user1 = await prisma.user.create({
    data: {
      email: 'demo@vinylvault.com',
      name: 'Utilisateur Demo',
      password: hashedPassword,
      avatar: 'blue',
    },
  })

  const user2 = await prisma.user.create({
    data: {
      email: 'collector@vinylvault.com',
      name: 'Marie Collector',
      password: hashedPassword,
      avatar: 'emerald',
    },
  })

  console.log('✅ Utilisateurs créés')

  // Créer les collections
  const collection1 = await prisma.collection.create({
    data: {
      name: 'Ma collection principale',
      description: 'Mes vinyles préférés',
      isPublic: false,
      userId: user1.id,
    },
  })

  const collection2 = await prisma.collection.create({
    data: {
      name: 'Jazz Classics',
      description: 'Ma collection de jazz',
      isPublic: true,
      userId: user1.id,
    },
  })

  const collection3 = await prisma.collection.create({
    data: {
      name: 'Rock Legends',
      description: 'Les plus grands albums rock',
      isPublic: true,
      userId: user2.id,
    },
  })

  console.log('✅ Collections créées')

  // Albums à ajouter avec recherche Discogs
  const albumsToAdd = [
    // Collection Rock
    {
      artist: 'Pink Floyd',
      title: 'The Dark Side of the Moon',
      year: 1973,
      genre: 'Rock',
      format: 'LP',
      condition: 'Near Mint',
      price: 45.0,
      note: 'Album emblématique en excellent état',
      userId: user1.id,
      collectionId: collection1.id,
    },
    {
      artist: 'The Beatles',
      title: 'Abbey Road',
      year: 1969,
      genre: 'Rock',
      format: 'LP',
      condition: 'Very Good Plus',
      price: 38.0,
      note: 'Pressage original UK',
      userId: user1.id,
      collectionId: collection1.id,
    },
    {
      artist: 'Led Zeppelin',
      title: 'Led Zeppelin IV',
      year: 1971,
      genre: 'Rock',
      format: 'LP',
      condition: 'Near Mint',
      price: 52.0,
      userId: user1.id,
      collectionId: collection1.id,
    },
    {
      artist: 'Pink Floyd',
      title: 'The Wall',
      year: 1979,
      genre: 'Rock',
      format: 'LP',
      condition: 'Very Good Plus',
      price: 35.0,
      userId: user1.id,
      collectionId: collection1.id,
    },
    {
      artist: 'Fleetwood Mac',
      title: 'Rumours',
      year: 1977,
      genre: 'Rock',
      format: 'LP',
      condition: 'Near Mint',
      price: 28.0,
      userId: user1.id,
      collectionId: collection1.id,
    },
    {
      artist: 'The Rolling Stones',
      title: 'Sticky Fingers',
      year: 1971,
      genre: 'Rock',
      format: 'LP',
      condition: 'Near Mint',
      price: 32.0,
      userId: user1.id,
      collectionId: collection1.id,
    },

    // Collection Jazz
    {
      artist: 'Miles Davis',
      title: 'Kind of Blue',
      year: 1959,
      genre: 'Jazz',
      format: 'LP',
      condition: 'Very Good Plus',
      price: 32.0,
      note: "Chef-d'œuvre du jazz modal",
      userId: user1.id,
      collectionId: collection2.id,
    },
    {
      artist: 'John Coltrane',
      title: 'A Love Supreme',
      year: 1965,
      genre: 'Jazz',
      format: 'LP',
      condition: 'Near Mint',
      price: 48.0,
      userId: user1.id,
      collectionId: collection2.id,
    },
    {
      artist: 'John Coltrane',
      title: 'Giant Steps',
      year: 1960,
      genre: 'Jazz',
      format: 'LP',
      condition: 'Very Good Plus',
      price: 45.0,
      userId: user1.id,
      collectionId: collection2.id,
    },
    {
      artist: 'Dave Brubeck',
      title: 'Time Out',
      year: 1959,
      genre: 'Jazz',
      format: 'LP',
      condition: 'Near Mint',
      price: 38.0,
      userId: user1.id,
      collectionId: collection2.id,
    },
    {
      artist: 'Bill Evans Trio',
      title: 'Waltz for Debby',
      year: 1961,
      genre: 'Jazz',
      format: 'LP',
      condition: 'Very Good Plus',
      price: 35.0,
      userId: user1.id,
      collectionId: collection2.id,
    },

    // Albums électroniques
    {
      artist: 'Daft Punk',
      title: 'Random Access Memories',
      year: 2013,
      genre: 'Electronic',
      format: 'LP',
      condition: 'Mint',
      price: 25.0,
      userId: user1.id,
      collectionId: collection1.id,
    },
    {
      artist: 'Daft Punk',
      title: 'Discovery',
      year: 2001,
      genre: 'Electronic',
      format: 'LP',
      condition: 'Near Mint',
      price: 30.0,
      userId: user1.id,
      collectionId: collection1.id,
    },
    {
      artist: 'Justice',
      title: 'Cross',
      year: 2007,
      genre: 'Electronic',
      format: 'LP',
      condition: 'Near Mint',
      price: 26.0,
      userId: user1.id,
      collectionId: collection1.id,
    },

    // Albums Pop
    {
      artist: 'Michael Jackson',
      title: 'Thriller',
      year: 1982,
      genre: 'Pop',
      format: 'LP',
      condition: 'Very Good Plus',
      price: 22.0,
      userId: user1.id,
      collectionId: collection1.id,
    },
    {
      artist: 'Prince',
      title: 'Purple Rain',
      year: 1984,
      genre: 'Pop',
      format: 'LP',
      condition: 'Near Mint',
      price: 28.0,
      userId: user1.id,
      collectionId: collection1.id,
    },

    // Collection de Marie
    {
      artist: 'Queen',
      title: 'A Night at the Opera',
      year: 1975,
      genre: 'Rock',
      format: 'LP',
      condition: 'Near Mint',
      price: 35.0,
      userId: user2.id,
      collectionId: collection3.id,
    },
    {
      artist: 'Eagles',
      title: 'Hotel California',
      year: 1976,
      genre: 'Rock',
      format: 'LP',
      condition: 'Very Good Plus',
      price: 24.0,
      userId: user2.id,
      collectionId: collection3.id,
    },
  ]

  console.log(
    `🔍 Recherche des images sur Discogs (${albumsToAdd.length} albums)...`
  )
  console.log('⏳ Veuillez patienter, cela peut prendre quelques minutes...')

  let successCount = 0
  let errorCount = 0

  // Créer les vinyles avec images Discogs
  for (let i = 0; i < albumsToAdd.length; i++) {
    const album = albumsToAdd[i]

    console.log(
      `\n${i + 1}/${albumsToAdd.length} - ${album.artist} - ${album.title}`
    )

    // Rechercher sur Discogs
    const discogsData = await searchDiscogs(album.artist, album.title)

    if (discogsData.discogsId) {
      successCount++
    } else {
      errorCount++
    }

    // Créer le vinyle avec les données Discogs ou par défaut
    await prisma.vinyl.create({
      data: {
        title: album.title,
        artist: album.artist,
        year: album.year,
        genre: album.genre,
        format: album.format,
        condition: album.condition,
        price: album.price,
        note: album.note,
        coverImage: discogsData.coverImage,
        discogsId: discogsData.discogsId,
        discogsUrl: discogsData.discogsUrl,
        userId: album.userId,
        collectionId: album.collectionId,
      },
    })

    // Attendre 1 seconde entre chaque requête pour respecter les limites de l'API
    if (i < albumsToAdd.length - 1) {
      await delay(1000)
    }
  }

  console.log('\n✅ Vinyles créés avec API Discogs')

  // Afficher les statistiques
  const userCount = await prisma.user.count()
  const collectionCount = await prisma.collection.count()
  const vinylCount = await prisma.vinyl.count()

  console.log(`\n📊 Statistiques finales :`)
  console.log(`   👥 Utilisateurs : ${userCount}`)
  console.log(`   📚 Collections : ${collectionCount}`)
  console.log(`   🎵 Vinyles : ${vinylCount}`)
  console.log(`   ✅ Images Discogs trouvées : ${successCount}`)
  console.log(`   ❌ Images par défaut : ${errorCount}`)

  console.log('\n🎉 Base de données VinylVault initialisée avec succès !')
  console.log('\n📋 Comptes de test créés :')
  console.log('   Email: demo@vinylvault.com')
  console.log('   Email: collector@vinylvault.com')
  console.log('   Mot de passe: motdepasse123')

  if (DISCOGS_TOKEN && successCount > 0) {
    console.log('\n🖼️ Images utilisées :')
    console.log('   📸 Images Discogs authentiques haute qualité')
    console.log('   🔗 IDs et URLs Discogs réels')
    console.log("   ✨ Données complètes depuis l'API Discogs")
  }
}

main()
  .catch((e) => {
    console.error('❌ Erreur lors du seeding :', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
