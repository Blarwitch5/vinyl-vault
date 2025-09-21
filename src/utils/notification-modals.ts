// Utilitaires pour les modales de notification

export type NotificationType = 'success' | 'error' | 'warning' | 'info'

export type NotificationConfig = {
  title: string
  message: string
  type: NotificationType
  actions?: Array<{
    text: string
    href?: string
    onClick?: () => void
    primary?: boolean
  }>
}

/**
 * Affiche une modal de notification
 */
export function showNotificationModal(config: NotificationConfig): void {
  const modalId = `notification-${Date.now()}`

  // Configuration des icônes et couleurs selon le type
  const typeConfig = {
    success: {
      icon: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z',
      iconColor: 'text-green-500',
      bgColor: 'bg-green-50 dark:bg-green-900/20',
    },
    error: {
      icon: 'M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z',
      iconColor: 'text-red-500',
      bgColor: 'bg-red-50 dark:bg-red-900/20',
    },
    warning: {
      icon: 'M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z',
      iconColor: 'text-amber-500',
      bgColor: 'bg-amber-50 dark:bg-amber-900/20',
    },
    info: {
      icon: 'M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
      iconColor: 'text-blue-500',
      bgColor: 'bg-blue-50 dark:bg-blue-900/20',
    },
  }

  const typeStyle = typeConfig[config.type]

  // Créer la modal
  const modal = document.createElement('div')
  modal.id = modalId
  modal.className =
    'fixed inset-0 bg-black/70 backdrop-blur-sm z-[9999] flex items-center justify-center p-4'

  const actionsHtml = config.actions
    ? config.actions
        .map(
          (action) => `
          <${action.href ? 'a' : 'button'} 
            ${action.href ? `href="${action.href}"` : ''} 
            class="flex-1 py-3 px-4 rounded-lg transition-colors text-center font-medium ${
              action.primary
                ? 'bg-gradient-emerald text-white hover:bg-gradient-emerald/80'
                : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-700'
            }"
            ${action.onClick ? `onclick="${action.onClick.toString()}"` : ''}
          >
            ${action.text}
          </${action.href ? 'a' : 'button'}>
        `
        )
        .join('')
    : `
      <button onclick="closeNotificationModal('${modalId}')" class="w-full bg-gradient-emerald text-white py-3 px-4 rounded-lg hover:bg-gradient-emerald/80 transition-colors font-medium">
        Fermer
      </button>
    `

  modal.innerHTML = `
    <div class="glass-card dark:glass-dark rounded-lg max-w-md w-full mx-4" onclick="event.stopPropagation()">
      <div class="p-8 text-center">
        <div class="mb-6">
          <div class="w-20 h-20 ${typeStyle.bgColor} rounded-full flex items-center justify-center mx-auto mb-4">
            <svg class="w-10 h-10 ${typeStyle.iconColor}" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="${typeStyle.icon}"></path>
            </svg>
          </div>
        </div>
        <h3 class="text-2xl font-semibold text-neutral-900 dark:text-neutral-50 mb-2">
          ${config.title}
        </h3>
        <p class="text-neutral-600 dark:text-neutral-400 mb-6">
          ${config.message}
        </p>
        <div class="flex space-x-3">
          ${actionsHtml}
        </div>
      </div>
    </div>
  `

  document.body.appendChild(modal)

  // Afficher avec animation
  document.body.style.overflow = 'hidden'
  modal.style.opacity = '0'
  setTimeout(() => {
    modal.style.transition = 'opacity 250ms ease-out'
    modal.style.opacity = '1'
  }, 10)

  // Fermeture au clic extérieur
  modal.addEventListener('click', (e) => {
    if (e.target === modal) {
      closeNotificationModal(modalId)
    }
  })

  // Fermeture par Escape
  const escapeHandler = (e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      closeNotificationModal(modalId)
      document.removeEventListener('keydown', escapeHandler)
    }
  }
  document.addEventListener('keydown', escapeHandler)
}

/**
 * Ferme une modal de notification
 */
export function closeNotificationModal(modalId: string): void {
  const modal = document.getElementById(modalId)
  if (modal) {
    modal.style.transition = 'opacity 200ms ease-in'
    modal.style.opacity = '0'

    setTimeout(() => {
      modal.remove()
      document.body.style.overflow = ''
    }, 200)
  }
}

/**
 * Affiche une modal de succès
 */
export function showSuccessModal(
  title: string,
  message: string,
  actions?: NotificationConfig['actions']
): void {
  showNotificationModal({
    title,
    message,
    type: 'success',
    actions,
  })
}

/**
 * Affiche une modal d'erreur
 */
export function showErrorModal(
  title: string,
  message: string,
  actions?: NotificationConfig['actions']
): void {
  showNotificationModal({
    title,
    message,
    type: 'error',
    actions,
  })
}

/**
 * Affiche une modal de doublon avec actions spécifiques
 */
export function showDuplicateModal(vinylData: any, existingVinyl: any): void {
  showNotificationModal({
    title: 'Vinyle déjà présent',
    message: `Ce vinyle est déjà dans votre collection "${existingVinyl.collection.name}".`,
    type: 'warning',
    actions: [
      {
        text: 'Voir ma collection',
        href: `/collection/${existingVinyl.collection.id}`,
        primary: true,
      },
      {
        text: 'Continuer la recherche',
        onClick: () => {
          // Rester sur la page actuelle
        },
      },
    ],
  })
}

// Exposer les fonctions globalement
;(window as any).closeNotificationModal = closeNotificationModal
;(window as any).showSuccessModal = showSuccessModal
;(window as any).showErrorModal = showErrorModal
;(window as any).showDuplicateModal = showDuplicateModal
