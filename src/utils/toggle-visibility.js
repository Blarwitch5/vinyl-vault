/**
 * Solution universelle pour gérer les toggles de visibilité avec Tailwind CSS
 * Fonctionne avec toutes les classes de la safelist : hidden, flex, block, inline, inline-block, inline-flex, grid
 */

/**
 * Types d'affichage supportés (correspondent aux classes de la safelist)
 */
const DISPLAY_TYPES = {
  FLEX: 'flex',
  BLOCK: 'block',
  INLINE: 'inline',
  INLINE_BLOCK: 'inline-block',
  INLINE_FLEX: 'inline-flex',
  GRID: 'grid',
  HIDDEN: 'hidden',
}

/**
 * Classes de display à supprimer lors du toggle
 */
const DISPLAY_CLASSES = Object.values(DISPLAY_TYPES).filter(
  (type) => type !== DISPLAY_TYPES.HIDDEN
)

/**
 * Toggle universel de visibilité
 * @param {HTMLElement|null} element - L'élément à toggle
 * @param {string} displayType - Type d'affichage ('flex', 'block', 'grid', etc.)
 * @param {boolean|null} force - Force l'état (true = afficher, false = cacher, null = toggle)
 * @returns {boolean} - État final (true = visible, false = caché)
 */
export function toggleVisibility(
  element,
  displayType = DISPLAY_TYPES.FLEX,
  force = null
) {
  if (!element) {
    console.warn('toggleVisibility: Élément non trouvé')
    return false
  }

  const isHidden = element.classList.contains(DISPLAY_TYPES.HIDDEN)
  let shouldShow

  if (force !== null) {
    shouldShow = force
  } else {
    shouldShow = isHidden
  }

  if (shouldShow) {
    // Afficher l'élément
    element.classList.remove(DISPLAY_TYPES.HIDDEN)
    element.classList.add(displayType)
    return true
  } else {
    // Cacher l'élément
    element.classList.add(DISPLAY_TYPES.HIDDEN)
    // Supprimer toutes les classes display pour éviter les conflits
    DISPLAY_CLASSES.forEach((cls) => element.classList.remove(cls))
    return false
  }
}

/**
 * Affiche un élément avec le type d'affichage spécifié
 * @param {HTMLElement|null} element - L'élément à afficher
 * @param {string} displayType - Type d'affichage (défaut: 'flex')
 */
export function showElement(element, displayType = DISPLAY_TYPES.FLEX) {
  return toggleVisibility(element, displayType, true)
}

/**
 * Cache un élément
 * @param {HTMLElement|null} element - L'élément à cacher
 */
export function hideElement(element) {
  return toggleVisibility(element, DISPLAY_TYPES.HIDDEN, false)
}

/**
 * Toggle entre deux éléments (affiche l'un, cache l'autre)
 * @param {HTMLElement|null} showElement - L'élément à afficher
 * @param {HTMLElement|null} hideElement - L'élément à cacher
 * @param {string} displayType - Type d'affichage pour l'élément visible
 */
export function toggleBetweenElements(
  showElement,
  hideElement,
  displayType = DISPLAY_TYPES.FLEX
) {
  showElement(showElement, displayType)
  hideElement(hideElement)
}

/**
 * Toggle d'état de bouton (actif/inactif)
 * @param {HTMLElement|null} activeButton - Bouton à activer
 * @param {HTMLElement|null} inactiveButton - Bouton à désactiver
 */
export function toggleButtonState(activeButton, inactiveButton) {
  if (activeButton) {
    activeButton.classList.add('bg-white', 'dark:bg-neutral-800')
    activeButton.classList.remove('text-neutral-600', 'dark:text-neutral-400')
  }

  if (inactiveButton) {
    inactiveButton.classList.add('text-neutral-600', 'dark:text-neutral-400')
    inactiveButton.classList.remove('bg-white', 'dark:bg-neutral-800')
  }
}

/**
 * Toggle de modal avec gestion du scroll du body
 * @param {HTMLElement|null} modal - Élément modal
 * @param {boolean} show - Afficher ou cacher
 */
export function toggleModal(modal, show) {
  if (!modal) return false

  const result = toggleVisibility(modal, DISPLAY_TYPES.FLEX, show)

  if (result) {
    // Modal ouvert - bloquer le scroll
    document.body.style.overflow = 'hidden'
  } else {
    // Modal fermé - restaurer le scroll
    document.body.style.overflow = ''
  }

  return result
}

/**
 * Toggle de menu mobile avec fermeture automatique
 * @param {HTMLElement|null} menu - Élément menu
 * @param {HTMLElement|null} overlay - Élément overlay (optionnel)
 */
export function toggleMobileMenu(menu, overlay = null) {
  if (!menu) return false

  const isVisible = !menu.classList.contains(DISPLAY_TYPES.HIDDEN)
  const result = toggleVisibility(menu, DISPLAY_TYPES.FLEX, !isVisible)

  if (overlay) {
    toggleVisibility(overlay, DISPLAY_TYPES.BLOCK, result)
  }

  // Gérer le scroll du body
  document.body.style.overflow = result ? 'hidden' : ''

  return result
}

/**
 * Toggle de dropdown avec fermeture au clic extérieur
 * @param {HTMLElement|null} dropdown - Élément dropdown
 * @param {HTMLElement|null} trigger - Élément déclencheur (optionnel)
 */
export function toggleDropdown(dropdown, trigger = null) {
  if (!dropdown) return false

  const result = toggleVisibility(dropdown, DISPLAY_TYPES.FLEX)

  if (result && trigger) {
    // Fermer au clic extérieur
    const closeHandler = (event) => {
      if (!dropdown.contains(event.target) && !trigger.contains(event.target)) {
        hideElement(dropdown)
        document.removeEventListener('click', closeHandler)
      }
    }

    // Attendre que l'événement de clic actuel se termine
    setTimeout(() => {
      document.addEventListener('click', closeHandler)
    }, 0)
  }

  return result
}

/**
 * Toggle de vue grid/list
 * @param {HTMLElement|null} gridView - Vue grid
 * @param {HTMLElement|null} listView - Vue list
 * @param {HTMLElement|null} gridButton - Bouton grid
 * @param {HTMLElement|null} listButton - Bouton list
 * @param {boolean} showGrid - true pour afficher grid, false pour list
 */
export function toggleGridView(
  gridView,
  listView,
  gridButton = null,
  listButton = null,
  showGrid = true
) {
  if (showGrid) {
    showElement(gridView, DISPLAY_TYPES.GRID)
    hideElement(listView)
    if (gridButton && listButton) {
      toggleButtonState(gridButton, listButton)
    }
  } else {
    hideElement(gridView)
    showElement(listView, DISPLAY_TYPES.BLOCK)
    if (gridButton && listButton) {
      toggleButtonState(listButton, gridButton)
    }
  }
}

/**
 * Toggle de section avec états multiples
 * @param {HTMLElement|null} element - Élément section
 * @param {string} state - État ('hidden', 'loading', 'content', 'error')
 * @param {string} displayType - Type d'affichage pour les états visibles
 */
export function toggleSectionState(
  element,
  state,
  displayType = DISPLAY_TYPES.FLEX
) {
  if (!element) return false

  // Supprimer toutes les classes d'état précédentes
  element.classList.remove(
    'loading',
    'content',
    'error',
    ...DISPLAY_CLASSES,
    DISPLAY_TYPES.HIDDEN
  )

  switch (state) {
    case 'loading':
      element.classList.add(displayType, 'loading')
      return true
    case 'content':
      element.classList.add(displayType, 'content')
      return true
    case 'error':
      element.classList.add(DISPLAY_TYPES.BLOCK, 'error')
      return true
    case 'hidden':
    default:
      element.classList.add(DISPLAY_TYPES.HIDDEN)
      return false
  }
}

/**
 * Toggle conditionnel basé sur une condition
 * @param {HTMLElement|null} element - Élément à toggle
 * @param {boolean} condition - Condition à vérifier
 * @param {string} displayType - Type d'affichage si condition vraie
 */
export function toggleConditional(
  element,
  condition,
  displayType = DISPLAY_TYPES.FLEX
) {
  return toggleVisibility(element, displayType, condition)
}

/**
 * Vérifie si un élément est visible
 * @param {HTMLElement|null} element - Élément à vérifier
 * @returns {boolean} - true si visible
 */
export function isVisible(element) {
  return element ? !element.classList.contains(DISPLAY_TYPES.HIDDEN) : false
}

/**
 * Toggle avec animation CSS (nécessite des classes CSS d'animation)
 * @param {HTMLElement|null} element - Élément à animer
 * @param {string} displayType - Type d'affichage
 * @param {boolean} show - Afficher ou cacher
 * @param {number} duration - Durée de l'animation en ms (défaut: 300)
 */
export function toggleWithAnimation(
  element,
  displayType = DISPLAY_TYPES.FLEX,
  show = null,
  duration = 300
) {
  if (!element) return false

  const isCurrentlyVisible = isVisible(element)
  const shouldShow = show !== null ? show : !isCurrentlyVisible

  if (shouldShow && !isCurrentlyVisible) {
    // Afficher avec animation
    element.classList.add('opacity-0', 'scale-95')
    showElement(element, displayType)

    // Trigger animation
    requestAnimationFrame(() => {
      element.classList.remove('opacity-0', 'scale-95')
      element.classList.add('opacity-100', 'scale-100')
    })
  } else if (!shouldShow && isCurrentlyVisible) {
    // Cacher avec animation
    element.classList.remove('opacity-100', 'scale-100')
    element.classList.add('opacity-0', 'scale-95')

    setTimeout(() => {
      hideElement(element)
      element.classList.remove('opacity-0', 'scale-95')
    }, duration)
  }

  return shouldShow
}

/**
 * Initialise tous les toggles d'une page
 * @param {Object} config - Configuration des toggles
 */
export function initializeToggles(config = {}) {
  // Toggle de menu mobile
  if (config.mobileMenu) {
    const { menu, trigger, overlay } = config.mobileMenu
    const menuElement =
      typeof menu === 'string' ? document.getElementById(menu) : menu
    const triggerElement =
      typeof trigger === 'string' ? document.getElementById(trigger) : trigger
    const overlayElement =
      typeof overlay === 'string' ? document.getElementById(overlay) : overlay

    if (triggerElement && menuElement) {
      triggerElement.addEventListener('click', () => {
        toggleMobileMenu(menuElement, overlayElement)
      })
    }
  }

  // Toggle de dropdown
  if (config.dropdown) {
    const { dropdown, trigger } = config.dropdown
    const dropdownElement =
      typeof dropdown === 'string'
        ? document.getElementById(dropdown)
        : dropdown
    const triggerElement =
      typeof trigger === 'string' ? document.getElementById(trigger) : trigger

    if (triggerElement && dropdownElement) {
      triggerElement.addEventListener('click', (e) => {
        e.stopPropagation()
        toggleDropdown(dropdownElement, triggerElement)
      })
    }
  }

  // Toggle de vue grid/list
  if (config.gridView) {
    const { gridView, listView, gridButton, listButton } = config.gridView
    const gridElement =
      typeof gridView === 'string'
        ? document.getElementById(gridView)
        : gridView
    const listElement =
      typeof listView === 'string'
        ? document.getElementById(listView)
        : listView
    const gridBtnElement =
      typeof gridButton === 'string'
        ? document.getElementById(gridButton)
        : gridButton
    const listBtnElement =
      typeof listButton === 'string'
        ? document.getElementById(listButton)
        : listButton

    if (gridBtnElement && listBtnElement && gridElement && listElement) {
      gridBtnElement.addEventListener('click', () => {
        toggleGridView(
          gridElement,
          listElement,
          gridBtnElement,
          listBtnElement,
          true
        )
      })

      listBtnElement.addEventListener('click', () => {
        toggleGridView(
          gridElement,
          listElement,
          gridBtnElement,
          listBtnElement,
          false
        )
      })
    }
  }
}

// Export des constantes pour utilisation externe
export { DISPLAY_TYPES }
