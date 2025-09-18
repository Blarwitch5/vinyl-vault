/**
 * Utilitaires pour les toggles avec animations fluides et discrètes
 * Résout les conflits hidden/flex avec la safelist Tailwind
 */

/**
 * Affiche un élément avec une animation discrète
 * @param {HTMLElement} element - L'élément à afficher
 * @param {string} displayType - Type d'affichage ('flex', 'block', 'grid', etc.)
 * @param {number} duration - Durée de l'animation en ms (défaut: 200)
 */
export function smoothShow(element, displayType = 'flex', duration = 200) {
  if (!element) return

  // Commencer avec opacity 0 et le bon display
  element.style.opacity = '0'
  element.classList.remove('hidden')
  element.classList.add(displayType)

  // Petite pause pour que le navigateur applique les changements
  setTimeout(() => {
    element.style.transition = `opacity ${duration}ms ease-in-out`
    element.style.opacity = '1'
  }, 10)
}

/**
 * Cache un élément avec une animation discrète
 * @param {HTMLElement} element - L'élément à cacher
 * @param {number} duration - Durée de l'animation en ms (défaut: 200)
 */
export function smoothHide(element, duration = 200) {
  if (!element) return

  element.style.transition = `opacity ${duration}ms ease-in-out`
  element.style.opacity = '0'

  // Attendre la fin de l'animation avant de cacher
  setTimeout(() => {
    element.classList.add('hidden')
    element.classList.remove(
      'flex',
      'block',
      'grid',
      'inline',
      'inline-block',
      'inline-flex'
    )
    element.style.transition = ''
    element.style.opacity = ''
  }, duration)
}

/**
 * Toggle un élément avec animation discrète
 * @param {HTMLElement} element - L'élément à toggle
 * @param {string} displayType - Type d'affichage quand visible (défaut: 'flex')
 * @param {number} duration - Durée de l'animation en ms (défaut: 200)
 * @param {boolean} force - Force l'état (true = afficher, false = cacher, null = toggle)
 * @returns {boolean} - État final (true = visible, false = caché)
 */
export function smoothToggle(
  element,
  displayType = 'flex',
  duration = 200,
  force = null
) {
  if (!element) return false

  const isHidden = element.classList.contains('hidden')
  let shouldShow

  if (force !== null) {
    shouldShow = force
  } else {
    shouldShow = isHidden
  }

  if (shouldShow) {
    smoothShow(element, displayType, duration)
    return true
  } else {
    smoothHide(element, duration)
    return false
  }
}

/**
 * Toggle entre deux éléments avec animation discrète
 * @param {HTMLElement} showElement - L'élément à afficher
 * @param {HTMLElement} hideElement - L'élément à cacher
 * @param {string} displayType - Type d'affichage pour l'élément visible (défaut: 'flex')
 * @param {number} duration - Durée de l'animation en ms (défaut: 200)
 */
export function smoothToggleBetween(
  showElement,
  hideElement,
  displayType = 'flex',
  duration = 200
) {
  // Démarrer les deux animations en parallèle pour une transition fluide
  if (showElement) {
    smoothShow(showElement, displayType, duration)
  }
  if (hideElement) {
    smoothHide(hideElement, duration)
  }
}

/**
 * Toggle de modal avec animation et gestion du scroll
 * @param {HTMLElement} modal - L'élément modal
 * @param {boolean} show - Afficher ou cacher
 * @param {number} duration - Durée de l'animation en ms (défaut: 250)
 */
export function smoothToggleModal(modal, show, duration = 250) {
  if (!modal) return

  if (show) {
    // Afficher la modal
    document.body.style.overflow = 'hidden'
    modal.style.opacity = '0'
    modal.classList.remove('hidden')
    modal.classList.add('flex')

    // Animation d'entrée avec un léger délai pour l'effet backdrop
    setTimeout(() => {
      modal.style.transition = `opacity ${duration}ms ease-out`
      modal.style.opacity = '1'
    }, 10)
  } else {
    // Cacher la modal
    modal.style.transition = `opacity ${duration}ms ease-in`
    modal.style.opacity = '0'

    setTimeout(() => {
      modal.classList.add('hidden')
      modal.classList.remove('flex')
      modal.style.transition = ''
      modal.style.opacity = ''
      document.body.style.overflow = ''
    }, duration)
  }
}

/**
 * Toggle de dropdown avec animation et fermeture automatique
 * @param {HTMLElement} dropdown - L'élément dropdown
 * @param {HTMLElement} trigger - L'élément déclencheur (optionnel)
 * @param {number} duration - Durée de l'animation en ms (défaut: 150)
 * @returns {boolean} - État final du dropdown
 */
export function smoothToggleDropdown(dropdown, trigger = null, duration = 150) {
  if (!dropdown) return false

  const isHidden = dropdown.classList.contains('hidden')

  if (isHidden) {
    // Afficher le dropdown
    smoothShow(dropdown, 'flex', duration)

    if (trigger) {
      // Fermer au clic extérieur avec un délai pour éviter la fermeture immédiate
      const closeHandler = (event) => {
        if (
          !dropdown.contains(event.target) &&
          !trigger.contains(event.target)
        ) {
          smoothHide(dropdown, duration)
          document.removeEventListener('click', closeHandler)
        }
      }

      setTimeout(() => {
        document.addEventListener('click', closeHandler)
      }, 50)
    }

    return true
  } else {
    // Cacher le dropdown
    smoothHide(dropdown, duration)
    return false
  }
}

/**
 * Toggle de menu mobile avec animation
 * @param {HTMLElement} menu - L'élément menu
 * @param {HTMLElement} overlay - L'élément overlay (optionnel)
 * @param {number} duration - Durée de l'animation en ms (défaut: 300)
 */
export function smoothToggleMobileMenu(menu, overlay = null, duration = 300) {
  if (!menu) return

  const isHidden = menu.classList.contains('hidden')

  if (isHidden) {
    // Afficher le menu
    document.body.style.overflow = 'hidden'
    smoothShow(menu, 'flex', duration)
    if (overlay) {
      smoothShow(overlay, 'block', duration)
    }
  } else {
    // Cacher le menu
    smoothHide(menu, duration)
    if (overlay) {
      smoothHide(overlay, duration)
    }

    setTimeout(() => {
      document.body.style.overflow = ''
    }, duration)
  }
}

/**
 * Toggle de vue grid/list avec animation des boutons
 * @param {HTMLElement} gridView - Vue grid
 * @param {HTMLElement} listView - Vue list
 * @param {HTMLElement} gridButton - Bouton grid
 * @param {HTMLElement} listButton - Bouton list
 * @param {boolean} showGrid - true pour afficher grid, false pour list
 * @param {number} duration - Durée de l'animation en ms (défaut: 200)
 */
export function smoothToggleGridView(
  gridView,
  listView,
  gridButton = null,
  listButton = null,
  showGrid = true,
  duration = 200
) {
  if (showGrid) {
    smoothToggleBetween(gridView, listView, 'grid', duration)
    if (gridButton && listButton) {
      smoothToggleButtonState(gridButton, listButton)
    }
  } else {
    smoothToggleBetween(listView, gridView, 'block', duration)
    if (gridButton && listButton) {
      smoothToggleButtonState(listButton, gridButton)
    }
  }
}

/**
 * Toggle d'état de bouton avec animation discrète
 * @param {HTMLElement} activeButton - Bouton à activer
 * @param {HTMLElement} inactiveButton - Bouton à désactiver
 * @param {number} duration - Durée de l'animation en ms (défaut: 150)
 */
export function smoothToggleButtonState(
  activeButton,
  inactiveButton,
  duration = 150
) {
  const transition = `all ${duration}ms ease-in-out`

  if (activeButton) {
    activeButton.style.transition = transition
    activeButton.classList.add('bg-white', 'dark:bg-neutral-800')
    activeButton.classList.remove('text-neutral-600', 'dark:text-neutral-400')
  }

  if (inactiveButton) {
    inactiveButton.style.transition = transition
    inactiveButton.classList.add('text-neutral-600', 'dark:text-neutral-400')
    inactiveButton.classList.remove('bg-white', 'dark:bg-neutral-800')
  }

  // Nettoyer les transitions après l'animation
  setTimeout(() => {
    if (activeButton) activeButton.style.transition = ''
    if (inactiveButton) inactiveButton.style.transition = ''
  }, duration)
}

/**
 * Initialise un élément avec l'état correct (évite le flash)
 * @param {HTMLElement} element - L'élément à initialiser
 * @param {boolean} visible - État initial de visibilité
 * @param {string} displayType - Type d'affichage si visible
 */
export function initializeElementState(element, visible, displayType = 'flex') {
  if (!element) return

  if (visible) {
    element.classList.remove('hidden')
    element.classList.add(displayType)
    element.style.opacity = '1'
  } else {
    element.classList.add('hidden')
    element.classList.remove(
      'flex',
      'block',
      'grid',
      'inline',
      'inline-block',
      'inline-flex'
    )
    element.style.opacity = '0'
  }
}
