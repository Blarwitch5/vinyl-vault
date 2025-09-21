import { registerSW } from 'virtual:pwa-register'

const updateSW = registerSW({
  onNeedRefresh() {
    // Afficher la notification de mise à jour
    const updateNotification = document.getElementById(
      'pwa-update-notification'
    )
    if (updateNotification) {
      updateNotification.classList.remove('hidden')
    }

    // Optionnel : demander à l'utilisateur s'il veut recharger
    if (
      confirm(
        'Une nouvelle version est disponible. Voulez-vous recharger la page ?'
      )
    ) {
      updateSW(true)
    }
  },
  onOfflineReady() {
    console.log("L'application est prête à fonctionner hors-ligne")
  },
  onRegistered(r) {
    console.log('Service Worker enregistré:', r)
  },
  onRegisterError(error) {
    console.log("Erreur lors de l'enregistrement du Service Worker:", error)
  },
})

// Écouter les événements de mise à jour personnalisés
document.addEventListener('pwa-update-requested', (event: CustomEvent) => {
  if (event.detail?.reload) {
    updateSW(true)
  }
})
