/**
 * Fonctions d'animation fluides pour les éléments DOM
 * Utilisées pour les transitions smooth dans l'interface utilisateur
 */

/**
 * Masque un élément avec une animation fluide
 * @param element - L'élément DOM à masquer
 * @param duration - Durée de l'animation en millisecondes
 * @param display - Type d'affichage à utiliser (par défaut: 'none')
 */
export function smoothHide(
  element: HTMLElement,
  duration: number = 200,
  display: string = 'none'
): void {
  if (!element) return

  // Définir la transition
  element.style.transition = `opacity ${duration}ms ease-out`
  element.style.opacity = '0'

  // Masquer l'élément après l'animation
  setTimeout(() => {
    element.style.display = display
    element.style.transition = ''

    // Ajouter la classe hidden de Tailwind pour une meilleure compatibilité
    if (display === 'none') {
      element.classList.add('hidden')
    }
  }, duration)
}

/**
 * Affiche un élément avec une animation fluide
 * @param element - L'élément DOM à afficher
 * @param duration - Durée de l'animation en millisecondes
 * @param display - Type d'affichage à utiliser (par défaut: 'block')
 */
export function smoothShow(
  element: HTMLElement,
  duration: number = 200,
  display: string = 'block'
): void {
  if (!element) return

  // Supprimer la classe hidden de Tailwind
  element.classList.remove('hidden')

  // Afficher l'élément immédiatement
  element.style.display = display
  element.style.opacity = '0'

  // Forcer un reflow pour que l'animation fonctionne
  element.offsetHeight

  // Animer l'opacité
  element.style.transition = `opacity ${duration}ms ease-out`
  element.style.opacity = '1'

  // Nettoyer après l'animation
  setTimeout(() => {
    element.style.transition = ''
  }, duration)
}

/**
 * Bascule entre deux éléments avec une animation fluide
 * @param elementToHide - L'élément à masquer
 * @param elementToShow - L'élément à afficher
 * @param display - Type d'affichage à utiliser
 * @param duration - Durée de l'animation en millisecondes
 */
export function smoothToggleBetween(
  elementToHide: HTMLElement,
  elementToShow: HTMLElement,
  display: string = 'block',
  duration: number = 200
): void {
  if (!elementToHide || !elementToShow) return

  // Masquer le premier élément
  smoothHide(elementToHide, duration, 'none')

  // Afficher le second élément après un petit délai
  setTimeout(() => {
    smoothShow(elementToShow, duration, display)
  }, duration / 2)
}

/**
 * Bascule un dropdown avec une animation fluide
 * @param dropdown - L'élément dropdown à basculer
 * @param trigger - L'élément déclencheur (pour la position)
 * @param duration - Durée de l'animation en millisecondes
 */
export function smoothToggleDropdown(
  dropdown: HTMLElement,
  trigger: HTMLElement,
  duration: number = 150
): void {
  if (!dropdown) {
    console.log('smoothToggleDropdown: dropdown manquant')
    return
  }

  const isVisible =
    dropdown.style.display !== 'none' &&
    !dropdown.classList.contains('hidden') &&
    dropdown.style.opacity !== '0' &&
    getComputedStyle(dropdown).display !== 'none'

  console.log('smoothToggleDropdown: État de visibilité:', {
    isVisible,
    styleDisplay: dropdown.style.display,
    hasHiddenClass: dropdown.classList.contains('hidden'),
    styleOpacity: dropdown.style.opacity,
    computedDisplay: getComputedStyle(dropdown).display,
  })

  if (isVisible) {
    console.log('smoothToggleDropdown: Masquage du dropdown')
    // Masquer le dropdown
    smoothHide(dropdown, duration, 'none')
  } else {
    console.log('smoothToggleDropdown: Affichage du dropdown')
    // Afficher le dropdown avec flex (pour les dropdowns qui utilisent flex-col)
    smoothShow(dropdown, duration, 'flex')
  }
}

/**
 * Bascule un élément avec une animation fluide
 * @param element - L'élément DOM à basculer
 * @param duration - Durée de l'animation en millisecondes
 * @param display - Type d'affichage à utiliser
 */
export function smoothToggle(
  element: HTMLElement,
  duration: number = 200,
  display: string = 'block'
): void {
  if (!element) return

  const isVisible =
    element.style.display !== 'none' &&
    !element.classList.contains('hidden') &&
    element.style.opacity !== '0'

  if (isVisible) {
    smoothHide(element, duration, 'none')
  } else {
    smoothShow(element, duration, display)
  }
}

/**
 * Animation de glissement vers le bas
 * @param element - L'élément DOM à animer
 * @param duration - Durée de l'animation en millisecondes
 */
export function slideDown(element: HTMLElement, duration: number = 300): void {
  if (!element) return

  // Préparer l'élément
  element.style.overflow = 'hidden'
  element.style.height = '0'
  element.style.display = 'block'
  element.style.transition = `height ${duration}ms ease-out`

  // Forcer un reflow
  element.offsetHeight

  // Animer vers la hauteur naturelle
  element.style.height = element.scrollHeight + 'px'

  // Nettoyer après l'animation
  setTimeout(() => {
    element.style.height = ''
    element.style.transition = ''
    element.style.overflow = ''
  }, duration)
}

/**
 * Animation de glissement vers le haut
 * @param element - L'élément DOM à animer
 * @param duration - Durée de l'animation en millisecondes
 */
export function slideUp(element: HTMLElement, duration: number = 300): void {
  if (!element) return

  // Préparer l'élément
  element.style.overflow = 'hidden'
  element.style.height = element.scrollHeight + 'px'
  element.style.transition = `height ${duration}ms ease-out`

  // Forcer un reflow
  element.offsetHeight

  // Animer vers 0
  element.style.height = '0'

  // Masquer après l'animation
  setTimeout(() => {
    element.style.display = 'none'
    element.style.height = ''
    element.style.transition = ''
    element.style.overflow = ''
  }, duration)
}

/**
 * Animation de fade in avec scale
 * @param element - L'élément DOM à animer
 * @param duration - Durée de l'animation en millisecondes
 */
export function fadeInScale(
  element: HTMLElement,
  duration: number = 200
): void {
  if (!element) return

  // État initial
  element.style.display = 'block'
  element.style.opacity = '0'
  element.style.transform = 'scale(0.95)'
  element.style.transition = `opacity ${duration}ms ease-out, transform ${duration}ms ease-out`

  // Forcer un reflow
  element.offsetHeight

  // État final
  element.style.opacity = '1'
  element.style.transform = 'scale(1)'

  // Nettoyer après l'animation
  setTimeout(() => {
    element.style.transition = ''
    element.style.transform = ''
  }, duration)
}

/**
 * Animation de fade out avec scale
 * @param element - L'élément DOM à animer
 * @param duration - Durée de l'animation en millisecondes
 */
export function fadeOutScale(
  element: HTMLElement,
  duration: number = 200
): void {
  if (!element) return

  // État initial
  element.style.transition = `opacity ${duration}ms ease-out, transform ${duration}ms ease-out`
  element.style.opacity = '1'
  element.style.transform = 'scale(1)'

  // Forcer un reflow
  element.offsetHeight

  // État final
  element.style.opacity = '0'
  element.style.transform = 'scale(0.95)'

  // Masquer après l'animation
  setTimeout(() => {
    element.style.display = 'none'
    element.style.transition = ''
    element.style.transform = ''
  }, duration)
}
