import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function checkUsers() {
  try {
    console.log('🔍 Vérification des utilisateurs dans la base de données...')

    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
    })

    console.log(`👥 Nombre d'utilisateurs trouvés: ${users.length}`)

    if (users.length > 0) {
      console.log('\n📋 Détails des utilisateurs:')
      users.forEach((user, index) => {
        console.log(`${index + 1}. ${user.name || 'Sans nom'} (${user.email})`)
        console.log(`   ID: ${user.id}`)
        console.log(`   Créé le: ${user.createdAt.toLocaleDateString()}`)
      })
    } else {
      console.log('⚠️ Aucun utilisateur trouvé dans la base de données')
    }
  } catch (error) {
    console.error('❌ Erreur lors de la vérification:', error)
  } finally {
    await prisma.$disconnect()
  }
}

checkUsers()
