// Helpers pour les modales selon les règles .cursorrules

import type { ModalEvent } from '../types'

// Fonctions utilitaires au lieu de classes
export const createModalHelper = () => {
  const showSection = (sectionId: string): void => {
    // Cacher toutes les sections
    const sections = [
      'login-required',
      'loading-collections',
      'no-collections',
      'collection-selection',
      'collection-creation',
      'success-message',
    ]

    sections.forEach((id) => {
      document.getElementById(id)?.classList.add('hidden')
    })

    // Afficher la section demandée
    document.getElementById(sectionId)?.classList.remove('hidden')
  }

  const handleEscapeKey = (callback: () => void) => {
    return (event: KeyboardEvent): void => {
      if (event.key === 'Escape') callback()
    }
  }

  const handleOverlayClick = (
    modalElement: HTMLElement,
    callback: () => void
  ) => {
    return (event: MouseEvent): void => {
      if (event.target === modalElement) callback()
    }
  }

  const toggleBodyScroll = (isDisabled: boolean): void => {
    document.body.style.overflow = isDisabled ? 'hidden' : ''
  }

  const focusElement = (elementId: string, delay = 100): void => {
    setTimeout(() => {
      document.getElementById(elementId)?.focus()
    }, delay)
  }

  return {
    showSection,
    handleEscapeKey,
    handleOverlayClick,
    toggleBodyScroll,
    focusElement,
  }
}
