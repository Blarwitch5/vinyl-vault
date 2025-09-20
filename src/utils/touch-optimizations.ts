/**
 * Utilitaires pour optimiser les interactions tactiles sur mobile
 */

// Configuration des optimisations tactiles
export const TOUCH_CONFIG = {
  // Taille minimale des éléments tactiles (44px recommandé par Apple)
  MIN_TOUCH_TARGET: 44,
  LARGE_TOUCH_TARGET: 48,

  // Délais pour les interactions
  TAP_DELAY: 300,
  LONG_PRESS_DELAY: 500,

  // Zones de touch optimisées
  TOUCH_ZONES: {
    SMALL: '44px',
    MEDIUM: '48px',
    LARGE: '56px',
  },
} as const

/**
 * Classe pour gérer les interactions tactiles optimisées
 */
export class TouchOptimizer {
  private longPressTimer: NodeJS.Timeout | null = null
  private touchStartTime = 0
  private touchStartPosition = { x: 0, y: 0 }

  constructor() {
    this.initializeTouchOptimizations()
  }

  /**
   * Initialise les optimisations tactiles globales
   */
  private initializeTouchOptimizations(): void {
    // Optimiser les événements de touch
    this.optimizeTouchEvents()

    // Améliorer les performances tactiles
    this.optimizeTouchPerformance()

    // Gérer les gestes de swipe
    this.initializeSwipeGestures()

    // Optimiser les scrolls
    this.optimizeScrollBehavior()
  }

  /**
   * Optimise les événements de touch
   */
  private optimizeTouchEvents(): void {
    // Prévenir le zoom double-tap sur iOS
    let lastTouchEnd = 0

    document.addEventListener(
      'touchend',
      (event) => {
        const now = Date.now()
        if (now - lastTouchEnd <= 300) {
          event.preventDefault()
        }
        lastTouchEnd = now
      },
      { passive: false }
    )

    // Optimiser les événements de touch pour de meilleures performances
    document.addEventListener(
      'touchstart',
      (event) => {
        this.touchStartTime = Date.now()
        if (event.touches.length === 1) {
          const touch = event.touches[0]
          this.touchStartPosition = { x: touch.clientX, y: touch.clientY }
        }
      },
      { passive: true }
    )

    document.addEventListener(
      'touchmove',
      (event) => {
        // Permettre le scroll natif
      },
      { passive: true }
    )
  }

  /**
   * Optimise les performances tactiles
   */
  private optimizeTouchPerformance(): void {
    // Utiliser will-change pour les éléments interactifs
    const interactiveElements = document.querySelectorAll(
      'button, [role="button"], a, input, select, textarea, [tabindex]'
    )

    interactiveElements.forEach((element) => {
      element.setAttribute('style', 'will-change: transform;')

      // Ajouter des classes pour l'optimisation tactile
      element.classList.add('touch-manipulation')

      // S'assurer que les éléments ont une taille tactile minimale
      this.ensureTouchTargetSize(element as HTMLElement)
    })
  }

  /**
   * S'assure qu'un élément a une taille tactile appropriée
   */
  private ensureTouchTargetSize(element: HTMLElement): void {
    const rect = element.getBoundingClientRect()
    const minSize = TOUCH_CONFIG.MIN_TOUCH_TARGET

    if (rect.width < minSize || rect.height < minSize) {
      element.classList.add('touch-target-small')
    }
  }

  /**
   * Initialise les gestes de swipe
   */
  private initializeSwipeGestures(): void {
    let startX = 0
    let startY = 0
    let startTime = 0

    document.addEventListener(
      'touchstart',
      (event) => {
        if (event.touches.length === 1) {
          startX = event.touches[0].clientX
          startY = event.touches[0].clientY
          startTime = Date.now()
        }
      },
      { passive: true }
    )

    document.addEventListener(
      'touchend',
      (event) => {
        if (!startX || !startY) return

        const endX = event.changedTouches[0].clientX
        const endY = event.changedTouches[0].clientY
        const endTime = Date.now()

        const deltaX = endX - startX
        const deltaY = endY - startY
        const deltaTime = endTime - startTime

        // Détecter les swipes
        if (
          deltaTime < 300 &&
          Math.abs(deltaX) > 50 &&
          Math.abs(deltaY) < 100
        ) {
          const swipeDirection = deltaX > 0 ? 'right' : 'left'
          this.handleSwipe(swipeDirection, event.target as Element)
        }

        if (
          deltaTime < 300 &&
          Math.abs(deltaY) > 50 &&
          Math.abs(deltaX) < 100
        ) {
          const swipeDirection = deltaY > 0 ? 'down' : 'up'
          this.handleSwipe(swipeDirection, event.target as Element)
        }

        // Reset
        startX = 0
        startY = 0
        startTime = 0
      },
      { passive: true }
    )
  }

  /**
   * Gère les gestes de swipe
   */
  private handleSwipe(direction: string, element: Element): void {
    // Déclencher des événements personnalisés pour les swipes
    const swipeEvent = new CustomEvent('swipe', {
      detail: { direction, element },
      bubbles: true,
      cancelable: true,
    })

    element.dispatchEvent(swipeEvent)

    // Actions spécifiques selon la direction
    switch (direction) {
      case 'left':
        this.handleSwipeLeft(element)
        break
      case 'right':
        this.handleSwipeRight(element)
        break
      case 'up':
        this.handleSwipeUp(element)
        break
      case 'down':
        this.handleSwipeDown(element)
        break
    }
  }

  /**
   * Actions pour swipe gauche
   */
  private handleSwipeLeft(element: Element): void {
    // Exemple: fermer une modal, aller à la page suivante
    const closeButton = element.closest('.modal')?.querySelector('[data-close]')
    if (closeButton) {
      ;(closeButton as HTMLElement).click()
    }
  }

  /**
   * Actions pour swipe droite
   */
  private handleSwipeRight(element: Element): void {
    // Exemple: retour, page précédente
    const backButton = element.closest('main')?.querySelector('[data-back]')
    if (backButton) {
      ;(backButton as HTMLElement).click()
    }
  }

  /**
   * Actions pour swipe vers le haut
   */
  private handleSwipeUp(element: Element): void {
    // Exemple: afficher plus d'options
    const expandButton = element.querySelector('[data-expand]')
    if (expandButton) {
      ;(expandButton as HTMLElement).click()
    }
  }

  /**
   * Actions pour swipe vers le bas
   */
  private handleSwipeDown(element: Element): void {
    // Exemple: fermer un menu déroulant
    const closeButton = element.querySelector('[data-collapse]')
    if (closeButton) {
      ;(closeButton as HTMLElement).click()
    }
  }

  /**
   * Optimise le comportement de scroll
   */
  private optimizeScrollBehavior(): void {
    // Améliorer le scroll sur iOS
    document.addEventListener(
      'touchmove',
      (event) => {
        // Permettre le scroll natif pour les éléments scrollables
        const target = event.target as Element
        const scrollableParent =
          target.closest('[data-scrollable]') ||
          target.closest('.overflow-auto') ||
          target.closest('.overflow-y-auto') ||
          target.closest('.overflow-x-auto')

        if (scrollableParent) {
          return // Permettre le scroll natif
        }

        // Pour les autres éléments, prévenir le scroll si nécessaire
        if (target.closest('[data-no-scroll]')) {
          event.preventDefault()
        }
      },
      { passive: false }
    )
  }

  /**
   * Ajoute des optimisations tactiles à un élément spécifique
   */
  public optimizeElement(element: HTMLElement): void {
    // Ajouter les classes d'optimisation
    element.classList.add('touch-manipulation')

    // S'assurer de la taille tactile
    this.ensureTouchTargetSize(element)

    // Ajouter des event listeners pour le feedback tactile
    element.addEventListener('touchstart', this.handleTouchStart.bind(this), {
      passive: true,
    })
    element.addEventListener('touchend', this.handleTouchEnd.bind(this), {
      passive: true,
    })
    element.addEventListener('touchcancel', this.handleTouchCancel.bind(this), {
      passive: true,
    })
  }

  /**
   * Gère le début d'un touch
   */
  private handleTouchStart(event: TouchEvent): void {
    const element = event.currentTarget as HTMLElement
    element.classList.add('touch-active')

    // Démarrer le timer pour long press
    this.longPressTimer = setTimeout(() => {
      this.handleLongPress(element)
    }, TOUCH_CONFIG.LONG_PRESS_DELAY)
  }

  /**
   * Gère la fin d'un touch
   */
  private handleTouchEnd(event: TouchEvent): void {
    const element = event.currentTarget as HTMLElement
    element.classList.remove('touch-active')

    // Annuler le long press si le touch se termine
    if (this.longPressTimer) {
      clearTimeout(this.longPressTimer)
      this.longPressTimer = null
    }
  }

  /**
   * Gère l'annulation d'un touch
   */
  private handleTouchCancel(event: TouchEvent): void {
    const element = event.currentTarget as HTMLElement
    element.classList.remove('touch-active')

    // Annuler le long press
    if (this.longPressTimer) {
      clearTimeout(this.longPressTimer)
      this.longPressTimer = null
    }
  }

  /**
   * Gère un long press
   */
  private handleLongPress(element: HTMLElement): void {
    // Déclencher un événement de long press
    const longPressEvent = new CustomEvent('longpress', {
      detail: { element },
      bubbles: true,
      cancelable: true,
    })

    element.dispatchEvent(longPressEvent)

    // Feedback visuel pour long press
    element.classList.add('long-press-active')
    setTimeout(() => {
      element.classList.remove('long-press-active')
    }, 200)
  }
}

/**
 * Initialise les optimisations tactiles
 */
export function initializeTouchOptimizations(): TouchOptimizer {
  return new TouchOptimizer()
}

/**
 * Utilitaires pour les classes CSS tactiles
 */
export const TouchClasses = {
  // Classes pour les tailles de touch targets
  SMALL: 'touch-target-small',
  MEDIUM: 'touch-target-medium',
  LARGE: 'touch-target-large',

  // Classes pour les états tactiles
  ACTIVE: 'touch-active',
  LONG_PRESS: 'long-press-active',

  // Classes pour l'optimisation
  MANIPULATION: 'touch-manipulation',
  NO_SELECT: 'touch-no-select',
} as const

/**
 * Ajoute les classes CSS nécessaires pour les optimisations tactiles
 * Note: Les styles principaux sont maintenant dans Tailwind config
 */
export function addTouchClasses(): void {
  // Les classes sont maintenant définies dans tailwind.config.js
  // Cette fonction est conservée pour la compatibilité mais ne fait plus rien
  console.log('Touch classes are now handled by Tailwind CSS')
}
