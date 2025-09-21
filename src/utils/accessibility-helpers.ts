/**
 * Utilitaires pour l'accessibilité
 */

// Éléments focusables
const FOCUSABLE_SELECTORS = [
  'a[href]',
  'button:not([disabled])',
  'input:not([disabled]):not([type="hidden"])',
  'textarea:not([disabled])',
  'select:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
  '[contenteditable="true"]',
  'details > summary',
  'audio[controls]',
  'video[controls]',
].join(', ')

/**
 * Obtenir tous les éléments focusables dans un conteneur
 */
export function getFocusableElements(container: Element): HTMLElement[] {
  return Array.from(container.querySelectorAll(FOCUSABLE_SELECTORS)).filter(
    (element) => {
      return (
        element instanceof HTMLElement &&
        !element.hasAttribute('disabled') &&
        !element.getAttribute('aria-hidden') &&
        element.offsetWidth > 0 &&
        element.offsetHeight > 0
      )
    }
  ) as HTMLElement[]
}

/**
 * Trap du focus dans une modale
 */
export class FocusTrap {
  private container: HTMLElement
  private focusableElements: HTMLElement[]
  private firstFocusable: HTMLElement | null = null
  private lastFocusable: HTMLElement | null = null
  private previouslyFocused: HTMLElement | null = null
  private isActive = false

  constructor(container: HTMLElement) {
    this.container = container
    this.focusableElements = []
    this.updateFocusableElements()
  }

  private updateFocusableElements() {
    this.focusableElements = getFocusableElements(this.container)
    this.firstFocusable = this.focusableElements[0] || null
    this.lastFocusable =
      this.focusableElements[this.focusableElements.length - 1] || null
  }

  private handleKeyDown = (event: KeyboardEvent) => {
    if (!this.isActive) return

    if (event.key === 'Tab') {
      if (this.focusableElements.length === 0) {
        event.preventDefault()
        return
      }

      if (event.shiftKey) {
        // Tab + Shift : navigation vers l'arrière
        if (document.activeElement === this.firstFocusable) {
          event.preventDefault()
          this.lastFocusable?.focus()
        }
      } else {
        // Tab : navigation vers l'avant
        if (document.activeElement === this.lastFocusable) {
          event.preventDefault()
          this.firstFocusable?.focus()
        }
      }
    }
  }

  activate() {
    if (this.isActive) return

    // Sauvegarder l'élément actuellement focusé
    this.previouslyFocused = document.activeElement as HTMLElement

    // Mettre à jour les éléments focusables
    this.updateFocusableElements()

    // Activer le trap
    this.isActive = true
    document.addEventListener('keydown', this.handleKeyDown)

    // Focuser le premier élément focusable
    if (this.firstFocusable) {
      this.firstFocusable.focus()
    }
  }

  deactivate() {
    if (!this.isActive) return

    this.isActive = false
    document.removeEventListener('keydown', this.handleKeyDown)

    // Restaurer le focus précédent
    if (this.previouslyFocused) {
      this.previouslyFocused.focus()
    }
  }

  destroy() {
    this.deactivate()
  }
}

/**
 * Gestionnaire global des modales accessibles
 */
export class AccessibleModalManager {
  private static instance: AccessibleModalManager
  private activeTrap: FocusTrap | null = null
  private bodyScrollPosition = 0
  private closeCallback: (() => void) | null = null

  static getInstance(): AccessibleModalManager {
    if (!AccessibleModalManager.instance) {
      AccessibleModalManager.instance = new AccessibleModalManager()
    }
    return AccessibleModalManager.instance
  }

  private constructor() {
    this.setupGlobalKeyHandlers()
  }

  private setupGlobalKeyHandlers() {
    document.addEventListener('keydown', (event) => {
      // Fermer la modale active avec Échap
      if (event.key === 'Escape' && this.activeTrap) {
        event.preventDefault()
        event.stopPropagation()

        // Si un callback de fermeture est défini, l'utiliser
        if (this.closeCallback) {
          this.closeCallback()
        } else {
          this.closeActiveModal()
        }
      }
    })
  }

  setCloseCallback(callback: (() => void) | null) {
    this.closeCallback = callback
  }

  openModal(modalElement: HTMLElement) {
    // Sauvegarder la position de scroll
    this.bodyScrollPosition = window.scrollY

    // Empêcher le scroll du body
    document.body.style.position = 'fixed'
    document.body.style.top = `-${this.bodyScrollPosition}px`
    document.body.style.width = '100%'

    // Masquer le contenu pour les lecteurs d'écran
    const mainContent = document.querySelector(
      'main, [role="main"], #main-content'
    )
    if (mainContent) {
      mainContent.setAttribute('aria-hidden', 'true')
    }

    // Configurer les attributs ARIA de la modale
    modalElement.setAttribute('role', 'dialog')
    modalElement.setAttribute('aria-modal', 'true')
    modalElement.setAttribute('aria-hidden', 'false')

    // Activer le focus trap
    if (this.activeTrap) {
      this.activeTrap.destroy()
    }
    this.activeTrap = new FocusTrap(modalElement)
    this.activeTrap.activate()

    // Annoncer l'ouverture de la modale aux lecteurs d'écran
    this.announceToScreenReader('Modale ouverte')
  }

  closeActiveModal() {
    if (this.activeTrap) {
      this.activeTrap.deactivate()
      this.activeTrap = null
    }

    // Restaurer le scroll du body
    document.body.style.position = ''
    document.body.style.top = ''
    document.body.style.width = ''
    window.scrollTo(0, this.bodyScrollPosition)

    // Restaurer l'accès pour les lecteurs d'écran
    const mainContent = document.querySelector(
      'main, [role="main"], #main-content'
    )
    if (mainContent) {
      mainContent.removeAttribute('aria-hidden')
    }

    // Masquer la modale pour les lecteurs d'écran
    const activeModal = document.querySelector(
      '[role="dialog"][aria-modal="true"]'
    )
    if (activeModal) {
      activeModal.setAttribute('aria-hidden', 'true')
      activeModal.removeAttribute('aria-modal')
    }

    // Annoncer la fermeture aux lecteurs d'écran
    this.announceToScreenReader('Modale fermée')
  }

  private announceToScreenReader(message: string) {
    const announcement = document.createElement('div')
    announcement.setAttribute('aria-live', 'polite')
    announcement.setAttribute('aria-atomic', 'true')
    announcement.className = 'sr-only'
    announcement.textContent = message

    document.body.appendChild(announcement)

    // Supprimer l'annonce après un délai
    setTimeout(() => {
      document.body.removeChild(announcement)
    }, 1000)
  }
}

/**
 * Améliorer l'accessibilité d'un bouton
 */
export function enhanceButtonAccessibility(
  button: HTMLButtonElement,
  options: {
    label?: string
    describedBy?: string
    expanded?: boolean
    controls?: string
  } = {}
) {
  if (options.label) {
    button.setAttribute('aria-label', options.label)
  }

  if (options.describedBy) {
    button.setAttribute('aria-describedby', options.describedBy)
  }

  if (typeof options.expanded === 'boolean') {
    button.setAttribute('aria-expanded', options.expanded.toString())
  }

  if (options.controls) {
    button.setAttribute('aria-controls', options.controls)
  }

  // Ajouter la gestion du clavier
  button.addEventListener('keydown', (event) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      button.click()
    }
  })
}

/**
 * Configurer l'accessibilité d'un formulaire
 */
export function enhanceFormAccessibility(form: HTMLFormElement) {
  const inputs = form.querySelectorAll('input, textarea, select')

  inputs.forEach((input) => {
    const htmlInput = input as HTMLInputElement

    // Associer les labels
    const label = form.querySelector(
      `label[for="${htmlInput.id}"]`
    ) as HTMLLabelElement
    if (label && !htmlInput.getAttribute('aria-labelledby')) {
      htmlInput.setAttribute(
        'aria-labelledby',
        label.id || `label-${htmlInput.id}`
      )
      if (!label.id) {
        label.id = `label-${htmlInput.id}`
      }
    }

    // Gérer les messages d'erreur
    const errorElement = form.querySelector(
      `[data-error-for="${htmlInput.id}"]`
    )
    if (errorElement) {
      htmlInput.setAttribute(
        'aria-describedby',
        errorElement.id || `error-${htmlInput.id}`
      )
      if (!errorElement.id) {
        errorElement.id = `error-${htmlInput.id}`
      }
      errorElement.setAttribute('aria-live', 'polite')
    }

    // Marquer les champs requis
    if (htmlInput.hasAttribute('required')) {
      htmlInput.setAttribute('aria-required', 'true')
    }
  })
}

/**
 * Créer un live region pour les annonces dynamiques
 */
export function createLiveRegion(
  type: 'polite' | 'assertive' = 'polite'
): HTMLElement {
  const liveRegion = document.createElement('div')
  liveRegion.setAttribute('aria-live', type)
  liveRegion.setAttribute('aria-atomic', 'true')
  liveRegion.className = 'sr-only'
  document.body.appendChild(liveRegion)
  return liveRegion
}

/**
 * Annoncer un message aux lecteurs d'écran
 */
export function announceToScreenReader(
  message: string,
  type: 'polite' | 'assertive' = 'polite'
) {
  const liveRegion = createLiveRegion(type)
  liveRegion.textContent = message

  setTimeout(() => {
    document.body.removeChild(liveRegion)
  }, 1000)
}
