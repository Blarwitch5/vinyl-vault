import { AccessibleModalManager } from './accessibility-helpers'

// Gestionnaire centralisé des modales avec support d'accessibilité
export class ModalManager {
  private static instance: ModalManager
  private currentModal: string | null = null
  private modals: Map<string, HTMLElement> = new Map()
  private accessibilityManager: AccessibleModalManager

  private constructor() {
    this.accessibilityManager = AccessibleModalManager.getInstance()
  }

  public static getInstance(): ModalManager {
    if (!ModalManager.instance) {
      ModalManager.instance = new ModalManager()
    }
    return ModalManager.instance
  }

  public registerModal(id: string, element: HTMLElement): void {
    this.modals.set(id, element)
    this.setupModalEvents(id, element)
  }

  public openModal(id: string): void {
    // Fermer toute modal ouverte précédemment
    if (this.currentModal && this.currentModal !== id) {
      this.closeModal(this.currentModal)
    }

    const modal = this.modals.get(id)
    if (!modal) {
      console.error(`Modal avec l'ID ${id} non trouvée`)
      return
    }

    // Définir le callback de fermeture pour l'accessibilité
    this.accessibilityManager.setCloseCallback(() => {
      this.closeModal(id)
    })

    // Activer l'accessibilité pour la modal
    this.accessibilityManager.openModal(modal)

    // Émettre l'événement d'ouverture
    modal.dispatchEvent(
      new CustomEvent('modal:open', { detail: { modalId: id } })
    )

    // Afficher la modal
    modal.classList.remove('hidden')
    modal.classList.add('flex', 'modal-opening')

    // Animation d'apparition
    const animation = modal.dataset.animation || 'fade'

    if (animation === 'fade') {
      modal.style.opacity = '0'
      modal.style.transition = 'opacity 250ms ease-out'
      setTimeout(() => {
        modal.style.opacity = '1'
      }, 10)
    } else {
      // Pour scale et slide, les animations sont gérées par CSS
      setTimeout(() => {
        modal.classList.add('modal-opening')
      }, 10)
    }

    this.currentModal = id
  }

  public closeModal(id?: string): void {
    const modalId = id || this.currentModal
    if (!modalId) return

    const modal = this.modals.get(modalId)
    if (!modal) return

    // Émettre l'événement de fermeture
    modal.dispatchEvent(new CustomEvent('modal:close', { detail: { modalId } }))

    // Animation de fermeture
    const animation = modal.dataset.animation || 'fade'

    modal.classList.remove('modal-opening')
    modal.classList.add('modal-closing')

    if (animation === 'fade') {
      modal.style.transition = 'opacity 200ms ease-in'
      modal.style.opacity = '0'
    }

    setTimeout(() => {
      modal.classList.add('hidden')
      modal.classList.remove('flex', 'modal-closing')
      modal.style.transition = ''
      modal.style.opacity = ''

      // Désactiver l'accessibilité pour la modal
      this.accessibilityManager.closeActiveModal()

      // Réinitialiser le callback
      this.accessibilityManager.setCloseCallback(null)

      if (this.currentModal === modalId) {
        this.currentModal = null
      }
    }, 200)
  }

  public closeAllModals(): void {
    this.modals.forEach((_, id) => {
      this.closeModal(id)
    })
  }

  private setupModalEvents(id: string, element: HTMLElement): void {
    // Fermeture au clic sur l'overlay (extérieur de la modal)
    const overlay = element.querySelector(
      '.modal-overlay, [class*="fixed inset-0"]'
    )
    if (overlay) {
      overlay.addEventListener('click', (event) => {
        if (event.target === overlay) {
          this.closeModal(id)
        }
      })
    }

    // Fermeture avec la touche Escape
    const escapeHandler = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && this.currentModal === id) {
        this.closeModal(id)
      }
    }

    element.addEventListener('keydown', escapeHandler)
  }

  public getCurrentModal(): string | null {
    return this.currentModal
  }

  public isModalOpen(): boolean {
    return this.currentModal !== null
  }
}

// Instance globale
export const modalManager = ModalManager.getInstance()
