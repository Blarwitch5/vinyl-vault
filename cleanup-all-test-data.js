import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function cleanupAllTestData() {
  try {
    console.log('🧹 Nettoyage complet de toutes les données de test...')

    // Supprimer l'utilisateur de test s'il existe
    const testUser = await prisma.user.findUnique({
      where: { email: 'demo@vinylvault.com' },
    })

    if (testUser) {
      console.log(
        `👤 Utilisateur de test trouvé: ${testUser.name} (${testUser.email})`
      )

      // Supprimer l'utilisateur (cascade supprimera collections et vinyles)
      await prisma.user.delete({
        where: { id: testUser.id },
      })

      console.log('✅ Utilisateur de test supprimé avec succès')
    } else {
      console.log('ℹ️ Aucun utilisateur de test trouvé')
    }

    // Supprimer aussi l'utilisateur par défaut s'il existe
    const defaultUser = await prisma.user.findUnique({
      where: { email: 'default@vinylvault.com' },
    })

    if (defaultUser) {
      console.log(
        `👤 Utilisateur par défaut trouvé: ${defaultUser.name} (${defaultUser.email})`
      )

      await prisma.user.delete({
        where: { id: defaultUser.id },
      })

      console.log('✅ Utilisateur par défaut supprimé avec succès')
    } else {
      console.log('ℹ️ Aucun utilisateur par défaut trouvé')
    }

    // Lister les utilisateurs restants
    const remainingUsers = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
    })

    console.log(`\n👥 Utilisateurs restants: ${remainingUsers.length}`)
    remainingUsers.forEach((user, index) => {
      console.log(`${index + 1}. ${user.name || 'Sans nom'} (${user.email})`)
    })
  } catch (error) {
    console.error('❌ Erreur lors du nettoyage:', error)
  } finally {
    await prisma.$disconnect()
  }
}

cleanupAllTestData()
