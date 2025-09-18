/**
 * Exemples d'utilisation des fonctions de toggle pour différentes pages
 * Ces fonctions montrent comment utiliser toggle-visibility.js dans tout le projet
 */

import {
  toggleVisibility,
  showElement,
  hideElement,
  toggleBetweenElements,
  toggleButtonState,
  toggleModal,
  toggleMobileMenu,
  toggleDropdown,
  toggleGridView,
  toggleSectionState,
  toggleConditional,
  isVisible,
  toggleWithAnimation,
  initializeToggles,
  DISPLAY_TYPES,
} from './toggle-visibility.js'

// ============================================
// EXEMPLES POUR DASHBOARD
// ============================================

/**
 * Toggle de vue grid/list sur le dashboard
 */
export function initializeDashboardToggles() {
  const gridViewBtn = document.getElementById('dashboard-grid-view')
  const listViewBtn = document.getElementById('dashboard-list-view')
  const vinylGrid = document.getElementById('dashboard-vinyl-grid')
  const vinylList = document.getElementById('dashboard-vinyl-list')

  if (gridViewBtn && listViewBtn && vinylGrid && vinylList) {
    gridViewBtn.addEventListener('click', () => {
      toggleGridView(vinylGrid, vinylList, gridViewBtn, listViewBtn, true)
    })

    listViewBtn.addEventListener('click', () => {
      toggleGridView(vinylGrid, vinylList, gridViewBtn, listViewBtn, false)
    })
  }
}

// ============================================
// EXEMPLES POUR COLLECTION PAGE
// ============================================

/**
 * Toggle de vue grid/list sur la page collection
 */
export function initializeCollectionToggles() {
  const gridViewBtn = document.getElementById('collection-grid-view')
  const listViewBtn = document.getElementById('collection-list-view')
  const vinylGrid = document.getElementById('collection-vinyl-grid')
  const vinylList = document.getElementById('collection-vinyl-list')

  if (gridViewBtn && listViewBtn && vinylGrid && vinylList) {
    gridViewBtn.addEventListener('click', () => {
      toggleGridView(vinylGrid, vinylList, gridViewBtn, listViewBtn, true)
    })

    listViewBtn.addEventListener('click', () => {
      toggleGridView(vinylGrid, vinylList, gridViewBtn, listViewBtn, false)
    })
  }
}

// ============================================
// EXEMPLES POUR MODALES
// ============================================

/**
 * Toggle de modal de création de collection
 */
export function initializeCreateCollectionModal() {
  const modal = document.getElementById('create-collection-modal')
  const openBtn = document.getElementById('open-create-collection')
  const closeBtn = document.getElementById('close-create-collection')

  if (openBtn && modal) {
    openBtn.addEventListener('click', () => {
      toggleModal(modal, true)
    })
  }

  if (closeBtn && modal) {
    closeBtn.addEventListener('click', () => {
      toggleModal(modal, false)
    })
  }
}

/**
 * Toggle de modal de suppression de vinyl
 */
export function initializeDeleteVinylModal() {
  const modal = document.getElementById('delete-vinyl-modal')
  const closeBtn = document.getElementById('close-delete-vinyl')
  const cancelBtn = document.getElementById('cancel-delete-vinyl')

  if (closeBtn && modal) {
    closeBtn.addEventListener('click', () => {
      toggleModal(modal, false)
    })
  }

  if (cancelBtn && modal) {
    cancelBtn.addEventListener('click', () => {
      toggleModal(modal, false)
    })
  }
}

/**
 * Fonction globale pour ouvrir la modal de suppression
 */
export function openDeleteVinylModal(vinylData) {
  const modal = document.getElementById('delete-vinyl-modal')
  if (modal) {
    // Remplir les données du vinyl dans la modal
    const vinylTitle = modal.querySelector('[data-vinyl-title]')
    const vinylArtist = modal.querySelector('[data-vinyl-artist]')

    if (vinylTitle) vinylTitle.textContent = vinylData.title || 'Vinyl'
    if (vinylArtist) vinylArtist.textContent = vinylData.artist || 'Artiste'

    toggleModal(modal, true)
  }
}

// ============================================
// EXEMPLES POUR FORMULAIRES
// ============================================

/**
 * Toggle de sections de formulaire
 */
export function initializeFormToggles() {
  const loadingSection = document.getElementById('form-loading')
  const contentSection = document.getElementById('form-content')
  const errorSection = document.getElementById('form-error')

  // Exemple de changement d'état selon l'action
  return {
    showLoading: () => toggleSectionState(loadingSection, 'loading'),
    showContent: () => toggleSectionState(contentSection, 'content'),
    showError: () => toggleSectionState(errorSection, 'error'),
    hideAll: () => {
      toggleSectionState(loadingSection, 'hidden')
      toggleSectionState(contentSection, 'hidden')
      toggleSectionState(errorSection, 'hidden')
    },
  }
}

/**
 * Toggle de validation de mot de passe
 */
export function initializePasswordToggle() {
  const passwordStrength = document.getElementById('password-strength')
  const passwordInput = document.getElementById('password-input')

  if (passwordInput && passwordStrength) {
    passwordInput.addEventListener('input', (e) => {
      const password = e.target.value
      toggleConditional(
        passwordStrength,
        password.length > 0,
        DISPLAY_TYPES.BLOCK
      )
    })
  }
}

// ============================================
// EXEMPLES POUR ANIMATIONS
// ============================================

/**
 * Toggle avec animation pour les cartes
 */
export function initializeCardAnimations() {
  const cards = document.querySelectorAll('.vinyl-card')

  cards.forEach((card) => {
    card.addEventListener('mouseenter', () => {
      toggleWithAnimation(card, DISPLAY_TYPES.BLOCK, true)
    })

    card.addEventListener('mouseleave', () => {
      toggleWithAnimation(card, DISPLAY_TYPES.BLOCK, false)
    })
  })
}

// ============================================
// EXEMPLES POUR RESPONSIVE
// ============================================

/**
 * Toggle conditionnel basé sur la taille d'écran
 */
export function initializeResponsiveToggles() {
  const mobileElements = document.querySelectorAll('[data-mobile-only]')
  const desktopElements = document.querySelectorAll('[data-desktop-only]')

  const checkScreenSize = () => {
    const isMobile = window.innerWidth < 768

    mobileElements.forEach((el) => {
      toggleConditional(el, isMobile, DISPLAY_TYPES.FLEX)
    })

    desktopElements.forEach((el) => {
      toggleConditional(el, !isMobile, DISPLAY_TYPES.FLEX)
    })
  }

  window.addEventListener('resize', checkScreenSize)
  checkScreenSize() // Vérifier au chargement
}

// ============================================
// FONCTION D'INITIALISATION GLOBALE
// ============================================

/**
 * Initialise tous les toggles d'une page selon son contexte
 * @param {string} pageType - Type de page ('dashboard', 'collection', 'modal', etc.)
 */
export function initializePageToggles(pageType) {
  switch (pageType) {
    case 'dashboard':
      initializeDashboardToggles()
      break
    case 'collection':
      initializeCollectionToggles()
      break
    case 'modal':
      initializeCreateCollectionModal()
      initializeDeleteVinylModal()
      break
    case 'form':
      initializeFormToggles()
      initializePasswordToggle()
      break
    case 'responsive':
      initializeResponsiveToggles()
      break
    case 'animation':
      initializeCardAnimations()
      break
    case 'all':
      initializeDashboardToggles()
      initializeCollectionToggles()
      initializeCreateCollectionModal()
      initializeDeleteVinylModal()
      initializeFormToggles()
      initializePasswordToggle()
      initializeResponsiveToggles()
      initializeCardAnimations()
      break
  }
}

/**
 * Initialisation automatique basée sur la page actuelle
 */
export function autoInitializeToggles() {
  const currentPath = window.location.pathname

  if (currentPath.includes('/dashboard')) {
    initializePageToggles('dashboard')
  } else if (currentPath.includes('/collection')) {
    initializePageToggles('collection')
  } else if (
    currentPath.includes('/register') ||
    currentPath.includes('/login')
  ) {
    initializePageToggles('form')
  }

  // Toggles communs à toutes les pages
  initializeResponsiveToggles()
}

// Export des fonctions pour utilisation globale
window.openDeleteVinylModal = openDeleteVinylModal
window.initializePageToggles = initializePageToggles
window.autoInitializeToggles = autoInitializeToggles
